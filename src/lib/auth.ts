import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ADMIN_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/auth-constants";

export type AdminSession = { email: string };

type SessionPayload = { sub: string; exp: number };

function sessionSecret() {
  return process.env.SESSION_SECRET ?? "";
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(email: string): string {
  const payload: SessionPayload = {
    sub: email,
    exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token || !sessionSecret()) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && payload.sub !== adminEmail) return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
});

export async function requireAdminSession(): Promise<AdminSession> {
  await connection();
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function createAdminSession(email: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export function verifyAdminPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 6;
const WINDOW_MS = 10 * 60 * 1000;

export function checkLoginRateLimit(key: string) {
  const entry = loginAttempts.get(key);
  if (!entry) return { allowed: true, retryInMinutes: 0 };
  if (entry.resetAt < Date.now()) {
    loginAttempts.delete(key);
    return { allowed: true, retryInMinutes: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryInMinutes: Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 60000)),
    };
  }
  return { allowed: true, retryInMinutes: 0 };
}

export function recordLoginFailure(key: string) {
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(key: string) {
  loginAttempts.delete(key);
}
