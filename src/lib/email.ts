import { site } from "@/lib/site";

type EmailPayload = {
  subject: string;
  html: string;
  replyTo?: string;
  /** Default: NOTIFY_EMAIL (tim internal). */
  to?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emailShell(title: string, rows: [string, string][], footer: string) {
  const body = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e6ebf2;width:160px;color:#5b6b7f;font-size:13px;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e6ebf2;color:#0b1727;font-size:14px;vertical-align:top">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
  <div style="background:#f4f7fb;padding:32px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e6ebf2;border-radius:18px;overflow:hidden">
      <div style="background:#071426;padding:24px 28px">
        <p style="margin:0;color:#18c8e8;font-size:12px;letter-spacing:2px;font-weight:700">SHANATECH</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;line-height:1.35">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:8px 28px 24px">
        <table style="width:100%;border-collapse:collapse">${body}</table>
        <p style="margin:22px 0 0;color:#5b6b7f;font-size:12px;line-height:1.6">${escapeHtml(footer)}</p>
      </div>
    </div>
    <p style="max-width:620px;margin:16px auto 0;color:#8593a6;font-size:11px;text-align:center">
      Notifikasi otomatis dari website SHANATECH · ${escapeHtml(site.email)}
    </p>
  </div>`;
}

async function sendEmail({ subject, html, replyTo, to: recipient }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = recipient ?? process.env.NOTIFY_EMAIL ?? site.email;

  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY belum diatur — notifikasi "${subject}" hanya dicatat di server.`);
    return { sent: false as const, reason: "not-configured" as const };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "SHANATECH <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error(`[email] Resend menolak pengiriman (${response.status}): ${await response.text()}`);
      return { sent: false as const, reason: "provider-error" as const };
    }

    return { sent: true as const };
  } catch (error) {
    console.error("[email] Gagal menghubungi Resend:", error);
    return { sent: false as const, reason: "network-error" as const };
  }
}

export function sendRegistrationNotification(input: {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  courseName: string;
  scheduleLabel: string;
  education?: string;
  note?: string;
}) {
  return sendEmail({
    subject: `Pendaftaran kelas baru · ${input.courseName} · ${input.fullName}`,
    replyTo: input.email,
    html: emailShell(
      "Pendaftaran kelas baru",
      [
        ["Referensi", input.reference],
        ["Nama", input.fullName],
        ["Email", input.email],
        ["Telepon", input.phone],
        ["Program", input.courseName],
        ["Jadwal", input.scheduleLabel || "Belum memilih jadwal"],
        ["Pendidikan", input.education || "-"],
        ["Catatan", input.note || "-"],
      ],
      "Calon siswa menunggu konfirmasi dari tim Academy maksimal 1×24 jam pada hari kerja.",
    ),
  });
}

export function sendContactNotification(input: {
  reference: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  message: string;
}) {
  return sendEmail({
    subject: `Pesan baru dari website · ${input.service} · ${input.name}`,
    replyTo: input.email,
    html: emailShell(
      "Pesan baru dari formulir kontak",
      [
        ["Referensi", input.reference],
        ["Nama", input.name],
        ["Email", input.email],
        ["Telepon", input.phone || "-"],
        ["Perusahaan", input.company || "-"],
        ["Kebutuhan", input.service],
        ["Pesan", input.message],
      ],
      "Balas email ini untuk langsung menghubungi calon klien.",
    ),
  });
}

export function sendPasswordResetEmail(input: { to: string; fullName: string; link: string }) {
  const name = escapeHtml(input.fullName);
  const link = escapeHtml(input.link);
  return sendEmail({
    to: input.to,
    subject: "Atur ulang password akun Shanatech Academy",
    html: `
  <div style="background:#f4f7fb;padding:32px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6ebf2;border-radius:18px;overflow:hidden">
      <div style="background:#071426;padding:24px 28px">
        <p style="margin:0;color:#18c8e8;font-size:12px;letter-spacing:2px;font-weight:700">SHANATECH ACADEMY</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;line-height:1.35">Atur ulang password</h1>
      </div>
      <div style="padding:24px 28px;color:#0b1727;font-size:14px;line-height:1.65">
        <p style="margin:0">Halo ${name},</p>
        <p style="margin:12px 0 0">Kami menerima permintaan untuk mengatur ulang password akun Anda. Tautan berikut berlaku selama 60 menit dan hanya bisa dipakai sekali.</p>
        <p style="margin:22px 0"><a href="${link}" style="display:inline-block;background:#18c8e8;color:#071426;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px">Atur ulang password</a></p>
        <p style="margin:0;color:#5b6b7f;font-size:12px">Jika tombol tidak berfungsi, salin tautan ini ke browser:<br><span style="word-break:break-all">${link}</span></p>
        <p style="margin:18px 0 0;color:#5b6b7f;font-size:12px">Abaikan email ini jika Anda tidak meminta reset password. Password Anda tidak akan berubah.</p>
      </div>
    </div>
    <p style="max-width:560px;margin:16px auto 0;color:#8593a6;font-size:11px;text-align:center">
      ${escapeHtml(site.academyName)} · ${escapeHtml(site.academyEmail)}
    </p>
  </div>`,
  });
}
