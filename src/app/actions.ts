"use server";

import { revalidatePath, updateTag } from "next/cache";
import { pool } from "@/lib/db";
import { sendContactNotification, sendRegistrationNotification } from "@/lib/email";
import type { FormState } from "@/lib/form-state";
import { ACADEMY_CATALOG_TAG } from "@/lib/queries";
import { contactSchema, registrationSchema, toFieldErrors } from "@/lib/validation";

export async function submitRegistration(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Beberapa kolom perlu diperiksa kembali.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (data.website) {
    return {
      status: "success",
      message: "Pendaftaran diterima. Tim Academy akan menghubungi Anda.",
    };
  }

  const client = await pool.connect();
  let registration: {
    id: number;
    courseName: string;
    scheduleLabel: string;
  };

  try {
    await client.query("BEGIN");

    const courseResult = await client.query<{ id: number; name: string }>(
      "SELECT id, name FROM courses WHERE id = $1 AND is_active = TRUE",
      [data.courseId],
    );

    if (courseResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        status: "error",
        message: "Program yang dipilih tidak tersedia. Muat ulang halaman lalu coba lagi.",
      };
    }

    const course = courseResult.rows[0];
    let scheduleLabel = "Belum memilih jadwal";

    if (data.scheduleId) {
      const scheduleResult = await client.query<{
        id: number;
        course_id: number;
        quota: number;
        status: string;
        schedule_label: string;
        batch: string;
        enrolled: number;
      }>(
        `SELECT s.id, s.course_id, s.quota, s.status, s.schedule_label, s.batch,
          (SELECT COUNT(*) FROM registrations r
            WHERE r.schedule_id = s.id AND r.status <> 'Batal')::int AS enrolled
         FROM schedules s
         WHERE s.id = $1
         FOR UPDATE`,
        [data.scheduleId],
      );

      const schedule = scheduleResult.rows[0];

      if (!schedule || schedule.course_id !== course.id) {
        await client.query("ROLLBACK");
        return {
          status: "error",
          message: "Jadwal yang dipilih tidak sesuai dengan program. Silakan pilih ulang.",
          errors: { scheduleId: "Jadwal tidak sesuai dengan program." },
        };
      }

      if (schedule.status !== "Dibuka") {
        await client.query("ROLLBACK");
        return {
          status: "error",
          message: "Batch ini sudah ditutup. Silakan pilih jadwal lain.",
          errors: { scheduleId: "Batch sudah ditutup." },
        };
      }

      if (schedule.enrolled >= schedule.quota) {
        await client.query("ROLLBACK");
        return {
          status: "error",
          message: "Kursi pada batch ini sudah penuh. Silakan pilih batch lain.",
          errors: { scheduleId: "Kursi batch ini sudah penuh." },
        };
      }

      scheduleLabel = `${schedule.batch} · ${schedule.schedule_label}`;
    }

    const insert = await client.query<{ id: number }>(
      `INSERT INTO registrations
        (course_id, schedule_id, full_name, email, phone, education, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        course.id,
        data.scheduleId ?? null,
        data.fullName,
        data.email,
        data.phone,
        data.education ?? null,
        data.note ?? null,
      ],
    );

    await client.query("COMMIT");

    registration = {
      id: insert.rows[0].id,
      courseName: course.name,
      scheduleLabel,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      return {
        status: "error",
        message: "Email ini sudah terdaftar pada batch yang sama.",
        errors: { email: "Email sudah terdaftar pada batch ini." },
      };
    }
    console.error("[registrasi] Gagal menyimpan pendaftaran:", error);
    return {
      status: "error",
      message: "Pendaftaran belum bisa diproses. Silakan coba lagi beberapa saat lagi.",
    };
  } finally {
    client.release();
  }

  updateTag(ACADEMY_CATALOG_TAG);
  revalidatePath("/academy");

  const reference = `SHT-REG-${String(registration.id).padStart(5, "0")}`;

  try {
    await sendRegistrationNotification({
      reference,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      courseName: registration.courseName,
      scheduleLabel: registration.scheduleLabel,
      education: data.education,
      note: data.note,
    });
  } catch (error) {
    console.error("[registrasi] Notifikasi email gagal dikirim:", error);
  }

  return {
    status: "success",
    message:
      "Pendaftaran Anda sudah kami terima. Tim Academy akan menghubungi Anda maksimal 1×24 jam pada hari kerja.",
    reference,
  };
}

export async function submitContact(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Beberapa kolom perlu diperiksa kembali.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (data.website) {
    return {
      status: "success",
      message: "Terima kasih. Pesan Anda sudah kami terima.",
    };
  }

  let messageId: number;

  try {
    const result = await pool.query<{ id: number }>(
      `INSERT INTO contact_messages
        (name, email, phone, company, service, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.phone ?? null,
        data.company ?? null,
        data.service,
        data.message,
      ],
    );
    messageId = result.rows[0].id;
  } catch (error) {
    console.error("[kontak] Gagal menyimpan pesan:", error);
    return {
      status: "error",
      message: "Pesan belum bisa dikirim. Silakan coba lagi beberapa saat lagi.",
    };
  }

  const reference = `SHT-MSG-${String(messageId).padStart(5, "0")}`;

  try {
    const notification = await sendContactNotification({
      reference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: data.service,
      message: data.message,
    });

    if (notification.sent) {
      await pool.query("UPDATE contact_messages SET email_sent = TRUE WHERE id = $1", [messageId]);
    }
  } catch (error) {
    console.error("[kontak] Notifikasi email gagal dikirim:", error);
  }

  return {
    status: "success",
    message:
      "Pesan Anda sudah kami terima. Tim SHANATECH akan merespons maksimal 1×24 jam pada hari kerja.",
    reference,
  };
}
