import type { PaymentProvider } from "./env";

export type StripePaymentStartResult = {
  provider: "STRIPE";
  checkoutUrl: string;
  orderId: string;
};

export type ToastPaymentStartResult = {
  provider: "TOAST";
  orderId: string;
  amountCents: number;
  tipCents: number;
  publicKey: string;
  keyId: string;
};

export type PaymentStartResult = StripePaymentStartResult | ToastPaymentStartResult;

export async function routePaymentByProvider(
  provider: PaymentProvider,
  stripeHandler: () => Promise<StripePaymentStartResult>,
  toastHandler: () => Promise<ToastPaymentStartResult>,
): Promise<PaymentStartResult> {
  if (provider === "TOAST") {
    return toastHandler();
  }

  return stripeHandler();
}
