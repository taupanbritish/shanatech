import { CalendarDays, PencilLine, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  Notice,
  StatusBadge,
} from "@/components/admin/admin-ui";
import { DeleteForm } from "@/components/admin/delete-form";
import { deleteSchedule } from "@/app/admin/actions";
import { listAdminSchedules } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";
import { formatShortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Jadwal" };

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function SchedulesContent({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const params = await searchParams;

  await requireAdminSession();
  const schedules = await listAdminSchedules();
  const openCount = schedules.filter((schedule) => schedule.status === "Dibuka").length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Academy"
        title="Jadwal & batch"
        description={`${schedules.length} batch terdaftar · ${openCount} sedang dibuka untuk pendaftaran.`}
        action={
          <Link
            href="/admin/jadwal/baru"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white hover:bg-ink/85"
          >
            <Plus className="h-4 w-4" />
            Batch baru
          </Link>
        }
      />

      <Notice notice={params.notice} />

      {schedules.length === 0 ? (
        <EmptyState
          title="Belum ada batch"
          description="Buat batch pertama untuk menampilkan jadwal di halaman Academy."
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-[10px] tracking-[0.12em] text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Program & batch</th>
                  <th className="px-3 py-3 font-semibold">Jadwal</th>
                  <th className="px-3 py-3 font-semibold">Periode</th>
                  <th className="px-3 py-3 font-semibold">Kuota</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const percent = Math.min(
                    100,
                    Math.round((schedule.enrolled / Math.max(1, schedule.quota)) * 100),
                  );
                  return (
                    <tr
                      key={schedule.id}
                      className="border-b border-line/70 align-top last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                            <CalendarDays className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-ink">{schedule.courseName}</p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {schedule.batch} · {schedule.category} · {schedule.mode}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {schedule.instructor} · {schedule.room}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-ink">{schedule.label}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-[11.5px] text-muted">
                        {formatShortDate(schedule.startDate)}
                        <span className="block">
                          s.d. {formatShortDate(schedule.endDate)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-ink">
                          {schedule.enrolled}/{schedule.quota}
                        </p>
                        <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-cream">
                          <div
                            className="h-full rounded-full bg-brand-strong"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={schedule.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            href={`/admin/jadwal/${schedule.id}`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <DeleteForm
                            action={deleteSchedule}
                            id={schedule.id}
                            label="Hapus"
                            confirmMessage={`Hapus ${schedule.batch} untuk "${schedule.courseName}"? Tindakan ini tidak bisa dibatalkan.`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <p className="text-[11.5px] text-muted">
        Batch dengan peserta aktif tidak dapat dihapus. Ubah status menjadi Selesai atau Tutup
        pendaftaran untuk menyimpan riwayatnya.
      </p>
    </div>
  );
}

export default function SchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <SchedulesContent searchParams={searchParams} />
    </Suspense>
  );
}
