import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { getAdminSchedule, listCourseOptions } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit Batch" };

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-[440px] animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function EditScheduleContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scheduleId = Number(id);

  await requireAdminSession();
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) notFound();

  const [schedule, courses] = await Promise.all([
    getAdminSchedule(scheduleId),
    listCourseOptions(),
  ]);
  if (!schedule) notFound();

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
        eyebrow={schedule.courseName}
        title={`${schedule.batch} · ${schedule.label}`}
        description={`${schedule.enrolled} peserta aktif dari kuota ${schedule.quota}. Kuota tidak dapat dikurangi di bawah jumlah peserta.`}
      />

      <ScheduleForm schedule={schedule} courses={courses} />
    </div>
  );
}

export default function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditScheduleContent params={params} />
    </Suspense>
  );
}
