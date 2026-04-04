type CardNumberOrigin = "END_USER" | "PARTNER_VAULT";

type ToastAuthorizationMetadataInput = {
  originIpAddress: string;
  localTransactionDate: string;
  partnerInstanceId: string;
  cardFirst6: string;
  cardLast4: string;
  postalCode: string;
  country: string;
  guestIdentifier: string;
};

type BuildToastAuthorizationPayloadInput = {
  encryptedCardData: string;
  keyId: string;
  amountCents: number;
  tipCents: number;
  cardNumberOrigin: CardNumberOrigin;
  willSaveCard: boolean;
  requestMetadata: ToastAuthorizationMetadataInput;
};

type BuildToastPaymentReferenceInput = {
  paymentGuid: string;
  amountCents: number;
  tipCents: number;
  paidDate: string;
};

function centsToCurrency(amountCents: number) {
  return Number((amountCents / 100).toFixed(2));
}

export function buildToastAuthorizationPayload(input: BuildToastAuthorizationPayloadInput) {
  return {
    encryptedCardData: input.encryptedCardData,
    keyId: input.keyId,
    amount: centsToCurrency(input.amountCents),
    tipAmount: centsToCurrency(input.tipCents),
    cardNumberOrigin: input.cardNumberOrigin,
    willSaveCard: input.willSaveCard,
    requestMetadata: {
      originIPAddr: input.requestMetadata.originIpAddress,
      localTransactionDate: input.requestMetadata.localTransactionDate,
      partnerServiceInfo: {
        instanceId: input.requestMetadata.partnerInstanceId,
      },
      cardFirst6: input.requestMetadata.cardFirst6,
      cardLast4: input.requestMetadata.cardLast4,
      billingAddress: {
        postalCode: input.requestMetadata.postalCode,
        country: input.requestMetadata.country,
      },
      guestIdentifier: input.requestMetadata.guestIdentifier,
    },
  };
}

export function buildToastPaymentReference(input: BuildToastPaymentReferenceInput) {
  return {
    guid: input.paymentGuid,
    type: "CREDIT",
    amount: centsToCurrency(input.amountCents),
    tipAmount: centsToCurrency(input.tipCents),
    paidDate: input.paidDate,
  };
}
