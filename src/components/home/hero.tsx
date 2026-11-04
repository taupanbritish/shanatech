import { ArrowRight, ArrowUpRight, GraduationCap, Sparkles } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

const stack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Node.js"];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-40 right-[-5%] h-[600px] w-[600px] rounded-full bg-brand/15 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-15%] h-[520px] w-[520px] rounded-full bg-accent/15 blur-[130px]" />

      <div className="shell relative grid gap-14 pt-32 pb-16 sm:pt-36 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pt-40 lg:pb-24">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            IT Solutions × Digital Academy
          </div>

          <h1 className="mt-7 text-[40px] leading-[1.06] font-semibold sm:text-5xl lg:text-[56px]">
            <span className="lg:block">Membangun produk </span>
            <span className="lg:block">digital. </span>
            <span className="lg:block">Menumbuhkan talenta </span>
            <span className="text-gradient lg:block">berikutnya.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-lg">
            SHANATECH membantu bisnis merancang dan membangun perangkat lunak yang tepat guna —
            sekaligus menyiapkan talenta digital melalui Shanatech Academy.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Mulai proyek
              <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/academy" variant="ghost" size="lg">
              <GraduationCap className="h-4 w-4" />
              Jelajahi Academy
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center">
              {[
                { initial: "N", name: "Nadia", tone: "from-cyan-400 to-blue-500" },
                { initial: "K", name: "Kevin", tone: "from-violet-400 to-fuchsia-500" },
                { initial: "A", name: "Ayu", tone: "from-amber-300 to-orange-500" },
              ].map((avatar, index) => (
                <span
                  key={avatar.initial}
                  title={avatar.name}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-navy bg-linear-to-br ${avatar.tone} text-xs font-bold text-navy ${
                    index > 0 ? "-ml-2.5" : ""
                  }`}
                >
                  {avatar.initial}
                </span>
              ))}
              <span className="-ml-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-navy bg-white/10 text-[10px] font-semibold text-white">
                +40
              </span>
            </div>
            <p className="text-xs leading-relaxed text-white/50">
              Dipercaya <span className="font-semibold text-white/85">3 bisnis lokal</span>
              <br className="hidden sm:block" /> dan 40+ peserta Academy dari 3 angkatan.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} y={30}>
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-3 rounded-[34px] bg-linear-to-tr from-brand/30 via-transparent to-accent/30 blur-2xl" />
            <div className="relative rounded-[30px] border border-white/12 bg-white/5 p-2 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[23px]">
                <Image
                  src="/images/hero-visual.png"
                  alt="Ilustrasi abstrak lapisan data dan panel kaca melambangkan solusi digital SHANATECH"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 560px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-navy/50 via-transparent to-transparent" />
              </div>
            </div>

            <div className="animate-float absolute -left-2 bottom-6 flex items-center gap-3 rounded-2xl border border-white/12 bg-navy/85 p-3.5 shadow-xl backdrop-blur-xl sm:-left-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand">
                <ArrowRight className="h-4 w-4 -rotate-45" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Respons awal</p>
                <p className="font-display text-lg font-semibold text-white">≤1×24 jam</p>
              </div>
            </div>

            <div className="animate-float-slow absolute -right-2 top-8 hidden items-center gap-3 rounded-2xl border border-white/12 bg-white/95 p-3.5 text-ink shadow-xl sm:flex sm:-right-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/5 text-ink">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Kelas berikutnya</p>
                <p className="text-[13px] font-semibold">English Conversation · 10 Nov</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 pl-1">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/55"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
