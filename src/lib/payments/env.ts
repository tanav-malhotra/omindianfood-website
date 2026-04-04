export type PaymentProvider = "STRIPE" | "TOAST";

type ToastRuntimeConfig = {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  restaurantGuid: string;
  merchantGuid: string;
  rsaPublicKey: string;
  keyId: string;
  pickupDiningOptionGuid: string;
  deliveryDiningOptionGuid: string;
};

const TOAST_ENV_KEYS = [
  "TOAST_API_URL",
  "TOAST_CLIENT_ID",
  "TOAST_CLIENT_SECRET",
  "TOAST_RESTAURANT_GUID",
  "TOAST_MERCHANT_GUID",
  "TOAST_RSA_PUBLIC_KEY",
  "TOAST_KEY_ID",
  "TOAST_PICKUP_DINING_OPTION_GUID",
  "TOAST_DELIVERY_DINING_OPTION_GUID",
] as const;

function normalizeBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function isToastEnabled() {
  return normalizeBoolean(process.env.USE_TOAST);
}

export function getPaymentProvider(): PaymentProvider {
  return isToastEnabled() ? "TOAST" : "STRIPE";
}

export function getToastRuntimeConfig(): ToastRuntimeConfig {
  const missingKeys = TOAST_ENV_KEYS.filter((key) => !process.env[key]?.trim());

  if (missingKeys.length > 0) {
    throw new Error(`Missing Toast environment variables: ${missingKeys.join(", ")}`);
  }

  return {
    apiUrl: process.env.TOAST_API_URL!.trim(),
    clientId: process.env.TOAST_CLIENT_ID!.trim(),
    clientSecret: process.env.TOAST_CLIENT_SECRET!.trim(),
    restaurantGuid: process.env.TOAST_RESTAURANT_GUID!.trim(),
    merchantGuid: process.env.TOAST_MERCHANT_GUID!.trim(),
    rsaPublicKey: process.env.TOAST_RSA_PUBLIC_KEY!.trim(),
    keyId: process.env.TOAST_KEY_ID!.trim(),
    pickupDiningOptionGuid: process.env.TOAST_PICKUP_DINING_OPTION_GUID!.trim(),
    deliveryDiningOptionGuid: process.env.TOAST_DELIVERY_DINING_OPTION_GUID!.trim(),
  };
}
