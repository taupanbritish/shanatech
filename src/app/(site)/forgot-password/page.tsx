import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/auth-shell";
import { ForgotPasswordForm } from "@/components/account/account-forms";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Minta tautan untuk mengatur ulang password akun SHANATECH Academy.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Akun Academy"
      title="Lupa password?"
      description="Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat password baru yang berlaku 60 menit."
      footer={
        <>
          Ingat password Anda?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
