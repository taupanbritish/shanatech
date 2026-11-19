import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/account-forms";
import { getStudentSession, safeStudentNext } from "@/lib/student-auth";

export const metadata: Metadata = {
  title: "Buat Akun Academy",
  description: "Buat akun SHANATECH Academy untuk mengikuti kelas online dan menyimpan progres belajar.",
  robots: { index: false, follow: false },
};

function RegisterScreen({ next }: { next: string }) {
  const loginHref = next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      eyebrow="Akun Academy"
      title="Buat akun peserta"
      description="Gratis. Satu akun untuk semua kelas online, progres belajar, dan sertifikat Anda."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href={loginHref} className="font-semibold text-brand hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}

async function RegisterGate({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeStudentNext(params.next);

  const session = await getStudentSession();
  if (session) redirect(next);

  return <RegisterScreen next={next} />;
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<RegisterScreen next="/dashboard" />}>
      <RegisterGate searchParams={searchParams} />
    </Suspense>
  );
}
