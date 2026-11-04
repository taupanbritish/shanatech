import { ArrowUpRight, GraduationCap, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function DualPath() {
  return (
    <section className="shell py-20 sm:py-28">
      <SectionHeading
        eyebrow="Satu mitra, dua misi"
        title={
          <>
            Kami membangun produknya.
            <br className="hidden sm:block" /> Dan orang-orangnya.
          </>
        }
        description="Dua lini usaha yang saling menguatkan: tim produk yang mengerjakan tantangan nyata, dan Academy yang menyiapkan talenta untuk tantangan berikutnya."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <article className="group relative h-full overflow-hidden rounded-[28px] bg-navy p-8 text-white sm:p-10">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/20 blur-[80px]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand ring-1 ring-inset ring-brand/20">
                  <Layers className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  01 · Build
                </span>
              </div>
              <h3 className="mt-7 text-2xl font-semibold sm:text-3xl">Bangun bersama SHANATECH</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                Dari website perusahaan hingga platform internal, kami merancang, membangun, dan
                merawat produk digital bersama tim Anda.
              </p>
              <ul className="mt-6 space-y-2.5 text-[13px] text-white/70">
                {[
                  "Discovery, desain, dan pengembangan dalam satu tim",
                  "Transparan: akses repo, board, dan staging",
                  "Garansi 90 hari serta opsi pemeliharaan",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex-1" />
              <Link
                href="/services"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/12 transition-colors hover:bg-white/14"
              >
                Jelajahi layanan
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.1}>
          <article className="group relative h-full overflow-hidden rounded-[28px] border border-line bg-white p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-[80px]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/15">
                  <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/60">
                  02 · Grow
                </span>
              </div>
              <h3 className="mt-7 text-2xl font-semibold sm:text-3xl">
                Tumbuh di Shanatech Academy
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                Kelas komputer dan bahasa Inggris dengan kelompok kecil, mentor praktisi, dan
                proyek yang benar-benar bisa dipakai untuk melamar kerja.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Web Development", "Desain Grafis", "English Conversation", "IELTS"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-[11px] font-medium text-ink/65 ring-1 ring-inset ring-line"
                  >
                    <Sparkles className="h-3 w-3 text-accent" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex-1" />
              <Link
                href="/academy"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-ink/85"
              >
                Lihat program & jadwal
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
