import { BookOpen, LogOut, Mail, Phone, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { logoutStudent } from "@/app/account-actions";
import { ButtonLink } from "@/components/ui/button";
import { requireStudentSession } from "@/lib/student-auth";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Peserta",
  robots: { index: false, follow: false },
};

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-brand/15 blur-[120px]" />
        <div className="shell relative pt-32 pb-14 sm:pt-36">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-brand uppercase">
            Dashboard peserta
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Akun Academy Anda</h1>
        </div>
      </section>
      <section className="bg-cream py-12 sm:py-16">
        <div className="shell">{children}</div>
      </section>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div className="h-72 animate-pulse rounded-3xl border border-line bg-white" />
      <div className="h-72 animate-pulse rounded-3xl border border-line bg-white" />
    </div>
  );
}

async function DashboardContent() {
  const student = await requireStudentSession("/dashboard");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand-strong">
            <UserRound className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink">
              {student.fullName}
            </p>
            <p className="text-[12px] text-muted">
              Bergabung {formatDateTime(student.createdAt)} WIB
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-[13.5px]">
          <div className="flex items-center gap-2.5 text-ink/80">
            <Mail className="h-4 w-4 shrink-0 text-muted" />
            <dt className="sr-only">Email</dt>
            <dd className="truncate">{student.email}</dd>
          </div>
          <div className="flex items-center gap-2.5 text-ink/80">
            <Phone className="h-4 w-4 shrink-0 text-muted" />
            <dt className="sr-only">Nomor WhatsApp</dt>
            <dd>{student.phone ?? "Belum diisi"}</dd>
          </div>
        </dl>

        <form action={logoutStudent} className="mt-8">
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[13px] font-semibold text-ink transition-colors hover:border-ink/25"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-brand-strong" />
          <h2 className="font-display text-lg font-semibold text-ink">Kelas online saya</h2>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-line px-5 py-10 text-center">
          <p className="font-semibold text-ink">Belum ada kelas online</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Kelas online mandiri sedang kami siapkan. Sementara itu, Anda tetap bisa mendaftar
            program batch tatap muka di Academy.
          </p>
          <ButtonLink href="/academy" size="sm" variant="outline" className="mt-5">
            Lihat program Academy
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardShell>
  );
}
