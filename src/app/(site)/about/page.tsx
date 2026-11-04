import type { Metadata } from "next";
import { ArrowUpRight, Heart, Target } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { CtaPanel } from "@/components/shared/cta-panel";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { missions, timeline, values, vision } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Cerita SHANATECH: lahir dari nama Shatara dan Shazia, tumbuh menjadi mitra teknologi dan lembaga pelatihan digital di Binjai, Sumatera Utara.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Tentang kami"
        title={
          <>
            Perusahaan teknologi yang
            <br className="hidden sm:block" /> tumbuh dari rasa ingin tahu.
          </>
        }
        description="Sejak 2026, SHANATECH membantu bisnis membangun produk digital pertamanya dan membuka jalan bagi talenta baru untuk masuk ke industri teknologi."
      >
        <div className="flex flex-wrap gap-2.5">
          {["Berdiri 2026", "Binjai, Sumatera Utara", "IT Services", "Digital Academy"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65"
            >
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Cerita kami"
              title="Berawal dari pekerjaan yang ingin dilakukan dengan rapi."
              description="Awalnya hanya tiga orang, satu meja, dan keyakinan sederhana: pekerjaan teknis bisa dilakukan dengan komunikasi yang manusiawi."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-[15px]">
              <p>
                SHANATECH dimulai pada 2026 sebagai studio pengembangan web kecil. Kami mengerjakan
                proyek-proyek pertama untuk usaha lokal, belajar dari setiap peluncuran, dan membangun
                kepercayaan satu langkah setiap kali.
              </p>
              <p>
                Beberapa klien awal mengeluhkan hal yang sama: sulit menemukan talenta yang siap
                bekerja. Dari percakapan itu, Shanatech Academy membuka kelas pertamanya — kelompok
                kecil, satu ruang kelas, dan kurikulum yang disusun dari kebutuhan nyata di lapangan.
              </p>
              <p>
                Hari ini, dua lini itu berjalan berdampingan. Tim produk mengerjakan tantangan
                nyata; Academy menyiapkan orang-orang yang akan menghadapi tantangan berikutnya.
                Keduanya saling mengingatkan bahwa teknologi selalu tentang manusia.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-7">
              {[
                { value: "2026", label: "Tahun berdiri" },
                { value: "3", label: "Proyek awal diselesaikan" },
                { value: "40+", label: "Peserta Academy" },
              ].map((fact) => (
                <div key={fact.label}>
                  <p className="font-display text-xl font-semibold text-ink sm:text-2xl">
                    {fact.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{fact.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[36px] bg-linear-to-br from-brand/15 via-transparent to-accent/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-[30px] border border-line bg-white p-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[23px]">
                  <Image
                    src="/images/brand-story.png"
                    alt="Dua garis cahaya yang saling bertaut, melambangkan asal nama SHANATECH"
                    fill
                    sizes="(max-width: 1024px) 85vw, 460px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-navy/70 p-4 backdrop-blur">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                      Sejak 2026
                    </p>
                    <p className="mt-1.5 font-display text-lg leading-snug text-white">
                      “Teknologi yang membangun, manusia yang bertumbuh.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="shell relative py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Filosofi nama"
              tone="light"
              title="Nama yang dirakit di rumah, bukan di ruang rapat."
              description="SHANATECH lahir dari dua nama yang paling sering dipanggil setiap hari — Shatara dan Shazia. Dari mereka, kami belajar dua hal yang menjadi cara kami bekerja."
            />
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur sm:p-10">
                <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  <span className="text-brand">SHA</span>
                  <span className="text-white/30"> · </span>
                  <span className="text-accent">NA</span>
                  <span className="text-white/30"> · </span>
                  <span>TECH</span>
                </p>
                <div className="mt-8 space-y-6">
                  <div className="border-l border-brand/40 pl-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                      SHA — Shatara
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      Dari Shatara kami belajar keberanian untuk memulai. Anak yang selalu bertanya
                      “kenapa” dan “bagaimana kalau”. Nilai itu kami bawa ke setiap proyek: berani
                      mencoba, tetapi selalu punya alasan.
                    </p>
                  </div>
                  <div className="border-l border-accent/40 pl-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                      NA — Shazia
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      Dari panggilan sayang untuk Shazia — Nana — kami belajar ketekunan yang
                      tenang. Bahwa hal besar dibangun dari kebiasaan kecil yang diulang dengan
                      sepenuh hati.
                    </p>
                  </div>
                  <div className="border-l border-white/20 pl-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      TECH — Teknologi
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      Teknologi hanyalah alat. Ia menjadi bermakna ketika dipakai untuk membuat
                      hidup orang lain sedikit lebih mudah.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-5">
              <Reveal delay={0.08}>
                <div className="flex h-full flex-col justify-between rounded-[28px] border border-white/10 bg-linear-to-br from-brand/15 to-transparent p-7">
                  <Heart className="h-7 w-7 text-brand" strokeWidth={1.6} />
                  <div className="mt-10">
                    <p className="font-display text-2xl font-semibold">Shatara</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      Pengingat bahwa rasa ingin tahu adalah modal utama untuk membangun sesuatu
                      yang belum ada.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="flex h-full flex-col justify-between rounded-[28px] border border-white/10 bg-linear-to-br from-accent/15 to-transparent p-7">
                  <Heart className="h-7 w-7 text-accent" strokeWidth={1.6} />
                  <div className="mt-10">
                    <p className="font-display text-2xl font-semibold">Shazia</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      Pengingat bahwa hasil yang baik lahir dari proses yang dijalani dengan sabar
                      dan sungguh-sungguh.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="rounded-[28px] border border-line bg-white p-8 sm:p-10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-brand">
                <Target className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
                Visi
              </p>
              <p className="mt-3 font-display text-2xl leading-snug font-medium text-ink sm:text-[28px]">
                “{vision}”
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
                Misi
              </p>
              <ol className="mt-5 space-y-5">
                {missions.map((mission, index) => (
                  <li key={mission.title} className="flex gap-4">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-[11px] font-semibold text-brand-strong">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{mission.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{mission.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <div className="mt-20">
          <SectionHeading
            eyebrow="Nilai yang kami jaga"
            title="Empat prinsip yang menentukan cara kami bekerja."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.06}>
                <div className="h-full rounded-[24px] border border-line bg-white p-6">
                  <span className="font-display text-3xl font-semibold text-brand-strong/25">
                    0{index + 1}
                  </span>
                  <p className="mt-5 text-sm font-semibold text-ink">{value.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="shell py-20 sm:py-24">
          <SectionHeading
            eyebrow="Perjalanan"
            title="Tahun pertama, satu arah."
            description="Kami baru memulai. Setiap tahap kecil ini membentuk cara kami bekerja hari ini."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item, index) => (
              <Reveal key={item.year} delay={index * 0.08}>
                <div className="relative border-t border-line pt-6">
                  <span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-brand-strong" />
                  <p className="font-display text-sm font-semibold text-brand-strong">{item.year}</p>
                  <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-strong"
            >
              Jadi bagian dari perjalanan berikutnya
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <CtaPanel
        title="Ingin mengenal kami lebih dekat?"
        description="Mari bicara tentang kebutuhan bisnis Anda, atau kunjungi kelas Academy untuk melihat cara kami mengajar."
        primaryLabel="Hubungi kami"
        secondaryLabel="Lihat Academy"
      />
    </>
  );
}
