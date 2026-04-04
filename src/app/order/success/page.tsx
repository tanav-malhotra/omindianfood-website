import { SuccessClient } from "./SuccessClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed - OM Indian Restaurant",
  robots: {
    index: false,
    follow: false,
  },
};

type SuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
  }>;
};

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderLabel = resolvedSearchParams.order_id?.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-[70vh] bg-stone-100 px-4 py-16">
      <SuccessClient />
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Received</h1>
        <p className="mt-3 text-gray-600">
          Your order has been confirmed and sent to the kitchen. We&rsquo;ll have it ready for you shortly.
        </p>
        {orderLabel ? (
          <p className="mt-4 rounded-lg bg-stone-100 px-4 py-3 text-sm text-gray-700">
            Order reference: <span className="font-semibold">{orderLabel}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
