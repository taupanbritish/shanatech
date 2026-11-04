"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Award, Check, Clock3, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Course, CourseCategory } from "@/lib/queries";
import { cn, formatRupiah, formatShortDate } from "@/lib/utils";

const categories = ["Semua", "Komputer", "Bahasa Inggris"] as const;
type Filter = (typeof categories)[number];

export function CourseCatalog({
  courses,
  onRegister,
  selectedCourseId,
}: {
  courses: Course[];
  onRegister: (courseId: number, scheduleId?: number) => void;
  selectedCourseId: number | null;
}) {
  const [category, setCategory] = useState<Filter>("Semua");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchCategory = category === "Semua" || course.category === (category as CourseCategory);
      const matchTerm =
        !term ||
        course.name.toLowerCase().includes(term) ||
        course.summary.toLowerCase().includes(term) ||
        course.level.toLowerCase().includes(term);
      return matchCategory && matchTerm;
    });
  }, [category, courses, query]);

  return (
    <div id="program" className="scroll-mt-24">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
            Katalog program
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Pilih jalur belajar Anda.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Dua kategori, {courses.length} program. Semua kelas dirancang untuk orang dewasa yang
            sibuk, dengan jadwal sore, malam, dan akhir pekan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11.5px] font-medium text-muted">
          <span className="rounded-full border border-line bg-white px-3 py-1.5">
            {courses.length} program aktif
          </span>
          <span className="rounded-full border border-line bg-white px-3 py-1.5">
            {courses.reduce((total, course) => total + course.schedules.length, 0)} batch dibuka
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori program">
          {categories.map((item) => {
            const count =
              item === "Semua"
                ? courses.length
                : courses.filter((course) => course.category === item).length;
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors",
                  active
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-ink/65 hover:border-brand-strong/30 hover:text-ink",
                )}
              >
                {item}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active ? "bg-white/15 text-white/80" : "bg-cream text-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60" />
          <label htmlFor="cari-program" className="sr-only">
            Cari program
          </label>
          <input
            id="cari-program"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari program, mis. Python atau IELTS"
            className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-[13px] text-ink placeholder:text-muted/50 focus:border-brand-strong focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      <motion.div layout className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course) => {
            const next = course.schedules[0];
            const isSelected = selectedCourseId === course.id;
            return (
              <motion.article
                layout
                key={course.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "flex flex-col rounded-[24px] border bg-white p-6 transition-colors",
                  isSelected
                    ? "border-brand-strong/50 ring-2 ring-brand/15"
                    : "border-line hover:border-brand-strong/25",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      course.category === "Komputer"
                        ? "bg-brand/10 text-brand-strong"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    {course.category}
                  </span>
                  {course.featured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-600">
                      <Award className="h-3.5 w-3.5" />
                      Unggulan
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-ink">{course.name}</h3>
                <p className="mt-1 text-[11.5px] font-medium text-muted">{course.level}</p>
                <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted">
                  {course.summary}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {course.highlights.slice(0, 2).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11.5px] text-ink/65">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-strong" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid gap-1.5 border-t border-line pt-4 text-[11.5px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {course.durationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {course.mode}
                    {next ? ` · batch mulai ${formatShortDate(next.startDate)}` : " · jadwal menyusul"}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted/70">Investasi</p>
                    <p className="text-sm font-semibold text-ink">{formatRupiah(course.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRegister(course.id, next?.id)}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-semibold text-white transition-colors hover:bg-brand-strong"
                  >
                    Daftar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-sm font-semibold text-ink">Program tidak ditemukan.</p>
          <p className="mt-1.5 text-sm text-muted">
            Coba kata kunci lain, atau hubungi tim Academy untuk rekomendasi program.
          </p>
        </div>
      ) : null}
    </div>
  );
}
