import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { stats } from "@/lib/site";

export function StatsBand({
  title = "Angka adalah jejak, bukan tujuan.",
  description = "Angka kami masih kecil, dan itu wajar untuk tahun pertama. Kami menampilkannya apa adanya agar Anda tahu sedang bekerja dengan siapa.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand/10 blur-[100px]" />
      <div className="shell relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.8fr_2fr] lg:items-center">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Sejak 2026
          </p>
          <h2 className="mt-4 max-w-xs text-2xl leading-snug font-semibold sm:text-3xl">{title}</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">{description}</p>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="border-l border-white/10 pl-5">
                <p className="font-display text-4xl font-semibold text-white sm:text-[42px]">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-white/45">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
