import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { isCheckmateEnabled, submitPaidOrderToCheckmate } from "@/lib/checkmate";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

async function updateOrderStatus(orderId: string | undefined, data: { status: string; transactionId?: string }) {
  if (!orderId) {
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: data.status,
      transactionId: data.transactionId,
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return;
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (existingOrder?.status === "SENT_TO_CHECKMATE") {
    return;
  }

  await updateOrderStatus(orderId, {
    status: "PAID",
    transactionId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
  });

  if (isCheckmateEnabled()) {
    await submitPaidOrderToCheckmate(orderId);
  }
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json({ error: "Invalid webhook event." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await updateOrderStatus(session.metadata?.orderId, {
          status: "CANCELLED",
        });
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await updateOrderStatus(session.metadata?.orderId, {
          status: "PAYMENT_FAILED",
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
