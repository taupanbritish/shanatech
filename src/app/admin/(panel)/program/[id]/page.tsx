import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CourseForm } from "@/components/admin/course-form";
import { getAdminCourse } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit Program" };

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-[520px] animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function EditProgramContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const courseId = Number(id);

  await requireAdminSession();
  if (!Number.isInteger(courseId) || courseId <= 0) notFound();

  const course = await getAdminCourse(courseId);
  if (!course) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/program"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke katalog program
      </Link>

      <AdminPageHeader
        eyebrow={course.category}
        title={course.name}
        description="Perbarui informasi program. Perubahan langsung tersinkron ke halaman Academy."
      />

      <CourseForm course={course} />
    </div>
  );
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditProgramContent params={params} />
    </Suspense>
  );
}
