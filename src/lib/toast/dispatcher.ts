import { Order, OrderItem } from "@prisma/client";
import { prisma } from "../prisma";

// Abstract dispatcher for pluggable channels
export class OrderDispatcher {
  static async dispatch(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new Error("Order not found");

    const results = await Promise.allSettled([
      this.dispatchToToast(order),
      // this.dispatchToEmail(order), // Fallback/Notification
    ]);

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Dispatch channel ${index} failed:`, result.reason);
      }
    });

    // Keep PAID as the first staff-visible post-payment state in the dashboard.
    if (results[0].status === 'fulfilled') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });
    }
  }

  // Toast Integration - Creates order in Toast which triggers kitchen printer
  private static async dispatchToToast(order: Order & { items: OrderItem[] }) {
    const TOAST_API_URL = process.env.TOAST_API_URL;
    const TOAST_RESTAURANT_GUID = process.env.TOAST_RESTAURANT_GUID;
    const TOAST_CLIENT_ID = process.env.TOAST_CLIENT_ID;
    const TOAST_CLIENT_SECRET = process.env.TOAST_CLIENT_SECRET;

    if (!TOAST_API_URL || !TOAST_RESTAURANT_GUID || !TOAST_CLIENT_ID || !TOAST_CLIENT_SECRET) {
      console.warn("Toast configuration missing. Skipping dispatch to Toast.");
      console.log("Order would be sent:", {
        orderId: order.id,
        customer: order.customerName,
        items: order.items.length,
        total: Number(order.total)
      });
      return true; // Don't fail in dev mode
    }

    console.log(`Dispatching Order ${order.id} to Toast...`);

    try {
      // Step 1: Get OAuth token
      const authResponse = await fetch(`${TOAST_API_URL}/authentication/v1/authentication/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: TOAST_CLIENT_ID,
          clientSecret: TOAST_CLIENT_SECRET,
          userAccessType: 'TOAST_MACHINE_CLIENT'
        })
      });

      if (!authResponse.ok) {
        throw new Error(`Toast auth failed: ${authResponse.statusText}`);
      }

      const authData = await authResponse.json();
      const accessToken = authData.token?.accessToken;

      if (!accessToken) {
        throw new Error('Failed to obtain Toast access token');
      }

      // Step 2: Create order in Toast
      // Toast will automatically print to kitchen printer based on restaurant settings
      const orderPayload = {
        entityType: "Order",
        externalId: order.id,
        source: "Online",
        restaurantGuid: TOAST_RESTAURANT_GUID,
        diningOption: order.type === 'DELIVERY' ? 'DELIVERY' : 'TAKE_OUT',
        customer: {
          firstName: order.customerName.split(' ')[0],
          lastName: order.customerName.split(' ').slice(1).join(' ') || 'Guest',
          phone: order.customerPhone,
        },
        checks: [
          {
            displayNumber: order.id.slice(0, 8).toUpperCase(),
            customer: {
              firstName: order.customerName.split(' ')[0],
              lastName: order.customerName.split(' ').slice(1).join(' ') || 'Guest',
              phone: order.customerPhone
            },
            selections: order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price),
              modifiers: item.note ? [
                {
                  name: "Special Instructions",
                  displayName: item.note
                }
              ] : []
            })),
            // Payment already processed - mark as paid
            payments: [
              {
                type: "OTHER",
                amount: Number(order.total),
                tipAmount: 0, // Tip is included in total
                paymentStatus: "CAPTURED",
                otherPayment: {
                  type: "ONLINE_PREPAID"
                }
              }
            ],
            amount: Number(order.total),
            totalAmount: Number(order.total),
          }
        ],
        // Include order notes
        specialInstructions: order.notes || undefined
      };

      const orderResponse = await fetch(`${TOAST_API_URL}/orders/v2/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Toast-Restaurant-External-ID': TOAST_RESTAURANT_GUID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(`Toast API Error: ${orderResponse.statusText} - ${JSON.stringify(errorData)}`);
      }

      const orderData = await orderResponse.json();
      console.log(`Order ${order.id} successfully sent to Toast. Toast GUID: ${orderData.guid}`);

      // Store Toast order GUID in our database for reference
      await prisma.order.update({
        where: { id: order.id },
        data: {
          notes: order.notes + `\n\nToast Order ID: ${orderData.guid}`
        }
      });

      return true;

    } catch (error) {
      console.error('Toast dispatch error:', error);
      throw error;
    }
  }

  // Optional: Email notification fallback
  private static async dispatchToEmail(order: Order & { items: OrderItem[] }) {
    // Could implement email notification here as backup
    // For now, just log
    console.log(`Email notification would be sent for order ${order.id}`);
    return true;
  }
}
