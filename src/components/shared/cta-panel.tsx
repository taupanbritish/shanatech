import { ArrowUpRight, GraduationCap } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function CtaPanel({
  title = "Punya ide, atau ingin mulai belajar?",
  description = "Ceritakan kebutuhan Anda. Kami akan merespons maksimal 1×24 jam pada hari kerja — tanpa biaya konsultasi awal.",
  primaryLabel = "Mulai proyek",
  primaryHref = "/contact",
  secondaryLabel = "Daftar kelas",
  secondaryHref = "/academy#daftar",
  secondaryIcon = "academy",
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryIcon?: "academy" | "none";
}) {
  return (
    <section className="shell py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-[32px] bg-navy px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-[-40%] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-brand/20 blur-[110px]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Langkah berikutnya
          </p>
          <h2 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={primaryHref} size="lg">
              {primaryLabel}
              <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
            {secondaryIcon === "academy" ? (
              <ButtonLink href={secondaryHref} variant="ghost" size="lg">
                <GraduationCap className="h-4 w-4" />
                {secondaryLabel}
              </ButtonLink>
            ) : (
              <ButtonLink href={secondaryHref} variant="ghost" size="lg">
                {secondaryLabel}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
