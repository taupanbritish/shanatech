"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  createAdminSession,
  destroyAdminSession,
  recordLoginFailure,
  requireAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";
import {
  courseSchema,
  loginSchema,
  messageStatusSchema,
  registrationStatusSchema,
  scheduleSchema,
} from "@/lib/admin-validation";
import { getRegistrationCountForSchedule } from "@/lib/admin-queries";
import { query } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { ACADEMY_CATALOG_TAG } from "@/lib/queries";
import { toFieldErrors } from "@/lib/validation";

function errorState(message: string, errors?: Record<string, string>): FormState {
  return { status: "error", message, errors };
}

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

function successState(message: string): FormState {
  return { status: "success", message };
}

function safeNextTarget(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/admin") && !next.startsWith("/admin/login")) return next;
  return "/admin";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function refreshPublicCatalog() {
  updateTag(ACADEMY_CATALOG_TAG);
  revalidatePath("/academy");
}

export async function loginAdmin(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Periksa email dan password Anda.", toFieldErrors(parsed.error));
  }

  const headerList = await headers();
  const clientKey =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "lokal";

  const limit = checkLoginRateLimit(clientKey);
  if (!limit.allowed) {
    return errorState(
      `Terlalu banyak percobaan login. Coba lagi dalam ${limit.retryInMinutes} menit.`,
    );
  }

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const validEmail = parsed.data.email === adminEmail;
  const validPassword = verifyAdminPassword(parsed.data.password);

  if (!adminEmail || !validEmail || !validPassword) {
    recordLoginFailure(clientKey);
    return errorState("Email atau password salah.");
  }

  clearLoginFailures(clientKey);
  await createAdminSession(parsed.data.email);
  redirect(safeNextTarget(formData.get("next")));
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function updateRegistrationStatus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  const status = registrationStatusSchema.safeParse(formData.get("status"));

  if (!Number.isInteger(id) || id <= 0 || !status.success) {
    return errorState("Status pendaftaran tidak valid.");
  }

  try {
    const result = await query(
      `UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status.data, id],
    );
    if (result.rowCount === 0) {
      return errorState("Pendaftaran tidak ditemukan.");
    }
  } catch (error) {
    console.error("[admin] Gagal memperbarui status pendaftaran:", error);
    return errorState("Status belum bisa disimpan. Coba lagi.");
  }

  revalidatePath("/admin/pendaftaran");
  revalidatePath("/admin");
  refreshPublicCatalog();
  return successState(`Status diubah menjadi ${status.data}.`);
}

export async function deleteRegistration(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return errorState("Pendaftaran tidak valid.");
  }

  const { rows } = await query<{ status: string }>(
    "SELECT status FROM registrations WHERE id = $1",
    [id],
  );

  if (rows[0]?.status !== "Batal") {
    return errorState(
      "Hanya pendaftaran berstatus Batal yang bisa dihapus. Ubah statusnya terlebih dahulu.",
    );
  }

  try {
    const result = await query("DELETE FROM registrations WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return errorState("Pendaftaran tidak ditemukan.");
    }
  } catch (error) {
    console.error("[admin] Gagal menghapus pendaftaran:", error);
    return errorState("Pendaftaran belum bisa dihapus. Coba lagi.");
  }

  revalidatePath("/admin/pendaftaran");
  revalidatePath("/admin");
  refreshPublicCatalog();
  return successState("Pendaftaran dihapus.");
}

export async function updateMessageStatus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  const status = messageStatusSchema.safeParse(formData.get("status"));

  if (!Number.isInteger(id) || id <= 0 || !status.success) {
    return errorState("Status pesan tidak valid.");
  }

  try {
    const result = await query(
      `UPDATE contact_messages SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status.data, id],
    );
    if (result.rowCount === 0) {
      return errorState("Pesan tidak ditemukan.");
    }
  } catch (error) {
    console.error("[admin] Gagal memperbarui status pesan:", error);
    return errorState("Status belum bisa disimpan. Coba lagi.");
  }

  revalidatePath("/admin/pesan");
  revalidatePath("/admin");
  return successState(`Status diubah menjadi ${status.data}.`);
}

export async function saveCourse(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ...errorState("Periksa kembali data program.", toFieldErrors(parsed.error)),
      values: formValues(formData),
    };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.name);

  if (!slug) {
    return {
      ...errorState("Slug program belum valid.", {
        slug: "Isi slug atau gunakan nama program yang mengandung huruf/angka.",
      }),
      values: formValues(formData),
    };
  }

  try {
    if (data.id) {
      const result = await query(
        `UPDATE courses SET
           slug = $1, name = $2, category = $3, level = $4, summary = $5,
           description = $6, highlights = $7, duration_label = $8, sessions = $9,
           price = $10, mode = $11, is_featured = $12, is_active = $13,
           sort_order = $14, updated_at = NOW()
         WHERE id = $15`,
        [
          slug,
          data.name,
          data.category,
          data.level,
          data.summary,
          data.description,
          data.highlights,
          data.durationLabel,
          data.sessions,
          data.price,
          data.mode,
          data.featured,
          data.active,
          data.sortOrder,
          data.id,
        ],
      );
      if (result.rowCount === 0) {
        return { ...errorState("Program tidak ditemukan."), values: formValues(formData) };
      }
    } else {
      await query(
        `INSERT INTO courses
          (slug, name, category, level, summary, description, highlights,
           duration_label, sessions, price, mode, is_featured, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          slug,
          data.name,
          data.category,
          data.level,
          data.summary,
          data.description,
          data.highlights,
          data.durationLabel,
          data.sessions,
          data.price,
          data.mode,
          data.featured,
          data.active,
          data.sortOrder,
        ],
      );
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return {
        ...errorState("Slug sudah digunakan program lain.", {
          slug: "Slug harus unik.",
        }),
        values: formValues(formData),
      };
    }
    console.error("[admin] Gagal menyimpan program:", error);
    return { ...errorState("Program belum bisa disimpan. Coba lagi."), values: formValues(formData) };
  }

  revalidatePath("/admin/program");
  revalidatePath("/admin/jadwal");
  revalidatePath("/admin");
  refreshPublicCatalog();

  redirect(`/admin/program?notice=${data.id ? "diperbarui" : "dibuat"}`);
}

export async function deleteCourse(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return errorState("Program tidak valid.");
  }

  const { rows } = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM registrations WHERE course_id = $1`,
    [id],
  );

  if ((rows[0]?.count ?? 0) > 0) {
    return errorState(
      "Program ini sudah memiliki pendaftar, jadi tidak bisa dihapus. Nonaktifkan program agar tidak tampil di katalog.",
    );
  }

  try {
    const result = await query("DELETE FROM courses WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return errorState("Program tidak ditemukan.");
    }
  } catch (error) {
    console.error("[admin] Gagal menghapus program:", error);
    return errorState("Program belum bisa dihapus. Coba lagi.");
  }

  revalidatePath("/admin/program");
  revalidatePath("/admin/jadwal");
  revalidatePath("/admin");
  refreshPublicCatalog();
  return successState("Program dihapus.");
}

export async function toggleCourseActive(formData: FormData) {
  await requireAdminSession();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await query(
    `UPDATE courses SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1`,
    [id],
  );

  revalidatePath("/admin/program");
  revalidatePath("/admin");
  refreshPublicCatalog();
}

export async function saveSchedule(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ...errorState("Periksa kembali data batch.", toFieldErrors(parsed.error)),
      values: formValues(formData),
    };
  }

  const data = parsed.data;

  const courseResult = await query<{ id: number }>("SELECT id FROM courses WHERE id = $1", [
    data.courseId,
  ]);
  if (courseResult.rowCount === 0) {
    return {
      ...errorState("Program tidak ditemukan.", { courseId: "Program tidak tersedia." }),
      values: formValues(formData),
    };
  }

  try {
    if (data.id) {
      const enrolled = await getRegistrationCountForSchedule(data.id);
      if (data.quota < enrolled) {
        return {
          ...errorState(`Kuota tidak boleh lebih kecil dari jumlah peserta aktif (${enrolled}).`, {
            quota: `Minimal ${enrolled} peserta.`,
          }),
          values: formValues(formData),
        };
      }

      const result = await query(
        `UPDATE schedules SET
           course_id = $1, batch = $2, start_date = $3, end_date = $4,
           schedule_label = $5, instructor = $6, room = $7, mode = $8,
           quota = $9, status = $10, updated_at = NOW()
         WHERE id = $11`,
        [
          data.courseId,
          data.batch,
          data.startDate,
          data.endDate,
          data.scheduleLabel,
          data.instructor,
          data.room,
          data.mode,
          data.quota,
          data.status,
          data.id,
        ],
      );
      if (result.rowCount === 0) {
        return { ...errorState("Batch tidak ditemukan."), values: formValues(formData) };
      }
    } else {
      await query(
        `INSERT INTO schedules
          (course_id, batch, start_date, end_date, schedule_label, instructor,
           room, mode, quota, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          data.courseId,
          data.batch,
          data.startDate,
          data.endDate,
          data.scheduleLabel,
          data.instructor,
          data.room,
          data.mode,
          data.quota,
          data.status,
        ],
      );
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return {
        ...errorState("Batch dengan nama yang sama sudah ada pada program ini.", {
          batch: "Nama batch harus unik per program.",
        }),
        values: formValues(formData),
      };
    }
    console.error("[admin] Gagal menyimpan batch:", error);
    return { ...errorState("Batch belum bisa disimpan. Coba lagi."), values: formValues(formData) };
  }

  revalidatePath("/admin/jadwal");
  revalidatePath("/admin/program");
  revalidatePath("/admin");
  refreshPublicCatalog();

  redirect(`/admin/jadwal?notice=${data.id ? "diperbarui" : "dibuat"}`);
}

export async function deleteSchedule(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return errorState("Batch tidak valid.");
  }

  const enrolled = await getRegistrationCountForSchedule(id);
  if (enrolled > 0) {
    return errorState(
      `Batch ini memiliki ${enrolled} peserta aktif. Tutup batch atau ubah statusnya menjadi Selesai, bukan menghapusnya.`,
    );
  }

  try {
    const result = await query("DELETE FROM schedules WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return errorState("Batch tidak ditemukan.");
    }
  } catch (error) {
    console.error("[admin] Gagal menghapus batch:", error);
    return errorState("Batch belum bisa dihapus. Coba lagi.");
  }

  revalidatePath("/admin/jadwal");
  revalidatePath("/admin/program");
  revalidatePath("/admin");
  refreshPublicCatalog();
  return successState("Batch dihapus.");
}
