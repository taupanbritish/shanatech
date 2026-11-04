"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitRegistration } from "@/app/actions";
import { FormAlert, FormField, fieldClass } from "@/components/forms/form-ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import type { Course } from "@/lib/queries";
import { formatShortDate } from "@/lib/utils";

const educationOptions = ["SMA/SMK", "D3", "S1", "S2", "Umum / lainnya"];

export function RegistrationForm({
  courses,
  initialCourseId,
  initialScheduleId,
}: {
  courses: Course[];
  initialCourseId: number | null;
  initialScheduleId: number | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>(initialFormState);
  const [pending, setPending] = useState(false);
  const [courseId, setCourseId] = useState<string>(
    initialCourseId ? String(initialCourseId) : "",
  );
  const [scheduleId, setScheduleId] = useState<string>(
    initialScheduleId ? String(initialScheduleId) : "",
  );

  const selectedCourse = courses.find((course) => String(course.id) === courseId);
  const schedules = selectedCourse?.schedules ?? [];
  const errors = state.errors ?? {};

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    const result = await submitRegistration(initialFormState, formData);
    setPending(false);
    setState(result);

    if (result.status === "success") {
      form.reset();
      setCourseId("");
      setScheduleId("");
      router.refresh();
    }
  }

  return (
    <div id="daftar" className="scroll-mt-28 rounded-[28px] border border-line bg-white p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
          Formulir pendaftaran
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Amankan kursi Anda.</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Isi data di bawah ini. Tim Academy akan menghubungi Anda maksimal 1×24 jam pada hari
          kerja untuk konfirmasi jadwal dan pembayaran.
        </p>
      </div>

      <FormAlert state={state} />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <FormField label="Nama lengkap" htmlFor="fullName" error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Nama sesuai identitas"
            className={fieldClass(Boolean(errors.fullName))}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
        </FormField>

        <FormField label="Email" htmlFor="regEmail" error={errors.email}>
          <input
            id="regEmail"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            className={fieldClass(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "regEmail-error" : undefined}
          />
        </FormField>

        <FormField label="Nomor WhatsApp" htmlFor="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="0812 3456 7890"
            className={fieldClass(Boolean(errors.phone))}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
        </FormField>

        <FormField
          label="Pendidikan terakhir"
          htmlFor="education"
          optional
          error={errors.education}
        >
          <select
            id="education"
            name="education"
            defaultValue=""
            className={fieldClass(Boolean(errors.education))}
          >
            <option value="">Pilih pendidikan</option>
            {educationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Program" htmlFor="courseId" error={errors.courseId}>
          <select
            id="courseId"
            name="courseId"
            required
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setScheduleId("");
            }}
            className={fieldClass(Boolean(errors.courseId))}
            aria-invalid={Boolean(errors.courseId)}
            aria-describedby={errors.courseId ? "courseId-error" : undefined}
          >
            <option value="">Pilih program</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} · {course.category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Jadwal / batch" htmlFor="scheduleId" optional error={errors.scheduleId}>
          <select
            id="scheduleId"
            name="scheduleId"
            value={scheduleId}
            onChange={(event) => setScheduleId(event.target.value)}
            disabled={!selectedCourse}
            className={fieldClass(Boolean(errors.scheduleId))}
            aria-invalid={Boolean(errors.scheduleId)}
            aria-describedby={errors.scheduleId ? "scheduleId-error" : undefined}
          >
            <option value="">
              {selectedCourse ? "Belum menentukan jadwal" : "Pilih program terlebih dahulu"}
            </option>
            {schedules.map((schedule) => {
              const remaining = schedule.quota - schedule.enrolled;
              return (
                <option key={schedule.id} value={schedule.id} disabled={remaining <= 0}>
                  {schedule.batch} · {schedule.label} · mulai {formatShortDate(schedule.startDate)}
                  {remaining <= 0 ? " (penuh)" : ""}
                </option>
              );
            })}
          </select>
        </FormField>

        <FormField
          label="Catatan untuk tim Academy"
          htmlFor="note"
          optional
          error={errors.note}
          className="sm:col-span-2"
        >
          <textarea
            id="note"
            name="note"
            rows={3}
            placeholder="Contoh: lebih nyaman kelas malam, atau ingin konsultasi jadwal."
            className={fieldClass(Boolean(errors.note))}
            aria-invalid={Boolean(errors.note)}
            aria-describedby={errors.note ? "note-error" : undefined}
          />
        </FormField>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim pendaftaran…
              </>
            ) : (
              <>
                Kirim pendaftaran
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Dengan mengirim formulir, Anda menyetujui data digunakan hanya untuk proses pendaftaran
            dan komunikasi terkait kelas.
          </p>
        </div>
      </form>
    </div>
  );
}
