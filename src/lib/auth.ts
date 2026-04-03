import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "om_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  sub: string;
  exp: number;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function createSessionToken(subject: string) {
  const payload: SessionPayload = {
    sub: subject,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");

  const providedSignature = Buffer.from(signature);
  const normalizedExpectedSignature = Buffer.from(expectedSignature);
  if (providedSignature.length !== normalizedExpectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedSignature, normalizedExpectedSignature)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_EMAIL;
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !storedHash) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be configured.");
  }

  if (username !== expectedUsername) {
    return false;
  }

  const [scheme, salt, expectedHex] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !expectedHex) {
    throw new Error("ADMIN_PASSWORD_HASH must be in the format scrypt$salt$hash.");
  }

  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(expectedHex));
}
