import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { STUDENT_COOKIE, STUDENT_SESSION_MAX_AGE } from "@/lib/auth-constants";
import { query } from "@/lib/db";

export type StudentSession = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt: Date;
};

type TokenPayload = { uid: number; ver: number; exp: number };

function sessionSecret() {
  return process.env.SESSION_SECRET ?? "";
}

// Prefix "student." memisahkan ruang tanda tangan dari token admin, sehingga token
// admin tidak pernah valid sebagai token peserta (dan sebaliknya).
function sign(encoded: string) {
  return createHmac("sha256", sessionSecret()).update(`student.${encoded}`).digest("base64url");
}

function createToken(userId: number, sessionVersion: number) {
  const payload: TokenPayload = {
    uid: userId,
    ver: sessionVersion,
    exp: Date.now() + STUDENT_SESSION_MAX_AGE * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function readToken(token: string | undefined): TokenPayload | null {
  if (!token || !sessionSecret()) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const given = Buffer.from(signature);
  const wanted = Buffer.from(sign(encoded));
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TokenPayload;
    if (
      !Number.isInteger(payload.uid) ||
      !Number.isInteger(payload.ver) ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Sesi peserta diverifikasi dua lapis: tanda tangan HMAC pada cookie, lalu
 * `session_version` di database. Reset password menaikkan versi sehingga semua
 * sesi lama langsung tidak berlaku.
 */
export const getStudentSession = cache(async (): Promise<StudentSession | null> => {
  const payload = readToken((await cookies()).get(STUDENT_COOKIE)?.value);
  if (!payload) return null;

  const { rows } = await query<{
    id: number;
    email: string;
    full_name: string;
    phone: string | null;
    created_at: Date;
  }>(
    `SELECT id, email, full_name, phone, created_at
       FROM users WHERE id = $1 AND session_version = $2`,
    [payload.uid, payload.ver],
  );

  const user = rows[0];
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    createdAt: user.created_at,
  };
});

export async function requireStudentSession(next = "/dashboard"): Promise<StudentSession> {
  await connection();
  const session = await getStudentSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

export async function startStudentSession(userId: number, sessionVersion: number) {
  if (!sessionSecret()) throw new Error("Sesi belum bisa dibuat. Coba lagi beberapa saat lagi.");
  const token = createToken(userId, sessionVersion);
  const store = await cookies();
  store.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STUDENT_SESSION_MAX_AGE,
  });
}

export async function endStudentSession() {
  (await cookies()).delete(STUDENT_COOKIE);
}

/** Hanya izinkan tujuan internal milik area peserta, bukan URL eksternal atau admin. */
export function safeStudentNext(value: unknown) {
  const fallback = "/dashboard";
  const origin = "https://student.invalid";
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    // Tolak sebelum URL parser membuang kontrol atau menormalkan backslash.
    const decoded = decodeURIComponent(value);
    if ([...value, ...decoded].some((char) => char === "\\" || char.charCodeAt(0) <= 31 || char.charCodeAt(0) === 127)) {
      return fallback;
    }
    const url = new URL(value, origin);
    // Separator/encoding berlapis tidak boleh mengubah path setelah validasi.
    if (url.origin !== origin || /%(?:2f|25)/i.test(url.pathname)) return fallback;
    const routes = ["/dashboard", "/learn", "/academy", "/products", "/contact"];
    if (!routes.some((route) => url.pathname === route || url.pathname.startsWith(`${route}/`))) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
