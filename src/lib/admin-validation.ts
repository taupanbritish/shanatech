import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const requiredText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} minimal ${min} karakter`)
    .max(max, `${label} maksimal ${max} karakter`);

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const checkbox = (value: unknown) => value === "on" || value === "true" || value === true;

const dateField = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} wajib diisi`)
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), `${label} tidak valid`);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi")
    .refine((value) => emailPattern.test(value), "Format email belum benar"),
  password: z.string().min(1, "Password wajib diisi").max(200, "Password terlalu panjang"),
});

export const registrationStatusSchema = z.enum(["Baru", "Dihubungi", "Terdaftar", "Batal"]);
export const messageStatusSchema = z.enum(["Baru", "Diproses", "Selesai"]);

export const courseSchema = z.object({
  id: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  name: requiredText("Nama program", 3, 120),
  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .toLowerCase()
      .max(80, "Slug maksimal 80 karakter")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung")
      .optional(),
  ),
  category: z.enum(["Komputer", "Bahasa Inggris"], {
    message: "Pilih kategori program",
  }),
  level: requiredText("Level", 2, 60),
  summary: requiredText("Ringkasan", 20, 300),
  description: requiredText("Deskripsi", 40, 4000),
  highlights: z
    .string()
    .trim()
    .max(1500, "Poin materi terlalu panjang")
    .transform((value) =>
      value
        .split(/\r?\n|;/)
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .refine((items) => items.length >= 1, "Isi minimal satu poin materi")
    .refine((items) => items.length <= 8, "Maksimal 8 poin materi"),
  durationLabel: requiredText("Durasi", 3, 80),
  sessions: z.coerce.number().int("Jumlah sesi harus bilangan bulat").min(1, "Minimal 1 sesi").max(500, "Maksimal 500 sesi"),
  price: z.coerce.number().int("Harga harus bilangan bulat").min(0, "Harga tidak boleh negatif").max(100_000_000, "Harga terlalu besar"),
  mode: z.enum(["Offline", "Online", "Hybrid"], { message: "Pilih mode kelas" }),
  featured: z.preprocess(checkbox, z.boolean()),
  active: z.preprocess(checkbox, z.boolean()),
  sortOrder: z.coerce.number().int().min(0, "Urutan minimal 0").max(9999, "Urutan terlalu besar"),
});

export const scheduleSchema = z
  .object({
    id: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    courseId: z.coerce.number().int().positive("Pilih program"),
    batch: requiredText("Batch", 2, 60),
    startDate: dateField("Tanggal mulai"),
    endDate: dateField("Tanggal selesai"),
    scheduleLabel: requiredText("Jadwal", 3, 120),
    instructor: requiredText("Instruktur", 3, 120),
    room: requiredText("Ruang / platform", 2, 80),
    mode: z.enum(["Offline", "Online", "Hybrid"], { message: "Pilih mode kelas" }),
    quota: z.coerce.number().int("Kuota harus bilangan bulat").min(1, "Minimal 1 peserta").max(200, "Maksimal 200 peserta"),
    status: z.enum(["Dibuka", "Ditutup", "Selesai"], { message: "Pilih status batch" }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Tanggal selesai harus sama atau setelah tanggal mulai",
    path: ["endDate"],
  });
