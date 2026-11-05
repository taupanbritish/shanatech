import type { Metadata } from "next";
import { connection } from "next/server";
import { CalendarDays, GraduationCap, Rocket, Users } from "lucide-react";
import { Suspense } from "react";
import { AcademyClient } from "@/components/academy/academy-client";
import { Reveal } from "@/components/motion/reveal";
import { CtaPanel } from "@/components/shared/cta-panel";
import { Accordion } from "@/components/ui/accordion";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { academyBenefits, faqs } from "@/lib/content";
import { getAcademyCatalog } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shanatech Academy",
  description:
    "Program komputer dan bahasa Inggris di Shanatech Academy: web development, desain grafis, administrasi, Python, English Conversation, IELTS, dan TOEFL. Daftar kelas online.",
};

const benefitIcons = [Users, GraduationCap, Rocket, CalendarDays];

async function AcademyData() {
  await connection();
  const courses = await getAcademyCatalog();
  return <AcademyClient courses={courses} />;
}

function AcademySkeleton() {
  return (
    <section className="shell py-20 sm:py-24" aria-busy="true" aria-label="Memuat program">
      <div className="h-4 w-32 animate-pulse rounded-full bg-line" />
      <div className="mt-4 h-9 w-80 max-w-full animate-pulse rounded-lg bg-line" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-[24px] border border-line bg-white/70"
          />
        ))}
      </div>
    </section>
  );
}

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Shanatech Academy"
        title={
          <>
            Keterampilan baru.
            <br className="hidden sm:block" /> Dimulai dari satu kelas.
          </>
        }
        description="Lembaga kursus dan pelatihan untuk komputer dan bahasa Inggris. Kelas kecil, mentor praktisi, dan jadwal yang bisa disesuaikan dengan ritme Anda."
      >
        <div className="flex flex-wrap gap-2.5">
          {["11 program aktif", "Komputer & Bahasa Inggris", "Kelas hybrid", "Maks. 16 peserta"].map(
            (item) => (
              <span
                key={item}
                className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65"
              >
                {item}
              </span>
            ),
          )}
        </div>
      </PageHero>

      <section className="border-b border-line bg-white">
        <div className="shell py-16 sm:py-20">
          <SectionHeading
            eyebrow="Cara kami mengajar"
            title="Belajar yang terasa seperti bekerja di proyek nyata."
            description="Kami merancang kelas dari kebutuhan industri, bukan dari buku teks yang sudah usang."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {academyBenefits.map((benefit, index) => {
              const Icon = benefitIcons[index] ?? GraduationCap;
              return (
                <Reveal key={benefit.title} delay={index * 0.06}>
                  <div className="h-full rounded-[24px] border border-line bg-cream/60 p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-brand-strong">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <p className="mt-5 text-sm font-semibold text-ink">{benefit.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{benefit.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Suspense fallback={<AcademySkeleton />}>
        <AcademyData />
      </Suspense>

      <section className="border-t border-line bg-white">
        <div className="shell grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Pertanyaan umum"
              title="Hal yang sering ditanyakan."
              description="Belum menemukan jawabannya? Hubungi tim Academy — kami senang membantu."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <Accordion items={faqs} />
          </Reveal>
        </div>
      </section>

      <CtaPanel
        title="Siap memulai kelas pertama?"
        description="Pilih program, tentukan batch, dan isi formulir pendaftaran. Tim Academy akan mengonfirmasi kursi Anda maksimal 1×24 jam pada hari kerja."
        primaryLabel="Daftar sekarang"
        primaryHref="#daftar"
        secondaryLabel="Hubungi Academy"
        secondaryHref="/contact?service=Shanatech%20Academy"
        secondaryIcon="none"
      />
    </>
  );
}
