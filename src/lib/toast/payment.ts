import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { normalizeOrderItems } from "@/lib/order-pricing";
import { getToastRuntimeConfig } from "@/lib/payments/env";
import { getToastMenuItemGuid } from "./menu-map";
import { buildToastAuthorizationPayload, buildToastPaymentReference } from "./payment-flow";

type RequestItem = {
  menuItemId: string;
  quantity: number;
  note?: string;
};

type ToastOrderDraft = {
  customerName?: string;
  customerPhone?: string;
  type?: "PICKUP" | "DELIVERY";
  notes?: string;
  items?: RequestItem[];
  deliveryAddress?: {
    street?: string;
    apt?: string;
    city?: string;
    zip?: string;
  };
  scheduledDateTime?: string;
  tip?: number;
};

type ConfirmToastPaymentInput = {
  orderId: string;
  orderData: ToastOrderDraft;
  encryptedCardData: string;
  cardFirst6: string;
  cardLast4: string;
  postalCode: string;
  country: string;
  originIpAddress: string;
};

function centsToCurrency(amountCents: number) {
  return Number((amountCents / 100).toFixed(2));
}

function buildDeliveryNote(deliveryAddress: ToastOrderDraft["deliveryAddress"]) {
  if (!deliveryAddress?.street || !deliveryAddress.city || !deliveryAddress.zip) {
    return null;
  }

  return `DELIVERY TO: ${deliveryAddress.street}${deliveryAddress.apt ? `, Apt ${deliveryAddress.apt}` : ""}, ${deliveryAddress.city}, NY ${deliveryAddress.zip}`;
}

async function getToastAccessToken() {
  const config = getToastRuntimeConfig();
  const authResponse = await fetch(`${config.apiUrl}/authentication/v1/authentication/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      userAccessType: "TOAST_MACHINE_CLIENT",
    }),
  });

  if (!authResponse.ok) {
    throw new Error(`Toast auth failed: ${authResponse.status} ${authResponse.statusText}`);
  }

  const authData = await authResponse.json();
  const accessToken = authData.token?.accessToken;

  if (!accessToken) {
    throw new Error("Failed to obtain Toast access token.");
  }

  return accessToken as string;
}

function buildToastSelections(items: RequestItem[]) {
  const { normalizedItems } = normalizeOrderItems(items);

  return normalizedItems.map((item, index) => ({
    item: {
      guid: getToastMenuItemGuid(items[index].menuItemId),
    },
    quantity: item.quantity,
  }));
}

function buildToastSpecialInstructions(orderNotes: string | null, items: RequestItem[]) {
  const itemNotes = items
    .filter((item) => item.note?.trim())
    .map((item) => `${item.quantity}x ${item.menuItemId}: ${item.note?.trim()}`);

  return [orderNotes, itemNotes.length > 0 ? `ITEM NOTES:\n${itemNotes.join("\n")}` : null]
    .filter(Boolean)
    .join("\n\n");
}

function buildToastDraftPayload(order: Awaited<ReturnType<typeof prisma.order.findUniqueOrThrow>>, draft: ToastOrderDraft) {
  const config = getToastRuntimeConfig();
  const selections = buildToastSelections(draft.items ?? []);
  const deliveryNote = buildDeliveryNote(draft.deliveryAddress);
  const specialInstructions = buildToastSpecialInstructions(order.notes, draft.items ?? []);

  return {
    externalId: order.id,
    source: "API",
    promisedDate: order.pickupTime?.toISOString(),
    diningOption: {
      guid: order.type === "DELIVERY" ? config.deliveryDiningOptionGuid : config.pickupDiningOptionGuid,
    },
    deliveryInfo:
      order.type === "DELIVERY" && draft.deliveryAddress
        ? {
            address1: draft.deliveryAddress.street,
            address2: draft.deliveryAddress.apt || undefined,
            city: draft.deliveryAddress.city,
            state: "NY",
            zipCode: draft.deliveryAddress.zip,
            notes: deliveryNote ?? undefined,
          }
        : undefined,
    checks: [
      {
        externalId: order.id,
        customer: {
          firstName: order.customerName.split(" ")[0],
          lastName: order.customerName.split(" ").slice(1).join(" ") || "Guest",
          phone: order.customerPhone,
        },
        selections,
        payments: [] as Array<{
          guid: string;
          type: string;
          amount: number;
          tipAmount: number;
          paidDate: string;
        }>,
      },
    ],
    specialInstructions: specialInstructions || undefined,
  };
}

async function getPricedToastOrder(accessToken: string, order: Awaited<ReturnType<typeof prisma.order.findUniqueOrThrow>>, draft: ToastOrderDraft) {
  const config = getToastRuntimeConfig();
  const pricingPayload = buildToastDraftPayload(order, draft);
  const response = await fetch(`${config.apiUrl}/orders/v2/prices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Toast-Restaurant-External-ID": config.restaurantGuid,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pricingPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Toast pricing failed: ${response.status} ${errorText}`);
  }

  const pricedOrder = await response.json();
  const pricedCheck = pricedOrder.checks?.[0];

  if (!pricedCheck || typeof pricedCheck.totalAmount !== "number") {
    throw new Error("Toast pricing did not return a check total.");
  }

  return pricedOrder;
}

async function authorizeToastPayment(
  accessToken: string,
  order: Awaited<ReturnType<typeof prisma.order.findUniqueOrThrow>>,
  amountCents: number,
  tipCents: number,
  input: ConfirmToastPaymentInput,
) {
  const config = getToastRuntimeConfig();
  const paymentGuid = crypto.randomUUID();
  const authorizationPayload = buildToastAuthorizationPayload({
    encryptedCardData: input.encryptedCardData,
    keyId: config.keyId,
    amountCents,
    tipCents,
    cardNumberOrigin: "END_USER",
    willSaveCard: false,
    requestMetadata: {
      originIpAddress: input.originIpAddress,
      localTransactionDate: new Date().toISOString(),
      partnerInstanceId: "om-indian-restaurant",
      cardFirst6: input.cardFirst6,
      cardLast4: input.cardLast4,
      postalCode: input.postalCode,
      country: input.country,
      guestIdentifier: order.customerPhone,
    },
  });

  const response = await fetch(
    `${config.apiUrl}/ccpartner/v1/merchants/${config.merchantGuid}/payments/${paymentGuid}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Toast-Restaurant-External-ID": config.restaurantGuid,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authorizationPayload),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Toast payment authorization failed: ${response.status} ${errorText}`);
  }

  return paymentGuid;
}

async function submitToastOrder(
  accessToken: string,
  order: Awaited<ReturnType<typeof prisma.order.findUniqueOrThrow>>,
  draft: ToastOrderDraft,
  paymentGuid: string,
  amountCents: number,
  tipCents: number,
) {
  const config = getToastRuntimeConfig();
  const payload = buildToastDraftPayload(order, draft);
  payload.checks[0].payments = [
    buildToastPaymentReference({
      paymentGuid,
      amountCents,
      tipCents,
      paidDate: new Date().toISOString(),
    }),
  ];

  const response = await fetch(`${config.apiUrl}/orders/v2/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Toast-Restaurant-External-ID": config.restaurantGuid,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Toast order submission failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function loadOrder(orderId: string) {
  return prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });
}

function validateToastDraft(order: Awaited<ReturnType<typeof loadOrder>>, draft: ToastOrderDraft) {
  const normalizedDraft = normalizeOrderItems(draft.items ?? []);
  const expectedSubtotal = Number(order.subtotal ?? 0);
  const expectedTax = Number(order.tax ?? 0);
  const expectedTip = Number(order.tip ?? 0);

  if (draft.customerName?.trim() !== order.customerName || draft.customerPhone?.trim() !== order.customerPhone) {
    throw new Error("Toast payment details no longer match the saved order.");
  }

  if ((draft.type || "PICKUP") !== order.type) {
    throw new Error("Toast payment order type does not match the saved order.");
  }

  if (normalizedDraft.subtotal !== expectedSubtotal || normalizedDraft.tax !== expectedTax) {
    throw new Error("Toast payment totals no longer match the saved order.");
  }

  if (Number((draft.tip ?? 0).toFixed(2)) !== expectedTip) {
    throw new Error("Toast payment tip no longer matches the saved order.");
  }

  const draftItems = normalizedDraft.normalizedItems.map((item) => ({
    quantity: item.quantity,
    price: item.price,
    name: item.name,
    note: item.note,
  }));

  const orderItems = order.items.map((item) => ({
    quantity: item.quantity,
    price: Number(item.price),
    name: item.name,
    note: item.note,
  }));

  if (JSON.stringify(draftItems) !== JSON.stringify(orderItems)) {
    throw new Error("Toast payment items no longer match the saved order.");
  }
}

export async function confirmToastPayment(input: ConfirmToastPaymentInput) {
  const order = await loadOrder(input.orderId);
  validateToastDraft(order, input.orderData);

  const accessToken = await getToastAccessToken();
  const pricedOrder = await getPricedToastOrder(accessToken, order, input.orderData);
  const pricedCheck = pricedOrder.checks[0];
  const amountCents = Math.round(Number(pricedCheck.totalAmount) * 100);
  const tipCents = Math.round(Number(order.tip ?? 0) * 100);
  const paymentGuid = await authorizeToastPayment(accessToken, order, amountCents, tipCents, input);
  const toastOrder = await submitToastOrder(accessToken, order, input.orderData, paymentGuid, amountCents, tipCents);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      transactionId: paymentGuid,
      notes: order.notes
        ? `${order.notes}\n\nToast Order ID: ${toastOrder.guid ?? toastOrder.orderGuid ?? ""}`.trim()
        : `Toast Order ID: ${toastOrder.guid ?? toastOrder.orderGuid ?? ""}`.trim(),
    },
  });

  return {
    orderId: order.id,
    transactionId: paymentGuid,
    toastOrderId: toastOrder.guid ?? toastOrder.orderGuid ?? null,
  };
}

