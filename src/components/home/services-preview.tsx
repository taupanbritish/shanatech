import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceIcon } from "@/components/ui/service-icon";
import { services } from "@/lib/content";

export function ServicesPreview() {
  return (
    <section className="border-y border-line bg-white">
      <div className="shell py-20 sm:py-28">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Layanan"
            title={
              <>
                Dari baris kode
                <br className="hidden sm:block" /> sampai pengalaman pengguna.
              </>
            }
            description="Enam kapabilitas yang bisa dikombinasikan sesuai tahap bisnis Anda — mulai dari validasi ide sampai pemeliharaan jangka panjang."
          />
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-strong"
          >
            Lihat semua layanan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {services.slice(0, 3).map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.08}>
              <Link
                href={`/services#${service.slug}`}
                className="group flex h-full flex-col rounded-[24px] border border-line bg-cream/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-strong/25 hover:bg-white hover:shadow-[0_24px_60px_-30px_rgba(7,20,38,0.28)]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white transition-colors group-hover:bg-brand-strong">
                    <ServiceIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-muted/40">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-ink">{service.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{service.tagline}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {service.deliverables.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-medium text-muted ring-1 ring-inset ring-line"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-2 pt-7 text-[12px] font-semibold text-ink/60 transition-colors group-hover:text-brand-strong">
                  Pelajari layanan
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
