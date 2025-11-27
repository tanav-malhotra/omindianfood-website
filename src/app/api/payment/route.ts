import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processToastPayment, NY_TAX_RATE } from '@/lib/toast/payment';
import { OrderDispatcher } from '@/lib/toast/dispatcher';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      type, 
      notes, 
      items, 
      deliveryAddress,
      subtotal,
      tax,
      tip,
      total,
      cardToken
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!cardToken) {
      return NextResponse.json({ error: 'Payment information required' }, { status: 400 });
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Customer information required' }, { status: 400 });
    }

    // Verify totals server-side
    let calculatedSubtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      // For custom items (lunch special, bar, catering), use provided price
      const itemPrice = item.price;
      const lineTotal = itemPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      // Check if menuItemId is a valid UUID (from database) or a custom ID
      const isValidUUID = item.menuItemId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.menuItemId);

      orderItemsData.push({
        menuItemId: isValidUUID ? item.menuItemId : null, // null for custom items
        quantity: item.quantity,
        price: itemPrice,
        name: item.name,
        note: item.note || null
      });
    }

    // Recalculate tax and total server-side
    const calculatedTax = calculatedSubtotal * NY_TAX_RATE;
    const tipAmount = tip || 0;
    const calculatedTotal = calculatedSubtotal + calculatedTax + tipAmount;

    // Allow small floating point differences
    if (Math.abs(calculatedTotal - total) > 0.05) {
      console.warn('Total mismatch:', { client: total, server: calculatedTotal });
      // Use server-calculated total for security
    }

    // Build notes with delivery address if applicable
    let fullNotes = notes || '';
    if (type === 'DELIVERY' && deliveryAddress) {
      const addressStr = `DELIVERY TO: ${deliveryAddress.street}${deliveryAddress.apt ? `, Apt ${deliveryAddress.apt}` : ''}, ${deliveryAddress.city}, NY ${deliveryAddress.zip}`;
      fullNotes = addressStr + (fullNotes ? `\n\n${fullNotes}` : '');
    }

    // Create Order in database first (status: PENDING_PAYMENT)
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        type: type || 'PICKUP',
        notes: fullNotes,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        tip: tipAmount,
        total: calculatedTotal,
        status: 'PENDING_PAYMENT',
        items: {
          create: orderItemsData
        }
      }
    });

    // Process payment via Toast
    const paymentResult = await processToastPayment({
      amount: Math.round(calculatedTotal * 100), // Convert to cents
      tip: Math.round(tipAmount * 100),
      cardToken,
      orderId: order.id,
    });

    if (!paymentResult.success) {
      // Payment failed - update order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_FAILED' }
      });

      return NextResponse.json({ 
        error: paymentResult.error || 'Payment failed. Please try again.' 
      }, { status: 402 });
    }

    // Payment successful - update order with transaction ID
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'PAID',
        transactionId: paymentResult.transactionId
      }
    });

    // Dispatch to Toast for printing (order is already paid)
    try {
      await OrderDispatcher.dispatch(order.id);
    } catch (e) {
      console.error("Failed to dispatch to printer:", e);
      // Don't fail the order - payment went through, we can manually handle printing
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      transactionId: paymentResult.transactionId
    });

  } catch (error) {
    console.error('Payment/order creation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

