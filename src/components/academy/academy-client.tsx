"use client";

import { ArrowUpRight, Check, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { CourseCatalog } from "@/components/academy/catalog";
import { RegistrationForm } from "@/components/academy/registration-form";
import { ScheduleBoard } from "@/components/academy/schedule-board";
import type { Course } from "@/lib/queries";
import { site } from "@/lib/site";

const steps = [
  {
    title: "Isi formulir",
    text: "Pilih program dan batch yang tersedia, lalu lengkapi data Anda.",
  },
  {
    title: "Konfirmasi tim Academy",
    text: "Kami menghubungi Anda maksimal 1×24 jam pada hari kerja untuk memastikan kursi.",
  },
  {
    title: "Pembayaran & onboarding",
    text: "Instruksi pembayaran dikirim via email, disertai panduan sebelum kelas dimulai.",
  },
  {
    title: "Mulai belajar",
    text: "Bergabung ke grup kelas, mengakses materi, dan bertemu mentor di sesi pertama.",
  },
];

export function AcademyClient({ courses }: { courses: Course[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [registrationKey, setRegistrationKey] = useState(0);

  function handleRegister(courseId: number, scheduleId?: number) {
    setSelectedCourseId(courseId);
    setSelectedScheduleId(scheduleId ?? null);
    setRegistrationKey((value) => value + 1);
    document.getElementById("daftar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="shell py-20 sm:py-24">
      <CourseCatalog
        courses={courses}
        onRegister={handleRegister}
        selectedCourseId={selectedCourseId}
      />

      <div className="mt-20">
        <ScheduleBoard courses={courses} onRegister={handleRegister} />
      </div>

      <div className="mt-20 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
        <RegistrationForm
          key={`${registrationKey}-${selectedCourseId ?? "none"}-${selectedScheduleId ?? "none"}`}
          courses={courses}
          initialCourseId={selectedCourseId}
          initialScheduleId={selectedScheduleId}
        />

        <aside className="space-y-5 lg:sticky lg:top-28">
          <div className="rounded-[28px] bg-navy p-7 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Alur pendaftaran
            </p>
            <ol className="mt-6 space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-[10px] font-semibold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold">{step.title}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-white/50">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7 flex items-start gap-2.5 border-t border-white/10 pt-5 text-[11.5px] leading-relaxed text-white/55">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Pendaftaran tidak langsung memotong biaya. Kursi dikonfirmasi setelah tim Academy
              menghubungi Anda.
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
              Butuh bantuan?
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tim Academy siap membantu memilih program yang sesuai dengan tujuan Anda.
            </p>
            <div className="mt-5 space-y-2.5 text-[13px]">
              <a
                href={`mailto:${site.academyEmail}`}
                className="flex items-center gap-2.5 text-ink/75 hover:text-brand-strong"
              >
                <Mail className="h-4 w-4 text-brand-strong" />
                {site.academyEmail}
              </a>
              <a
                href={`tel:${site.phoneHref}`}
                className="flex items-center gap-2.5 text-ink/75 hover:text-brand-strong"
              >
                <Phone className="h-4 w-4 text-brand-strong" />
                {site.phone}
              </a>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-ink/75 hover:text-brand-strong"
              >
                <MessageCircle className="h-4 w-4 text-brand-strong" />
                WhatsApp Academy
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
