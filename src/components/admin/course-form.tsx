"use client";

import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { saveCourse } from "@/app/admin/actions";
import { FormAlert, FormField, fieldClass } from "@/components/forms/form-ui";
import type { AdminCourse } from "@/lib/admin-queries";
import { initialFormState } from "@/lib/form-state";

const categories = ["Komputer", "Bahasa Inggris"] as const;
const modes = ["Offline", "Online", "Hybrid"] as const;

export function CourseForm({ course }: { course?: AdminCourse }) {
  const [state, action, pending] = useActionState(saveCourse, initialFormState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={action} className="space-y-6">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      <FormAlert state={state.status === "error" ? state : initialFormState} />

      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">Informasi program</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          Data ini tampil di katalog Academy dan kartu layanan publik.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormField label="Nama program" htmlFor="courseName" error={errors.name}>
            <input
              id="courseName"
              name="name"
              type="text"
              required
              defaultValue={values.name ?? course?.name}
              placeholder="Contoh: Web Development Fundamental"
              className={fieldClass(Boolean(errors.name))}
            />
          </FormField>

          <FormField label="Slug URL" htmlFor="courseSlug" optional error={errors.slug}>
            <input
              id="courseSlug"
              name="slug"
              type="text"
              defaultValue={values.slug ?? course?.slug}
              placeholder="otomatis-dari-nama"
              className={fieldClass(Boolean(errors.slug))}
            />
          </FormField>

          <FormField label="Kategori" htmlFor="courseCategory" error={errors.category}>
            <select
              id="courseCategory"
              name="category"
              defaultValue={values.category ?? course?.category ?? "Komputer"}
              className={fieldClass(Boolean(errors.category))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Level" htmlFor="courseLevel" error={errors.level}>
            <input
              id="courseLevel"
              name="level"
              type="text"
              required
              defaultValue={values.level ?? course?.level}
              placeholder="Pemula / Intermediate"
              className={fieldClass(Boolean(errors.level))}
            />
          </FormField>

          <FormField label="Mode kelas" htmlFor="courseMode" error={errors.mode}>
            <select
              id="courseMode"
              name="mode"
              defaultValue={values.mode ?? course?.mode ?? "Hybrid"}
              className={fieldClass(Boolean(errors.mode))}
            >
              {modes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Durasi" htmlFor="durationLabel" error={errors.durationLabel}>
            <input
              id="durationLabel"
              name="durationLabel"
              type="text"
              required
              defaultValue={values.durationLabel ?? course?.durationLabel}
              placeholder="8 minggu · 24 sesi"
              className={fieldClass(Boolean(errors.durationLabel))}
            />
          </FormField>

          <FormField label="Jumlah sesi" htmlFor="sessions" error={errors.sessions}>
            <input
              id="sessions"
              name="sessions"
              type="number"
              min={1}
              required
              defaultValue={values.sessions ?? course?.sessions ?? 12}
              className={fieldClass(Boolean(errors.sessions))}
            />
          </FormField>

          <FormField label="Harga (Rp)" htmlFor="price" error={errors.price}>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1000}
              required
              defaultValue={values.price ?? course?.price ?? 1500000}
              className={fieldClass(Boolean(errors.price))}
            />
          </FormField>

          <FormField
            label="Ringkasan"
            htmlFor="summary"
            error={errors.summary}
            className="sm:col-span-2"
          >
            <textarea
              id="summary"
              name="summary"
              rows={2}
              required
              defaultValue={values.summary ?? course?.summary}
              placeholder="Satu atau dua kalimat yang menjelaskan hasil belajar."
              className={fieldClass(Boolean(errors.summary))}
            />
          </FormField>

          <FormField
            label="Deskripsi lengkap"
            htmlFor="description"
            error={errors.description}
            className="sm:col-span-2"
          >
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={values.description ?? course?.description}
              placeholder="Jelaskan materi, pendekatan belajar, dan luaran program."
              className={fieldClass(Boolean(errors.description))}
            />
          </FormField>

          <FormField
            label="Poin materi"
            htmlFor="highlights"
            error={errors.highlights}
            className="sm:col-span-2"
          >
            <textarea
              id="highlights"
              name="highlights"
              rows={4}
              required
              defaultValue={values.highlights ?? course?.highlights.join("\n")}
              placeholder={"Satu poin per baris\nContoh: HTML, CSS & JavaScript modern"}
              className={fieldClass(Boolean(errors.highlights))}
            />
            <p className="mt-1.5 text-[11px] text-muted">
              Satu poin per baris, maksimal 8 poin.
            </p>
          </FormField>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">Publikasi</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <FormField label="Urutan tampil" htmlFor="sortOrder" error={errors.sortOrder}>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              required
              defaultValue={values.sortOrder ?? course?.sortOrder ?? 0}
              className={fieldClass(Boolean(errors.sortOrder))}
            />
          </FormField>

          <label className="flex items-start gap-3 rounded-xl border border-line bg-cream/60 p-4 text-[12.5px]">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={
                values.featured !== undefined ? values.featured === "on" : course?.featured
              }
              className="mt-0.5 h-4 w-4 accent-brand-strong"
            />
            <span>
              <span className="block font-semibold text-ink">Program unggulan</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                Tampil dengan label Unggulan di katalog.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-line bg-cream/60 p-4 text-[12.5px]">
            <input
              type="checkbox"
              name="active"
              defaultChecked={
                values.active !== undefined ? values.active === "on" : course ? course.active : true
              }
              className="mt-0.5 h-4 w-4 accent-brand-strong"
            />
            <span>
              <span className="block font-semibold text-ink">Aktif</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                Nonaktifkan untuk menyembunyikan dari katalog.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/85 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {pending ? "Menyimpan…" : course ? "Simpan perubahan" : "Buat program"}
        </button>
        <Link
          href="/admin/program"
          className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-medium text-ink hover:border-ink/25"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
