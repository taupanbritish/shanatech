import { BookOpen, PencilLine, Plus } from "lucide-react";
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
import { deleteCourse, toggleCourseActive } from "@/app/admin/actions";
import { listAdminCourses } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = { title: "Program" };

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function ProgramsContent({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const params = await searchParams;

  await requireAdminSession();
  const courses = await listAdminCourses();
  const activeCount = courses.filter((course) => course.active).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Academy"
        title="Katalog program"
        description={`${courses.length} program tersimpan · ${activeCount} aktif di katalog publik.`}
        action={
          <Link
            href="/admin/program/baru"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white hover:bg-ink/85"
          >
            <Plus className="h-4 w-4" />
            Program baru
          </Link>
        }
      />

      <Notice notice={params.notice} />

      {courses.length === 0 ? (
        <EmptyState
          title="Belum ada program"
          description="Tambahkan program pertama agar tampil di katalog Academy dan dapat dipilih pendaftar."
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-[10px] tracking-[0.12em] text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Program</th>
                  <th className="px-3 py-3 font-semibold">Kategori</th>
                  <th className="px-3 py-3 font-semibold">Harga</th>
                  <th className="px-3 py-3 font-semibold">Batch</th>
                  <th className="px-3 py-3 font-semibold">Pendaftar</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-line/70 align-top last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand-strong">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-ink">
                            {course.name}
                            {course.featured ? (
                              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                Unggulan
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {course.level} · {course.durationLabel} · {course.sessions} sesi
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-muted/70">
                            /{course.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-ink">{course.category}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{course.mode}</p>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-ink">
                      {formatRupiah(course.price)}
                    </td>
                    <td className="px-3 py-4 text-ink">{course.scheduleCount}</td>
                    <td className="px-3 py-4 text-ink">{course.registrationCount}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={course.active ? "Aktif" : "Nonaktif"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <form action={toggleCourseActive}>
                          <input type="hidden" name="id" value={course.id} />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
                          >
                            {course.active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                        <Link
                          href={`/admin/program/${course.id}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteForm
                          action={deleteCourse}
                          id={course.id}
                          label="Hapus"
                          confirmMessage={`Hapus program "${course.name}"? Tindakan ini tidak bisa dibatalkan.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <p className="text-[11.5px] text-muted">
        Program yang sudah memiliki pendaftar tidak dapat dihapus — nonaktifkan agar hilang dari
        katalog publik tanpa menghilangkan riwayat.
      </p>
    </div>
  );
}

export default function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProgramsContent searchParams={searchParams} />
    </Suspense>
  );
}
