"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { PoolClient } from "pg";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from "@/lib/auth";
import { pool, query } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import type { FormState } from "@/lib/form-state";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { site } from "@/lib/site";
import { endStudentSession, safeStudentNext, startStudentSession } from "@/lib/student-auth";
import {
  forgotPasswordSchema,
  normalizePhone,
  resetPasswordSchema,
  studentLoginSchema,
  studentRegisterSchema,
  toFieldErrors,
} from "@/lib/validation";

const RESET_TOKEN_TTL_MINUTES = 60;

function errorState(message: string, errors?: Record<string, string>, values?: Record<string, string>): FormState {
  return { status: "error", message, errors, values };
}

/** Nilai form untuk diisi ulang saat gagal; password tidak pernah dikembalikan. */
function safeValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.toLowerCase().includes("password")) values[key] = value;
  }
  return values;
}

async function clientKey(scope: string) {
  const list = await headers();
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "lokal";
  return `${scope}:${ip}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerStudent(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = studentRegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState("Periksa kembali data pendaftaran akun.", toFieldErrors(parsed.error), safeValues(formData));
  }

  const data = parsed.data;
  if (data.website) redirect("/login");
  // Jangan membuat akun bila sesi belum dapat diterbitkan.
  if (!process.env.SESSION_SECRET) {
    return errorState("Akun belum bisa dibuat. Coba lagi beberapa saat lagi.", undefined, safeValues(formData));
  }

  const key = await clientKey("daftar");
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return errorState(`Terlalu banyak percobaan. Coba lagi dalam ${limit.retryInMinutes} menit.`);
  }
  // Setiap percobaan pendaftaran dihitung untuk membatasi pembuatan akun massal per IP.
  recordLoginFailure(key);

  try {
    const { rows } = await query<{ id: number; session_version: number }>(
      `INSERT INTO users (email, full_name, phone, password_hash, last_login_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, session_version`,
      [data.email, data.fullName, normalizePhone(data.phone), await hashPassword(data.password)],
    );
    const user = rows[0];
    await startStudentSession(user.id, user.session_version);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return errorState(
        "Email ini sudah terdaftar. Silakan masuk, atau gunakan Lupa password.",
        { email: "Email sudah terdaftar" },
        safeValues(formData),
      );
    }
    console.error("[akun] Gagal membuat akun:", error);
    return errorState("Akun belum bisa dibuat. Coba lagi beberapa saat lagi.", undefined, safeValues(formData));
  }

  redirect(safeStudentNext(formData.get("next")));
}

export async function loginStudent(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = studentLoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState("Periksa email dan password Anda.", toFieldErrors(parsed.error), safeValues(formData));
  }

  const key = await clientKey("masuk");
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return errorState(`Terlalu banyak percobaan masuk. Coba lagi dalam ${limit.retryInMinutes} menit.`);
  }

  try {
    const { rows } = await query<{ id: number; password_hash: string; session_version: number }>(
      "SELECT id, password_hash, session_version FROM users WHERE LOWER(email) = $1",
      [parsed.data.email],
    );
    const user = rows[0];
    // verifyPassword tetap menjalankan scrypt saat user tidak ada agar waktu respons seragam.
    const valid = await verifyPassword(parsed.data.password, user?.password_hash);

    if (!user || !valid) {
      recordLoginFailure(key);
      return errorState("Email atau password salah.", undefined, safeValues(formData));
    }

    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);
    await startStudentSession(user.id, user.session_version);
    clearLoginFailures(key);
  } catch (error) {
    console.error("[akun] Gagal masuk:", error);
    return errorState("Belum bisa masuk. Coba lagi beberapa saat lagi.", undefined, safeValues(formData));
  }
  redirect(safeStudentNext(formData.get("next")));
}

export async function logoutStudent() {
  await endStudentSession();
  redirect("/login?keluar=1");
}

const RESET_REQUESTED: FormState = {
  status: "success",
  message:
    "Jika email tersebut terdaftar, tautan untuk mengatur ulang password sudah dikirim. Periksa juga folder spam. Tautan berlaku 60 menit.",
};

export async function requestPasswordReset(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState("Periksa alamat email Anda.", toFieldErrors(parsed.error), safeValues(formData));
  }
  if (parsed.data.website) return RESET_REQUESTED;

  const key = await clientKey("reset");
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return errorState(`Terlalu banyak permintaan. Coba lagi dalam ${limit.retryInMinutes} menit.`);
  }
  // Setiap permintaan dihitung agar endpoint tidak bisa dipakai untuk spam email.
  recordLoginFailure(key);

  let client: PoolClient | undefined;
  let user: { id: number; full_name: string; email: string };
  const token = randomBytes(32).toString("base64url");
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    // Semua alur reset mengunci user sebelum token agar tidak saling deadlock.
    const { rows } = await client.query<typeof user>(
      "SELECT id, full_name, email FROM users WHERE LOWER(email) = $1 FOR UPDATE",
      [parsed.data.email],
    );
    user = rows[0];
    if (!user) {
      await client.query("ROLLBACK");
      return RESET_REQUESTED;
    }
    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [user.id],
    );
    await client.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + make_interval(mins => $3))`,
      [user.id, hashToken(token), RESET_TOKEN_TTL_MINUTES],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client?.query("ROLLBACK").catch(() => undefined);
    console.error("[akun] Gagal membuat token reset:", error);
    // Termasuk kegagalan DB: jangan mengungkap apakah akun ditemukan.
    return RESET_REQUESTED;
  } finally {
    client?.release();
  }

  try {
    const link = `${site.url}/reset-password?token=${token}`;
    const result = await sendPasswordResetEmail({ to: user.email, fullName: user.full_name, link });
    if (!result.sent && process.env.NODE_ENV !== "production") {
      console.info(`[akun] Email belum dikonfigurasi. Tautan reset (khusus development): ${link}`);
    }
  } catch (error) {
    console.error("[akun] Gagal mengirim email reset:", error);
  }

  return RESET_REQUESTED;
}

export async function resetPassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors = toFieldErrors(parsed.error);
    return errorState(
      errors.token ? "Tautan reset tidak valid. Minta tautan baru." : "Periksa kembali password baru Anda.",
      errors,
    );
  }

  const key = await clientKey("reset-confirm");
  const limit = checkLoginRateLimit(key);
  if (!limit.allowed) {
    return errorState(`Terlalu banyak percobaan. Coba lagi dalam ${limit.retryInMinutes} menit.`);
  }
  // Hitung juga token acak dan percobaan bersamaan sebelum pekerjaan hash.
  recordLoginFailure(key);

  const invalidToken = errorState("Tautan reset sudah kedaluwarsa atau sudah dipakai. Minta tautan baru.", {
    token: "Tautan tidak berlaku",
  });
  let client: PoolClient | undefined;
  try {
    const tokenHash = hashToken(parsed.data.token);
    // Lookup murah tanpa lock: jangan jalankan scrypt untuk token yang tidak hidup.
    const { rows } = await query<{ id: number; user_id: number }>(
      `SELECT id, user_id FROM password_reset_tokens
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash],
    );
    const candidate = rows[0];
    if (!candidate) return invalidToken;

    const passwordHash = await hashPassword(parsed.data.password);
    client = await pool.connect();
    await client.query("BEGIN");
    const user = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE id = $1 FOR UPDATE",
      [candidate.user_id],
    );
    if (!user.rows[0]) {
      await client.query("ROLLBACK");
      return invalidToken;
    }
    // Urutan lock sama dengan requestPasswordReset. Waktu aktual, bukan awal BEGIN,
    // agar token yang kedaluwarsa saat menunggu lock tetap ditolak.
    const token = await client.query<{ id: number }>(
      `SELECT id FROM password_reset_tokens
        WHERE id = $1 AND user_id = $2 AND token_hash = $3
          AND used_at IS NULL AND expires_at > clock_timestamp()
        FOR UPDATE`,
      [candidate.id, candidate.user_id, tokenHash],
    );
    if (!token.rows[0]) {
      await client.query("ROLLBACK");
      return invalidToken;
    }

    // Menaikkan session_version dan menghabiskan semua token dalam satu transaksi.
    await client.query(
      `UPDATE users SET password_hash = $1, session_version = session_version + 1, updated_at = NOW()
        WHERE id = $2`,
      [passwordHash, candidate.user_id],
    );
    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [candidate.user_id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client?.query("ROLLBACK").catch(() => undefined);
    console.error("[akun] Gagal mengatur ulang password:", error);
    return errorState("Password belum bisa diperbarui. Coba lagi.");
  } finally {
    client?.release();
  }

  await endStudentSession();
  redirect("/login?reset=1");
}
