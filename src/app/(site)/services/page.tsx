import type { Metadata } from "next";
import { ArrowUpRight, CalendarRange, GitBranch, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaPanel } from "@/components/shared/cta-panel";
import { ServiceCard } from "@/components/services/service-grid";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Layanan SHANATECH: pengembangan web dan aplikasi, mobile app, UI/UX, cloud & DevOps, data & AI, serta konsultasi dan pemeliharaan IT.",
};

const engagements = [
  {
    icon: CalendarRange,
    title: "Project-based",
    description:
      "Cocok untuk produk baru atau perombakan besar dengan ruang lingkup dan tenggat yang jelas.",
    points: ["Estimasi & milestone tertulis", "Tim khusus hingga rilis", "Serah terima + garansi 90 hari"],
  },
  {
    icon: ShieldCheck,
    title: "Retainer",
    description:
      "Untuk produk yang sudah berjalan dan butuh pemeliharaan, perbaikan, serta pengembangan bertahap.",
    points: ["Kuota jam kerja bulanan", "SLA respons 1×24 jam", "Laporan kesehatan sistem"],
  },
  {
    icon: GitBranch,
    title: "Embedded team",
    description:
      "Tim Anda butuh tambahan kapasitas? Kami bergabung ke alur kerja dan ritme tim yang sudah ada.",
    points: ["Integrasi ke board & repo Anda", "Ritme sprint bersama", "Transfer pengetahuan"],
  },
];

const process = [
  {
    step: "01",
    title: "Discovery",
    duration: "1–2 pekan",
    text: "Memahami tujuan bisnis, pengguna, batasan teknis, dan menyusun ruang lingkup awal.",
  },
  {
    step: "02",
    title: "Rancangan",
    duration: "2–3 pekan",
    text: "Alur pengguna, wireframe, arsitektur sistem, dan rencana rilis yang bisa dieksekusi.",
  },
  {
    step: "03",
    title: "Build",
    duration: "Sesuai scope",
    text: "Pengembangan dalam siklus dua pekan dengan demo, review kode, dan lingkungan staging.",
  },
  {
    step: "04",
    title: "Uji & rilis",
    duration: "1–2 pekan",
    text: "Pengujian fungsional, performa, keamanan dasar, lalu peluncuran dan pelatihan tim.",
  },
  {
    step: "05",
    title: "Rawat",
    duration: "Berkelanjutan",
    text: "Monitoring, perbaikan, iterasi fitur, dan dokumentasi yang terus diperbarui.",
  },
];

const stack = [
  { group: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  { group: "Backend", items: ["Node.js", "PostgreSQL", "REST / GraphQL", "Redis"] },
  { group: "Mobile", items: ["Flutter", "React Native", "Firebase"] },
  { group: "Cloud & Data", items: ["AWS", "Docker", "CI/CD", "Python", "Metabase"] },
  { group: "Design", items: ["Figma", "Design system", "Usability testing"] },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Layanan"
        title={
          <>
            Dari ide sampai sistem
            <br className="hidden sm:block" /> yang berjalan.
          </>
        }
        description="Kami tidak menjual daftar teknologi. Kami membantu memilih pendekatan yang paling masuk akal untuk tahap bisnis Anda, lalu mengerjakannya dengan disiplin."
      >
        <div className="flex flex-wrap gap-2.5">
          {["Discovery", "Design", "Build", "Rilis", "Rawat"].map((item, index) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65"
            >
              <span className="text-[10px] text-brand">0{index + 1}</span>
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="shell py-20 sm:py-24">
        <SectionHeading
          eyebrow="Kapabilitas"
          title="Enam layanan, satu tim yang saling terhubung."
          description="Setiap layanan bisa berdiri sendiri, tetapi paling kuat ketika dikombinasikan dalam satu roadmap yang utuh."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={(index % 3) * 0.06}>
              <ServiceCard service={service} index={index} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="shell py-20 sm:py-24">
          <SectionHeading
            eyebrow="Cara bekerja sama"
            title="Pilih ritme yang sesuai dengan tim Anda."
            description="Tidak ada satu model kerja yang cocok untuk semua. Kami akan menyarankan model yang paling efisien setelah sesi discovery singkat."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {engagements.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 0.08}>
                  <div className="h-full rounded-[26px] border border-line bg-cream/60 p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-ink">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.description}</p>
                    <ul className="mt-5 space-y-2 border-t border-line pt-4 text-[12.5px] text-ink/65">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-strong" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="shell py-20 sm:py-24">
        <SectionHeading
          eyebrow="Proses"
          title="Ritme kerja yang bisa Anda pantau."
          description="Setiap tahap punya keluaran yang jelas, sehingga Anda selalu tahu posisi proyek dan apa yang dibutuhkan dari tim Anda."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {process.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.06}>
              <div className="relative h-full border-t border-line pt-6">
                <span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-brand-strong" />
                <p className="font-display text-xs font-semibold text-brand-strong">{item.step}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted/60">
                  {item.duration}
                </p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="shell py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <SectionHeading
                eyebrow="Teknologi"
                title="Alat yang kami kuasai, dipilih sesuai kebutuhan."
                description="Kami mengutamakan teknologi yang matang, mudah dirawat, dan punya talenta tersedia di pasar lokal."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-6">
                {stack.map((group) => (
                  <div
                    key={group.group}
                    className="grid gap-3 border-b border-line pb-5 sm:grid-cols-[120px_1fr] sm:items-start"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {group.group}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-line bg-cream px-3 py-1.5 text-[11.5px] font-medium text-ink/70"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaPanel
        title="Butuh ruang lingkup dan estimasi?"
        description="Ceritakan konteks proyek Anda. Kami akan memberikan gambaran pendekatan, estimasi waktu, dan langkah berikutnya secara tertulis."
        primaryLabel="Minta konsultasi"
        secondaryLabel="Lihat cara kami bekerja"
        secondaryHref="/why-us"
        secondaryIcon="none"
      />

      <div className="shell pb-16">
        <a
          href="/academy"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand-strong"
        >
          Butuh pelatihan untuk tim? Lihat program in-house Academy
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </>
  );
}
