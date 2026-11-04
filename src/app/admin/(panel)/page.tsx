import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/admin/admin-ui";
import { getDashboardData } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";
import { formatDateTime, formatShortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
      </div>
    </div>
  );
}

async function DashboardContent() {
  await requireAdminSession();
  const { stats, recent, upcoming } = await getDashboardData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ringkasan"
        title="Selamat datang di panel SHANATECH."
        description="Pantau pendaftaran Academy, pesan klien, dan kesiapan batch dari satu tempat."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/program/baru"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white hover:bg-ink/85"
            >
              <Plus className="h-4 w-4" />
              Program baru
            </Link>
            <Link
              href="/admin/jadwal/baru"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[12.5px] font-semibold text-ink hover:border-ink/25"
            >
              <CalendarDays className="h-4 w-4" />
              Batch baru
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pendaftar baru"
          value={stats.newRegistrations}
          hint={`${stats.totalRegistrations} pendaftaran aktif total`}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Pesan baru"
          value={stats.newMessages}
          hint="Konsultasi yang belum ditindaklanjuti"
          icon={<MessageSquare className="h-5 w-5" />}
          tone="violet"
        />
        <StatCard
          label="Program aktif"
          value={stats.activeCourses}
          hint="Tampil di katalog Academy"
          icon={<BookOpen className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Batch dibuka"
          value={stats.openSchedules}
          hint={`${stats.enrolledStudents} siswa berstatus terdaftar`}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <AdminCard className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">Pendaftaran terbaru</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Enam pendaftar terakhir dari website.</p>
            </div>
            <Link
              href="/admin/pendaftaran"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-strong hover:underline"
            >
              Lihat semua
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Belum ada pendaftaran"
                description="Pendaftaran dari halaman Academy akan muncul di sini secara otomatis."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/60 text-[10px] tracking-[0.12em] text-muted uppercase">
                    <th className="px-5 py-2.5 font-semibold">Pendaftar</th>
                    <th className="px-3 py-2.5 font-semibold">Program</th>
                    <th className="px-3 py-2.5 font-semibold">Masuk</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.id} className="border-b border-line/70 last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{row.fullName}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{row.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ink">{row.courseName}</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {row.batch ? `${row.batch} · ${row.scheduleLabel ?? ""}` : "Belum pilih jadwal"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[11.5px] whitespace-nowrap text-muted">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">Batch terdekat</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Berdasarkan tanggal mulai.</p>
            </div>
            <Link
              href="/admin/jadwal"
              className="text-[12px] font-semibold text-brand-strong hover:underline"
            >
              Kelola
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {upcoming.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line bg-cream/50 px-4 py-8 text-center text-[12.5px] text-muted">
                Belum ada batch terbuka.
              </p>
            ) : (
              upcoming.map((schedule) => {
                const percent = Math.min(100, Math.round((schedule.enrolled / schedule.quota) * 100));
                return (
                  <div key={schedule.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12.5px] font-semibold text-ink">{schedule.courseName}</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {schedule.batch} · mulai {formatShortDate(schedule.startDate)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-ink">
                        {schedule.enrolled}/{schedule.quota}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full rounded-full bg-brand-strong"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
