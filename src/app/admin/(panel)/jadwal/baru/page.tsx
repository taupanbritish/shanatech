import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader, EmptyState } from "@/components/admin/admin-ui";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { listCourseOptions } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Batch Baru" };

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-[440px] animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function NewScheduleContent() {
  await requireAdminSession();
  const courses = await listCourseOptions();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/jadwal"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar batch
      </Link>

      <AdminPageHeader
        eyebrow="Batch baru"
        title="Buat jadwal kelas"
        description="Batch berstatus Dibuka akan tampil di halaman Academy dan bisa dipilih saat pendaftaran."
      />

      {courses.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="Belum ada program"
            description="Batch harus terhubung ke program. Tambahkan program terlebih dahulu, lalu buat jadwalnya."
          />
          <Link
            href="/admin/program/baru"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink/85"
          >
            <BookOpen className="h-4 w-4" />
            Tambah program
          </Link>
        </div>
      ) : (
        <ScheduleForm courses={courses} />
      )}
    </div>
  );
}

export default function NewSchedulePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewScheduleContent />
    </Suspense>
  );
}
