import assert from "node:assert/strict";
import test from "node:test";

import { routePaymentByProvider } from "./provider";

test("routes to Stripe when the provider is STRIPE", async () => {
  const events: string[] = [];

  const result = await routePaymentByProvider(
    "STRIPE",
    async () => {
      events.push("stripe");
      return { provider: "STRIPE", checkoutUrl: "https://checkout.stripe.test", orderId: "order-1" };
    },
    async () => {
      events.push("toast");
      return { provider: "TOAST", orderId: "order-1", amountCents: 1099, tipCents: 200, publicKey: "key", keyId: "id" };
    },
  );

  assert.deepEqual(events, ["stripe"]);
  assert.deepEqual(result, {
    provider: "STRIPE",
    checkoutUrl: "https://checkout.stripe.test",
    orderId: "order-1",
  });
});

test("routes to Toast when the provider is TOAST", async () => {
  const events: string[] = [];

  const result = await routePaymentByProvider(
    "TOAST",
    async () => {
      events.push("stripe");
      return { provider: "STRIPE", checkoutUrl: "https://checkout.stripe.test", orderId: "order-1" };
    },
    async () => {
      events.push("toast");
      return { provider: "TOAST", orderId: "order-1", amountCents: 1099, tipCents: 200, publicKey: "key", keyId: "id" };
    },
  );

  assert.deepEqual(events, ["toast"]);
  assert.deepEqual(result, {
    provider: "TOAST",
    orderId: "order-1",
    amountCents: 1099,
    tipCents: 200,
    publicKey: "key",
    keyId: "id",
  });
});
