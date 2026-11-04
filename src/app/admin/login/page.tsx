import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

function LoginScreen({ next }: { next: string }) {
  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-brand/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[380px] w-[380px] rounded-full bg-accent/20 blur-[120px]" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative mt-auto max-w-md pb-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-brand uppercase">
            Panel operasional
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold">
            Satu tempat untuk pendaftaran, kelas, dan pesan klien.
          </h1>
          <ul className="mt-8 space-y-3 text-[13.5px] text-white/60">
            {[
              "Pantau pendaftar Academy dan sisa kursi tiap batch.",
              "Ubah status tindak lanjut tanpa membuka database.",
              "Kelola program, jadwal, dan katalog publik.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="relative inline-flex items-center gap-2 text-[12.5px] text-white/45 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke situs SHANATECH
        </Link>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Link href="/">
              <Logo tone="dark" />
            </Link>
          </div>

          <div className="mt-10 rounded-3xl border border-line bg-white p-7 shadow-[0_30px_80px_-60px_rgba(7,20,38,0.5)] sm:p-9 lg:mt-0">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-strong uppercase">
              Akses terbatas
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Masuk ke panel admin</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Gunakan email dan password admin SHANATECH. Semua perubahan langsung tersimpan di
              PostgreSQL.
            </p>
            <AdminLoginForm next={next} />
          </div>

          <p className="mt-6 text-center text-[11.5px] text-muted lg:hidden">
            <Link href="/" className="font-medium text-ink hover:underline">
              Kembali ke situs publik
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

async function LoginGate({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const next =
    typeof params.next === "string" &&
    params.next.startsWith("/admin") &&
    !params.next.startsWith("/admin/login")
      ? params.next
      : "/admin";

  return <LoginScreen next={next} />;
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<LoginScreen next="/admin" />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}
