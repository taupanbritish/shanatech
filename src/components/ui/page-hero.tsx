import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-brand/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-40%] left-[-10%] h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]" />
      <div className="shell relative pt-36 pb-20 sm:pt-40 sm:pb-24">
        <Reveal>
          <p className="mb-5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl leading-[1.06] font-semibold sm:text-5xl lg:text-[60px]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-lg">
            {description}
          </p>
          {children ? <div className="mt-9">{children}</div> : null}
        </Reveal>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-navy" />
    </section>
  );
}
