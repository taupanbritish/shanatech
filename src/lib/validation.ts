import { z } from "zod";
import { serviceOptions } from "@/lib/content";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^(\+?62|0)8[1-9][0-9]{6,11}$/;

const requiredText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} minimal ${min} karakter`)
    .max(max, `${label} maksimal ${max} karakter`);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max, `Maksimal ${max} karakter`).optional(),
  );

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi")
  .max(160, "Email terlalu panjang")
  .refine((value) => emailPattern.test(value), "Format email belum benar");

const phoneField = z
  .string()
  .trim()
  .min(9, "Nomor telepon minimal 9 digit")
  .max(20, "Nomor telepon terlalu panjang")
  .refine(
    (value) => phonePattern.test(value.replace(/[\s.-]/g, "")),
    "Gunakan nomor Indonesia yang valid, mis. 0812 3456 7890",
  );

const optionalPhoneField = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .max(20, "Nomor telepon terlalu panjang")
    .refine(
      (value) => phonePattern.test(value.replace(/[\s.-]/g, "")),
      "Gunakan nomor Indonesia yang valid, mis. 0812 3456 7890",
    )
    .optional(),
);

const honeypot = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z.string().max(0),
);

export const registrationSchema = z.object({
  fullName: requiredText("Nama lengkap", 3, 100),
  email: emailField,
  phone: phoneField,
  courseId: z.coerce.number().int().positive("Pilih program yang ingin diikuti"),
  scheduleId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().positive("Pilih jadwal yang tersedia").optional(),
  ),
  education: optionalText(60),
  note: optionalText(600),
  website: honeypot,
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const contactSchema = z.object({
  name: requiredText("Nama", 3, 100),
  email: emailField,
  phone: optionalPhoneField,
  company: optionalText(120),
  service: z
    .string()
    .trim()
    .refine(
      (value) => (serviceOptions as readonly string[]).includes(value),
      "Pilih kategori kebutuhan",
    ),
  message: requiredText("Pesan", 20, 2000),
  website: honeypot,
});

export type ContactInput = z.infer<typeof contactSchema>;

const newPassword = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(200, "Password maksimal 200 karakter")
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), "Gunakan kombinasi huruf dan angka");

export const studentRegisterSchema = z
  .object({
    fullName: requiredText("Nama lengkap", 3, 100),
    email: emailField,
    phone: optionalPhoneField,
    password: newPassword,
    passwordConfirm: z.string(),
    website: honeypot,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Konfirmasi password tidak sama",
    path: ["passwordConfirm"],
  });

export const studentLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password wajib diisi").max(200, "Password terlalu panjang"),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
  website: honeypot,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().regex(/^[A-Za-z0-9_-]{32,128}$/, "Tautan reset tidak valid"),
    password: newPassword,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Konfirmasi password tidak sama",
    path: ["passwordConfirm"],
  });

export function normalizePhone(value: string | undefined) {
  if (!value) return null;
  const digits = value.replace(/[\s.-]/g, "");
  if (digits.startsWith("+62")) return `0${digits.slice(3)}`;
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}

export function toFieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
