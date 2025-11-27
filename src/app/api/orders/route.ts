import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, type, notes, items, deliveryAddress } = body;

    // Validate
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Calculate total and build items for Prisma
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) continue;

      const lineTotal = Number(menuItem.price) * item.quantity;
      calculatedTotal += lineTotal;

      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        name: menuItem.name,
        note: item.note || ''
      });
    }

    // Build notes with delivery address if applicable
    let fullNotes = notes || '';
    if (type === 'DELIVERY' && deliveryAddress) {
      const addressStr = `DELIVERY TO: ${deliveryAddress.street}${deliveryAddress.apt ? `, Apt ${deliveryAddress.apt}` : ''}, ${deliveryAddress.city}, NY ${deliveryAddress.zip}`;
      fullNotes = addressStr + (fullNotes ? `\n\n${fullNotes}` : '');
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        type: type || 'PICKUP',
        notes: fullNotes,
        total: calculatedTotal,
        items: {
          create: orderItemsData
        }
      }
    });

    // Dispatch to Printer/Toast Integration Layer
    try {
      // Dynamic import to avoid circular deps if any, though strictly not needed here
      const { OrderDispatcher } = await import('@/lib/toast/dispatcher');
      // Fire and forget to not block response
      OrderDispatcher.dispatch(order.id).catch(err => console.error("Background dispatch error:", err));
    } catch (e) {
      console.error("Failed to init dispatch:", e);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

