import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthNotice, AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/account-forms";
import { getStudentSession, safeStudentNext } from "@/lib/student-auth";

export const metadata: Metadata = {
  title: "Masuk Akun Academy",
  description: "Masuk ke akun SHANATECH Academy untuk mengakses kelas online dan progres belajar.",
  robots: { index: false, follow: false },
};

type LoginParams = { next?: string; reset?: string; keluar?: string };

function LoginScreen({ next, notice }: { next: string; notice?: React.ReactNode }) {
  const registerHref =
    next === "/dashboard" ? "/register" : `/register?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell
      eyebrow="Akun Academy"
      title="Masuk ke akun Anda"
      description="Akses kelas online, lanjutkan progres belajar, dan unduh sertifikat dari satu tempat."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href={registerHref} className="font-semibold text-brand hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      <LoginForm next={next} notice={notice} />
    </AuthShell>
  );
}

async function LoginGate({ searchParams }: { searchParams: Promise<LoginParams> }) {
  const params = await searchParams;
  const next = safeStudentNext(params.next);

  const session = await getStudentSession();
  if (session) redirect(next);

  let notice: React.ReactNode;
  if (params.reset === "1") {
    notice = <AuthNotice>Password berhasil diganti. Silakan masuk dengan password baru.</AuthNotice>;
  } else if (params.keluar === "1") {
    notice = <AuthNotice tone="info">Anda sudah keluar dari akun.</AuthNotice>;
  } else if (params.next && next !== "/dashboard") {
    notice = <AuthNotice tone="info">Masuk terlebih dahulu untuk melanjutkan.</AuthNotice>;
  }

  return <LoginScreen next={next} notice={notice} />;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<LoginParams> }) {
  return (
    <Suspense fallback={<LoginScreen next="/dashboard" />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}
