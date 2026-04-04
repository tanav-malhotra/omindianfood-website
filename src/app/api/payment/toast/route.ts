import { NextResponse } from "next/server";

import { confirmToastPayment } from "@/lib/toast/payment";

export const runtime = "nodejs";

function getOriginIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }

  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await confirmToastPayment({
      orderId: body.orderId,
      orderData: body.orderData,
      encryptedCardData: body.encryptedCardData,
      cardFirst6: body.cardFirst6,
      cardLast4: body.cardLast4,
      postalCode: body.postalCode,
      country: body.country || "US",
      originIpAddress: getOriginIpAddress(request),
    });

    return NextResponse.json({
      orderId: result.orderId,
      transactionId: result.transactionId,
      successUrl: `/order/success?order_id=${result.orderId}`,
      toastOrderId: result.toastOrderId,
    });
  } catch (error) {
    console.error("Toast payment confirmation failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Toast payment confirmation failed.",
      },
      { status: 500 },
    );
  }
}
