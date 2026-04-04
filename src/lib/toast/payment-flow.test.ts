import assert from "node:assert/strict";
import test from "node:test";

import {
  buildToastAuthorizationPayload,
  buildToastPaymentReference,
} from "./payment-flow";

test("builds the Toast authorization payload with required metadata", () => {
  const payload = buildToastAuthorizationPayload({
    encryptedCardData: "encrypted-payload",
    keyId: "RSA-OAEP-SHA256::toast-key",
    amountCents: 1825,
    tipCents: 300,
    cardNumberOrigin: "END_USER",
    willSaveCard: false,
    requestMetadata: {
      originIpAddress: "203.0.113.42",
      localTransactionDate: "2026-04-05T12:30:00.000Z",
      partnerInstanceId: "om-indian-restaurant",
      cardFirst6: "424242",
      cardLast4: "4242",
      postalCode: "10028",
      country: "US",
      guestIdentifier: "2125551212",
    },
  });

  assert.deepEqual(payload, {
    encryptedCardData: "encrypted-payload",
    keyId: "RSA-OAEP-SHA256::toast-key",
    amount: 18.25,
    tipAmount: 3,
    cardNumberOrigin: "END_USER",
    willSaveCard: false,
    requestMetadata: {
      originIPAddr: "203.0.113.42",
      localTransactionDate: "2026-04-05T12:30:00.000Z",
      partnerServiceInfo: {
        instanceId: "om-indian-restaurant",
      },
      cardFirst6: "424242",
      cardLast4: "4242",
      billingAddress: {
        postalCode: "10028",
        country: "US",
      },
      guestIdentifier: "2125551212",
    },
  });
});

test("builds a Toast payment reference for order submission", () => {
  assert.deepEqual(
    buildToastPaymentReference({
      paymentGuid: "payment-guid",
      amountCents: 1825,
      tipCents: 300,
      paidDate: "2026-04-05T12:30:00.000Z",
    }),
    {
      guid: "payment-guid",
      type: "CREDIT",
      amount: 18.25,
      tipAmount: 3,
      paidDate: "2026-04-05T12:30:00.000Z",
    },
  );
});
