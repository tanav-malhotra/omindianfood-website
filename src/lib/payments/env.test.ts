import assert from "node:assert/strict";
import test from "node:test";

import {
  getPaymentProvider,
  getToastRuntimeConfig,
  isToastEnabled,
} from "./env";

const ORIGINAL_ENV = { ...process.env };

function resetEnv(overrides: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV, ...overrides };
}

test("defaults to stripe when USE_TOAST is missing", () => {
  resetEnv({ USE_TOAST: undefined });

  assert.equal(isToastEnabled(), false);
  assert.equal(getPaymentProvider(), "STRIPE");
});

test("uses toast when USE_TOAST is true", () => {
  resetEnv({ USE_TOAST: "true" });

  assert.equal(isToastEnabled(), true);
  assert.equal(getPaymentProvider(), "TOAST");
});

test("returns the configured Toast runtime values", () => {
  resetEnv({
    USE_TOAST: "true",
    TOAST_API_URL: "https://toast.example.com",
    TOAST_CLIENT_ID: "toast-client-id",
    TOAST_CLIENT_SECRET: "toast-client-secret",
    TOAST_RESTAURANT_GUID: "restaurant-guid",
    TOAST_MERCHANT_GUID: "merchant-guid",
    TOAST_RSA_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\\nabc\\n-----END PUBLIC KEY-----",
    TOAST_KEY_ID: "RSA-OAEP-SHA256::toast-key",
    TOAST_PICKUP_DINING_OPTION_GUID: "pickup-guid",
    TOAST_DELIVERY_DINING_OPTION_GUID: "delivery-guid",
  });

  assert.deepEqual(getToastRuntimeConfig(), {
    apiUrl: "https://toast.example.com",
    clientId: "toast-client-id",
    clientSecret: "toast-client-secret",
    restaurantGuid: "restaurant-guid",
    merchantGuid: "merchant-guid",
    rsaPublicKey: "-----BEGIN PUBLIC KEY-----\\nabc\\n-----END PUBLIC KEY-----",
    keyId: "RSA-OAEP-SHA256::toast-key",
    pickupDiningOptionGuid: "pickup-guid",
    deliveryDiningOptionGuid: "delivery-guid",
  });
});

test("throws when Toast is enabled but credentials are missing", () => {
  resetEnv({
    USE_TOAST: "true",
    TOAST_API_URL: "https://toast.example.com",
    TOAST_CLIENT_ID: undefined,
    TOAST_CLIENT_SECRET: undefined,
    TOAST_RESTAURANT_GUID: undefined,
    TOAST_MERCHANT_GUID: undefined,
    TOAST_RSA_PUBLIC_KEY: undefined,
    TOAST_KEY_ID: undefined,
    TOAST_PICKUP_DINING_OPTION_GUID: undefined,
    TOAST_DELIVERY_DINING_OPTION_GUID: undefined,
  });

  assert.throws(() => getToastRuntimeConfig(), /Missing Toast environment variables/);
});
