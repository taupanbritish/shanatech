"use client";

import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import type { Course, Schedule } from "@/lib/queries";
import { cn, formatShortDate } from "@/lib/utils";

type Row = Schedule & {
  courseId: number;
  courseName: string;
  category: Course["category"];
};

export function ScheduleBoard({
  courses,
  onRegister,
}: {
  courses: Course[];
  onRegister: (courseId: number, scheduleId?: number) => void;
}) {
  const rows: Row[] = courses
    .flatMap((course) =>
      course.schedules.map((schedule) => ({
        ...schedule,
        courseId: course.id,
        courseName: course.name,
        category: course.category,
      })),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div id="jadwal" className="scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
            Jadwal kelas
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Batch terdekat.</h2>
        </div>
        <p className="text-[12.5px] text-muted">
          Kuota diperbarui langsung dari database pendaftaran.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-line bg-white">
        <div className="hidden grid-cols-[1.5fr_1.1fr_1fr_0.9fr_auto] gap-4 border-b border-line bg-cream/70 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted lg:grid">
          <span>Program</span>
          <span>Batch & tanggal</span>
          <span>Jadwal</span>
          <span>Kuota</span>
          <span className="text-right">Aksi</span>
        </div>

        <div className="divide-y divide-line">
          {rows.map((row) => {
            const remaining = Math.max(row.quota - row.enrolled, 0);
            const percent = Math.min(Math.round((row.enrolled / row.quota) * 100), 100);
            const full = remaining === 0;
            const almostFull = remaining > 0 && remaining <= 2;

            return (
              <div
                key={row.id}
                className="grid gap-3 px-5 py-5 transition-colors hover:bg-cream/40 lg:grid-cols-[1.5fr_1.1fr_1fr_0.9fr_auto] lg:items-center lg:gap-4 lg:px-6"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold text-ink">{row.courseName}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em]",
                        row.category === "Komputer"
                          ? "bg-brand/10 text-brand-strong"
                          : "bg-accent/10 text-accent",
                      )}
                    >
                      {row.category}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
                    <UserRound className="h-3 w-3" />
                    {row.instructor}
                  </p>
                </div>

                <div className="text-[12px] text-muted">
                  <p className="font-semibold text-ink/80">{row.batch}</p>
                  <p className="mt-0.5 flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" />
                    {formatShortDate(row.startDate)} – {formatShortDate(row.endDate)}
                  </p>
                </div>

                <div className="text-[12px] text-muted">
                  <p className="text-ink/80">{row.label}</p>
                  <p className="mt-0.5">
                    {row.mode} · {row.room}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10.5px] text-muted">
                    <span>
                      {row.enrolled}/{row.quota} terisi
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        full ? "text-red-600" : almostFull ? "text-amber-600" : "text-emerald-600",
                      )}
                    >
                      {full ? "Penuh" : almostFull ? "Hampir penuh" : `Sisa ${remaining}`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        full ? "bg-red-500" : almostFull ? "bg-amber-500" : "bg-brand-strong",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="lg:text-right">
                  <button
                    type="button"
                    disabled={full}
                    onClick={() => onRegister(row.courseId, row.id)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[11.5px] font-semibold text-ink transition-colors hover:border-brand-strong hover:bg-brand-strong hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-cream disabled:text-muted"
                  >
                    {full ? "Tutup" : "Pilih"}
                    {full ? null : <ArrowRight className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
          Belum ada batch aktif. Hubungi tim Academy untuk informasi jadwal berikutnya.
        </p>
      ) : null}
    </div>
  );
}
