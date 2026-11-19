import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetPasswordForm } from "@/components/account/account-forms";

export const metadata: Metadata = {
  title: "Atur Ulang Password",
  robots: { index: false, follow: false },
};

function MissingToken() {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-[13.5px] leading-relaxed text-amber-900"
    >
      Tautan reset tidak lengkap. Buka kembali tautan dari email Anda, atau minta tautan baru.
      <p className="mt-3">
        <Link href="/forgot-password" className="font-semibold text-amber-900 underline">
          Minta tautan reset baru
        </Link>
      </p>
    </div>
  );
}

async function ResetGate({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (typeof token !== "string" || token.length === 0) return <MissingToken />;
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <AuthShell
      eyebrow="Akun Academy"
      title="Buat password baru"
      description="Setelah disimpan, semua perangkat yang masih masuk dengan password lama akan dikeluarkan."
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-cream" />}>
        <ResetGate searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
