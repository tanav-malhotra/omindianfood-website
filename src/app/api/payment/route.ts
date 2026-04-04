import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeOrderItems } from "@/lib/order-pricing";
import { getBaseUrl, getStripe } from "@/lib/stripe";
import { parseRestaurantLocalDateTime } from "@/lib/timezone";

export const runtime = "nodejs";

type RequestItem = {
  menuItemId: string;
  quantity: number;
  note?: string;
};

export async function POST(request: Request) {
  let orderId: string | null = null;

  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      type,
      notes,
      items,
      deliveryAddress,
      tip,
      scheduledDateTime,
    }: {
      customerName?: string;
      customerPhone?: string;
      type?: "PICKUP" | "DELIVERY";
      notes?: string;
      items?: RequestItem[];
      deliveryAddress?: {
        street?: string;
        apt?: string;
        city?: string;
        zip?: string;
      };
      tip?: number;
      scheduledDateTime?: string;
    } = body;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json({ error: "Customer information is required." }, { status: 400 });
    }

    if (!items?.length) {
      return NextResponse.json({ error: "No items in order." }, { status: 400 });
    }

    const hasCateringItems = items.some((item) => item.menuItemId.startsWith("catering-"));
    const hasTakeoutItems = items.some((item) => !item.menuItemId.startsWith("catering-"));
    if (hasCateringItems && hasTakeoutItems) {
      return NextResponse.json(
        { error: "Catering and takeout items must be placed as separate orders." },
        { status: 400 },
      );
    }

    if (type === "DELIVERY") {
      if (!deliveryAddress?.street || !deliveryAddress.city || !deliveryAddress.zip) {
        return NextResponse.json({ error: "Delivery address is incomplete." }, { status: 400 });
      }
    }

    let scheduledFor: Date | null = null;
    if (hasCateringItems) {
      if (!scheduledDateTime) {
        return NextResponse.json(
          { error: "Catering orders require a scheduled date and time." },
          { status: 400 },
        );
      }

      scheduledFor = parseRestaurantLocalDateTime(scheduledDateTime);
      const minScheduledTime = new Date(Date.now() + 1000 * 60 * 60 * 24);
      if (Number.isNaN(scheduledFor.getTime()) || scheduledFor < minScheduledTime) {
        return NextResponse.json(
          { error: "Catering orders must be scheduled at least 24 hours in advance." },
          { status: 400 },
        );
      }
    }

    const { normalizedItems, subtotal, tax } = normalizeOrderItems(items);
    const tipAmount = typeof tip === "number" && tip > 0 ? Number(tip.toFixed(2)) : 0;
    const total = Number((subtotal + tax + tipAmount).toFixed(2));

    let fullNotes = notes?.trim() || "";
    if (type === "DELIVERY" && deliveryAddress) {
      const deliveryLine = `DELIVERY TO: ${deliveryAddress.street}${deliveryAddress.apt ? `, Apt ${deliveryAddress.apt}` : ""}, ${deliveryAddress.city}, NY ${deliveryAddress.zip}`;
      fullNotes = fullNotes ? `${deliveryLine}\n\n${fullNotes}` : deliveryLine;
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        type: type || "PICKUP",
        notes: fullNotes || null,
        pickupTime: scheduledFor,
        subtotal,
        tax,
        tip: tipAmount,
        total,
        status: "PENDING_PAYMENT",
        items: {
          create: normalizedItems,
        },
      },
    });
    orderId = order.id;

    const stripe = getStripe();
    const baseUrl = getBaseUrl();
    const lineItems: Array<{
      price_data: {
        currency: "usd";
        product_data: {
          name: string;
          description?: string;
        };
        unit_amount: number;
      };
      quantity: number;
    }> = normalizedItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.note || undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "NY Sales Tax",
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    if (tipAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tip",
          },
          unit_amount: Math.round(tipAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/order/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order?checkout=cancelled`,
      submit_type: "pay",
      line_items: lineItems,
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        orderType: type || "PICKUP",
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe checkout session did not return a URL.");
    }

    if (tipAmount > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          notes: fullNotes
            ? `${fullNotes}\n\nTip: $${tipAmount.toFixed(2)}`
            : `Tip: $${tipAmount.toFixed(2)}`,
        },
      });
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout session creation failed:", error);
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAYMENT_FAILED" },
      }).catch(() => undefined);
    }
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
