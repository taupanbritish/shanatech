import { ArrowUpRight, Clock, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { academyPrograms } from "@/lib/content";

export function AcademySpotlight() {
  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[32px] bg-linear-to-br from-brand/15 to-accent/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-line bg-white p-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[21px]">
                <Image
                  src="/images/academy-classroom.png"
                  alt="Ruang kelas komputer Shanatech Academy dengan meja dan monitor modern"
                  fill
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-6 left-5 right-5 flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/95 p-4 shadow-xl backdrop-blur sm:left-8 sm:right-auto sm:min-w-[280px]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Peserta · 3 angkatan
                </p>
                <p className="font-display text-2xl font-semibold text-ink">40+</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-strong">
                <GraduationCap className="h-5 w-5" />
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-strong" />
            Shanatech Academy
          </p>
          <h2 className="text-3xl leading-[1.12] font-semibold sm:text-4xl lg:text-[44px]">
            Keterampilan yang dipakai,
            <br className="hidden sm:block" /> bukan sekadar dipelajari.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Kelas komputer dan bahasa Inggris dengan kelompok kecil, mentor praktisi, dan proyek
            nyata. Tersedia jadwal sore, malam, akhir pekan, serta format hybrid.
          </p>

          <div className="mt-8 divide-y divide-line border-y border-line">
            {academyPrograms.map((program) => (
              <Link
                key={program.slug}
                href="/academy#program"
                className="group flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink transition-colors group-hover:text-brand-strong">
                    {program.name}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
                    <span>{program.category}</span>
                    <span className="h-1 w-1 rounded-full bg-muted/30" />
                    <span>{program.level}</span>
                    <span className="h-1 w-1 rounded-full bg-muted/30" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {program.duration}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden text-sm font-semibold text-ink sm:block">
                    {program.price}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-brand-strong group-hover:bg-brand-strong group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/academy" variant="outline">
              Lihat semua program
              <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/academy#daftar" variant="primary">
              Daftar kelas
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
