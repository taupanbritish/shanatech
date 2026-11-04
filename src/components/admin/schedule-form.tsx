"use client";

import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { saveSchedule } from "@/app/admin/actions";
import { FormAlert, FormField, fieldClass } from "@/components/forms/form-ui";
import type { AdminSchedule, CourseOption } from "@/lib/admin-queries";
import { initialFormState } from "@/lib/form-state";

const modes = ["Offline", "Online", "Hybrid"] as const;
const statuses = ["Dibuka", "Ditutup", "Selesai"] as const;

export function ScheduleForm({
  courses,
  schedule,
}: {
  courses: CourseOption[];
  schedule?: AdminSchedule;
}) {
  const [state, action, pending] = useActionState(saveSchedule, initialFormState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={action} className="space-y-6">
      {schedule ? <input type="hidden" name="id" value={schedule.id} /> : null}
      <FormAlert state={state.status === "error" ? state : initialFormState} />

      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">Detail batch</h2>
        <p className="mt-1 text-[12.5px] text-muted">
          Batch yang berstatus Dibuka akan muncul di halaman Academy dan bisa dipilih pendaftar.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormField label="Program" htmlFor="scheduleCourse" error={errors.courseId}>
            <select
              id="scheduleCourse"
              name="courseId"
              defaultValue={values.courseId ?? schedule?.courseId ?? courses[0]?.id ?? ""}
              required
              className={fieldClass(Boolean(errors.courseId))}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} · {course.category}
                  {course.active ? "" : " (nonaktif)"}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Nama batch" htmlFor="batch" error={errors.batch}>
            <input
              id="batch"
              name="batch"
              type="text"
              required
              defaultValue={values.batch ?? schedule?.batch}
              placeholder="Batch 10"
              className={fieldClass(Boolean(errors.batch))}
            />
          </FormField>

          <FormField label="Tanggal mulai" htmlFor="startDate" error={errors.startDate}>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={values.startDate ?? schedule?.startDate}
              className={fieldClass(Boolean(errors.startDate))}
            />
          </FormField>

          <FormField label="Tanggal selesai" htmlFor="endDate" error={errors.endDate}>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              defaultValue={values.endDate ?? schedule?.endDate}
              className={fieldClass(Boolean(errors.endDate))}
            />
          </FormField>

          <FormField
            label="Jadwal"
            htmlFor="scheduleLabel"
            error={errors.scheduleLabel}
            className="sm:col-span-2"
          >
            <input
              id="scheduleLabel"
              name="scheduleLabel"
              type="text"
              required
              defaultValue={values.scheduleLabel ?? schedule?.label}
              placeholder="Senin & Kamis, 19.00–21.00 WIB"
              className={fieldClass(Boolean(errors.scheduleLabel))}
            />
          </FormField>

          <FormField label="Instruktur" htmlFor="instructor" error={errors.instructor}>
            <input
              id="instructor"
              name="instructor"
              type="text"
              required
              defaultValue={values.instructor ?? schedule?.instructor}
              placeholder="Nama dan gelar"
              className={fieldClass(Boolean(errors.instructor))}
            />
          </FormField>

          <FormField label="Ruang / platform" htmlFor="room" error={errors.room}>
            <input
              id="room"
              name="room"
              type="text"
              required
              defaultValue={values.room ?? schedule?.room}
              placeholder="Lab Komputer 1 / Zoom"
              className={fieldClass(Boolean(errors.room))}
            />
          </FormField>

          <FormField label="Mode kelas" htmlFor="scheduleMode" error={errors.mode}>
            <select
              id="scheduleMode"
              name="mode"
              defaultValue={values.mode ?? schedule?.mode ?? "Offline"}
              className={fieldClass(Boolean(errors.mode))}
            >
              {modes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Kuota peserta" htmlFor="quota" error={errors.quota}>
            <input
              id="quota"
              name="quota"
              type="number"
              min={1}
              required
              defaultValue={values.quota ?? schedule?.quota ?? 16}
              className={fieldClass(Boolean(errors.quota))}
            />
          </FormField>

          <FormField label="Status batch" htmlFor="scheduleStatus" error={errors.status}>
            <select
              id="scheduleStatus"
              name="status"
              defaultValue={values.status ?? schedule?.status ?? "Dibuka"}
              className={fieldClass(Boolean(errors.status))}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>
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
          {pending ? "Menyimpan…" : schedule ? "Simpan perubahan" : "Buat batch"}
        </button>
        <Link
          href="/admin/jadwal"
          className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-medium text-ink hover:border-ink/25"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
