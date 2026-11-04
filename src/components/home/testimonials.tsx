import { Quote } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section className="border-y border-line bg-white">
      <div className="shell py-20 sm:py-28">
        <SectionHeading
          eyebrow="Cerita mereka"
          title="Kisah dari proyek dan kelas pertama."
          description="Belum banyak, tapi kami menuliskannya apa adanya. Setiap cerita ditulis dengan izin klien atau peserta; sebagian nama usaha disamarkan."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col rounded-[24px] border border-line bg-cream/70 p-7">
                <Quote className="h-7 w-7 text-brand-strong/40" strokeWidth={1.6} />
                <blockquote className="mt-5 flex-1 text-[14.5px] leading-relaxed text-ink/80">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-7 border-t border-line pt-5">
                  <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{testimonial.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
