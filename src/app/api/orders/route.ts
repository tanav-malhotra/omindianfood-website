import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct order creation is disabled. Use the checkout flow instead." },
    { status: 410 },
  );
}
