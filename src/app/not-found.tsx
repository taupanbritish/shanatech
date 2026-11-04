import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
      <div className="shell relative flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <p className="font-display text-[88px] leading-none font-semibold text-white/10 sm:text-[140px]">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Halaman tidak ditemukan.</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
          Alamat yang Anda tuju mungkin sudah dipindahkan atau tidak pernah ada. Mari kembali ke
          halaman utama.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-navy transition-colors hover:bg-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke beranda
        </Link>
      </div>
    </section>
  );
}
