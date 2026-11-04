import type { Metadata } from "next";
import { BadgeCheck, FileText, KeyRound, Timer } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaPanel } from "@/components/shared/cta-panel";
import { StatsBand } from "@/components/shared/stats-band";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhyExplorer } from "@/components/why-us/why-explorer";

export const metadata: Metadata = {
  title: "Kenapa Kami",
  description:
    "Enam alasan memilih SHANATECH: tim kecil yang menangani langsung, proses transparan, hasil terukur, dukungan pasca-rilis, ekosistem belajar, dan keamanan sejak awal.",
};

const guarantees = [
  {
    icon: BadgeCheck,
    title: "Garansi 90 hari",
    text: "Bug yang muncul setelah rilis kami perbaiki tanpa biaya tambahan.",
  },
  {
    icon: Timer,
    title: "SLA 1×24 jam",
    text: "Tiket prioritas dijawab pada hari kerja berikutnya, dengan jalur eskalasi jelas.",
  },
  {
    icon: KeyRound,
    title: "Akses penuh",
    text: "Repository, aset desain, dan dokumentasi menjadi milik Anda sejak awal.",
  },
  {
    icon: FileText,
    title: "Dokumentasi lengkap",
    text: "Panduan teknis dan serah terima agar tim internal bisa melanjutkan.",
  },
];

export default function WhyUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Kenapa kami"
        title={
          <>
            Bukan yang paling ramai.
            <br className="hidden sm:block" /> Yang paling bisa diandalkan.
          </>
        }
        description="Kami memilih bekerja dengan cara yang mungkin terasa lebih tenang: ruang lingkup jelas, komunikasi terbuka, dan tanggung jawab yang tidak dilempar ke orang lain."
      >
        <div className="flex flex-wrap gap-2.5">
          {["Sejak 2026", "2 klien kembali", "Tim kecil & langsung", "Binjai & remote"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65"
            >
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="shell py-20 sm:py-24">
        <SectionHeading
          eyebrow="Enam alasan"
          title="Hal-hal yang kami jaga di setiap kerja sama."
          description="Pilih alasan yang paling relevan dengan kebutuhan Anda — setiap bagian menjelaskan bagaimana kami menerapkannya."
        />
        <div className="mt-12">
          <WhyExplorer />
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="shell py-20 sm:py-24">
          <SectionHeading
            eyebrow="Yang selalu Anda dapatkan"
            title="Jaminan yang tertulis, bukan sekadar janji lisan."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 0.06}>
                  <div className="h-full rounded-[24px] border border-line bg-cream/60 p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-strong ring-1 ring-inset ring-line">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <p className="mt-5 text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <StatsBand
        title="Kepercayaan yang bisa diperiksa."
        description="Kami tidak meminta Anda percaya begitu saja. Metrik ini kami tinjau setiap kuartal dan gunakan untuk memperbaiki cara kerja."
      />

      <CtaPanel
        title="Mari uji kecocokan lewat satu percakapan."
        description="Konsultasi awal 30 menit tanpa biaya. Kami akan mendengar konteks Anda dan menyampaikan apakah kami bisa membantu — apa adanya."
        primaryLabel="Jadwalkan konsultasi"
        secondaryLabel="Lihat layanan"
        secondaryHref="/services"
        secondaryIcon="none"
      />
    </>
  );
}
