import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CHECKMATE_TOKEN_ID = "checkmate";
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

type CheckmateConfig = {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  orderSource: string;
  locationId: number;
  locationName: string;
  timezone: string;
  menuItemMap: Record<string, string>;
};

type OrderWithItems = Order & {
  items: OrderItem[];
};

type CheckmateTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  created_at?: number;
};

function normalizeBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function isCheckmateEnabled() {
  return normalizeBoolean(process.env.CHECKMATE_ENABLED);
}

function requiredEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing Checkmate environment variable: ${key}`);
  }
  return value;
}

function parseJsonMap(value: string | undefined) {
  if (!value?.trim()) {
    return {};
  }

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("CHECKMATE_MENU_ITEM_MAP_JSON must be a JSON object.");
  }

  return parsed as Record<string, string>;
}

function getCheckmateConfig(): CheckmateConfig {
  const locationId = Number(requiredEnv("CHECKMATE_LOCATION_ID"));
  if (!Number.isInteger(locationId)) {
    throw new Error("CHECKMATE_LOCATION_ID must be an integer.");
  }

  return {
    apiBaseUrl: (process.env.CHECKMATE_API_BASE_URL || "https://sandbox-api.itsacheckmate.com").replace(/\/+$/, ""),
    clientId: requiredEnv("CHECKMATE_CLIENT_ID"),
    clientSecret: requiredEnv("CHECKMATE_CLIENT_SECRET"),
    orderSource: requiredEnv("CHECKMATE_ORDER_SOURCE"),
    locationId,
    locationName: process.env.CHECKMATE_LOCATION_NAME?.trim() || "Om Indian Restaurant",
    timezone: process.env.CHECKMATE_TIMEZONE?.trim() || process.env.NEXT_PUBLIC_TIMEZONE?.trim() || "America/New_York",
    menuItemMap: parseJsonMap(process.env.CHECKMATE_MENU_ITEM_MAP_JSON),
  };
}

function getSeedExpiry() {
  const value = process.env.CHECKMATE_ACCESS_TOKEN_EXPIRES_AT?.trim();
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function seedTokenFromEnv() {
  const accessToken = process.env.CHECKMATE_ACCESS_TOKEN?.trim() || null;
  const refreshToken = process.env.CHECKMATE_REFRESH_TOKEN?.trim() || null;

  if (!accessToken && !refreshToken) {
    return null;
  }

  return prisma.integrationToken.upsert({
    where: { id: CHECKMATE_TOKEN_ID },
    create: {
      id: CHECKMATE_TOKEN_ID,
      accessToken,
      refreshToken,
      expiresAt: getSeedExpiry(),
    },
    update: {
      accessToken,
      refreshToken,
      expiresAt: getSeedExpiry(),
    },
  });
}

async function refreshAccessToken(config: CheckmateConfig, refreshToken: string) {
  const response = await fetch(`${config.apiBaseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Checkmate token refresh failed (${response.status}): ${text}`);
  }

  const data = JSON.parse(text) as CheckmateTokenResponse;
  if (!data.access_token) {
    throw new Error("Checkmate token refresh did not return an access token.");
  }

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 7200;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await prisma.integrationToken.upsert({
    where: { id: CHECKMATE_TOKEN_ID },
    create: {
      id: CHECKMATE_TOKEN_ID,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt,
    },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt,
    },
  });

  return data.access_token;
}

async function getAccessToken(config: CheckmateConfig) {
  const token = await prisma.integrationToken.findUnique({ where: { id: CHECKMATE_TOKEN_ID } })
    || await seedTokenFromEnv();

  if (
    token?.accessToken
    && token.expiresAt
    && token.expiresAt.getTime() > Date.now() + TOKEN_EXPIRY_BUFFER_MS
  ) {
    return token.accessToken;
  }

  const refreshToken = token?.refreshToken || process.env.CHECKMATE_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    throw new Error("Missing Checkmate refresh token.");
  }

  return refreshAccessToken(config, refreshToken);
}

async function activateLocation(config: CheckmateConfig, accessToken: string) {
  const response = await fetch(`${config.apiBaseUrl}/api/v2/activate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Checkmate location activation failed (${response.status}): ${text}`);
  }
}

function toCents(value: unknown) {
  return Math.round(Number(value || 0) * 100);
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Guest",
    lastName: parts.slice(1).join(" "),
  };
}

function buildCheckmatePayload(order: OrderWithItems, config: CheckmateConfig) {
  const { firstName, lastName } = splitName(order.customerName);
  const isDelivery = order.type === "DELIVERY";

  return {
    order: {
      meta: {
        id: order.id,
        type: isDelivery ? "restaurant_delivery" : "pick_up",
        notes: order.notes || undefined,
        requested_at: order.pickupTime ? order.pickupTime.toISOString() : null,
      },
      location: {
        id: config.locationId,
        name: config.locationName,
        timezone: config.timezone,
      },
      customer: {
        first_name: firstName,
        last_name: lastName || undefined,
        phone: order.customerPhone,
      },
      items: order.items.map((item) => ({
        id: item.menuItemId ? config.menuItemMap[item.menuItemId] : undefined,
        name: item.name,
        price: toCents(item.price),
        quantity: item.quantity,
        special_request: item.note || undefined,
      })),
      payment: {
        cash_payment: false,
        tip: toCents(order.tip),
        service_fees: [],
        discounts: [],
      },
    },
  };
}

async function appendOrderNote(orderId: string, note: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { notes: true },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      notes: order?.notes ? `${order.notes}\n\n${note}` : note,
    },
  });
}

export async function submitPaidOrderToCheckmate(orderId: string) {
  if (!isCheckmateEnabled()) {
    return { skipped: true };
  }

  const config = getCheckmateConfig();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found for Checkmate submission.`);
  }

  if (order.status === "SENT_TO_CHECKMATE") {
    return { skipped: true };
  }

  const accessToken = await getAccessToken(config);
  await activateLocation(config, accessToken);

  const response = await fetch(`${config.apiBaseUrl}/api/v2/orders/${encodeURIComponent(config.orderSource)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildCheckmatePayload(order, config)),
  });

  const text = await response.text();
  if (!response.ok) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CHECKMATE_FAILED" },
    });
    throw new Error(`Checkmate order submit failed (${response.status}): ${text}`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "SENT_TO_CHECKMATE" },
  });
  await appendOrderNote(orderId, `Checkmate submitted at ${new Date().toISOString()}`);

  return { skipped: false };
}
