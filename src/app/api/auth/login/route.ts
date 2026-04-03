import { createSessionToken, getSessionCookieName, verifyAdminCredentials } from "@/lib/auth";
import { NextResponse } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 1000 * 60 * 15;

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();
    const now = Date.now();
    const record = attempts.get(ip);

    if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429 },
      );
    }

    const { username, password } = await request.json();

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(username.trim(), password);
    if (!isValid) {
      const nextRecord = record && record.resetAt > now
        ? { count: record.count + 1, resetAt: record.resetAt }
        : { count: 1, resetAt: now + WINDOW_MS };
      attempts.set(ip, nextRecord);
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    attempts.delete(ip);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: getSessionCookieName(),
      value: createSessionToken(username.trim()),
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
