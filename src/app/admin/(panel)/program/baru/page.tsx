import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CourseForm } from "@/components/admin/course-form";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Program Baru" };

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-[520px] animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function NewProgramContent() {
  await requireAdminSession();

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
        eyebrow="Program baru"
        title="Tambahkan program Academy"
        description="Lengkapi informasi program. Setelah disimpan, program langsung tampil di katalog bila statusnya aktif."
      />

      <CourseForm />
    </div>
  );
}

export default function NewProgramPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewProgramContent />
    </Suspense>
  );
}
