import type { Metadata } from "next";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { CtaPanel } from "@/components/shared/cta-panel";
import { Accordion } from "@/components/ui/accordion";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi SHANATECH untuk konsultasi proyek IT atau pendaftaran kelas Shanatech Academy. Respons maksimal 1×24 jam pada hari kerja.",
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.address.line1}, ${site.address.line2}`,
)}`;

const responsePromises = [
  { icon: Clock, title: "Respons 1×24 jam", text: "Pada hari kerja, setiap pesan masuk ke antrean yang dipantau tim." },
  { icon: ShieldCheck, title: "Kerahasiaan terjaga", text: "NDA tersedia bila Anda membutuhkan perjanjian kerahasiaan sebelum diskusi." },
  { icon: MessageCircle, title: "Konsultasi tanpa biaya", text: "Sesi awal 30 menit untuk memahami konteks sebelum bicara biaya." },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontak"
        title={
          <>
            Mari mulai
            <br className="hidden sm:block" /> dengan percakapan.
          </>
        }
        description="Apakah Anda ingin membangun produk, merawat sistem yang sudah berjalan, atau mendaftar kelas Academy — tim kami siap mendengar."
      >
        <div className="flex flex-wrap gap-2.5">
          <span className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65">
            Binjai, Sumatera Utara
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65">
            {site.hours}
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11.5px] font-medium text-white/65">
            Melayani proyek remote
          </span>
        </div>
      </PageHero>

      <section className="shell py-16 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <Suspense
            fallback={
              <div
                className="h-[640px] animate-pulse rounded-[28px] border border-line bg-white"
                aria-hidden="true"
              />
            }
          >
            <ContactForm />
          </Suspense>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-line bg-white p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
                Hubungi langsung
              </p>
              <div className="mt-5 space-y-4">
                <a
                  href={`mailto:${site.email}`}
                  className="group flex items-start gap-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-brand-strong ring-1 ring-inset ring-line">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[10.5px] uppercase tracking-[0.12em] text-muted">
                      Email proyek
                    </span>
                    <span className="mt-0.5 block text-[13.5px] font-semibold text-ink group-hover:text-brand-strong">
                      {site.email}
                    </span>
                  </span>
                </a>

                <a href={`tel:${site.phoneHref}`} className="group flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-brand-strong ring-1 ring-inset ring-line">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[10.5px] uppercase tracking-[0.12em] text-muted">
                      Kantor
                    </span>
                    <span className="mt-0.5 block text-[13.5px] font-semibold text-ink group-hover:text-brand-strong">
                      {site.phone}
                    </span>
                  </span>
                </a>

                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-brand-strong ring-1 ring-inset ring-line">
                    <MessageCircle className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[10.5px] uppercase tracking-[0.12em] text-muted">
                      WhatsApp
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink group-hover:text-brand-strong">
                      Chat dengan tim
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </a>
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <p className="flex items-start gap-3 text-[12.5px] leading-relaxed text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
                  <span>
                    {site.address.line1}
                    <br />
                    {site.address.line2}
                  </span>
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink hover:text-brand-strong"
                >
                  Buka di Google Maps
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-[11.5px] text-muted ring-1 ring-inset ring-line">
                <Clock className="h-4 w-4 text-brand-strong" />
                {site.hours}
              </div>
            </div>

            <div className="rounded-[28px] bg-navy p-7 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                Calon siswa?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Untuk pendaftaran kelas, gunakan formulir khusus di halaman Academy agar kursi
                langsung tercatat pada batch yang dipilih.
              </p>
              <Link
                href="/academy#daftar"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2.5 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/12 hover:bg-white/14"
              >
                Formulir pendaftaran Academy
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-5 border-t border-white/10 pt-4 text-[11.5px] text-white/45">
                Email Academy: {site.academyEmail}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {responsePromises.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-strong">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="shell grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Sebelum menghubungi"
            title="Mungkin jawabannya sudah ada di sini."
            description="Kumpulan pertanyaan yang paling sering masuk ke tim kami."
          />
          <Accordion items={faqs} />
        </div>
      </section>

      <CtaPanel
        title="Belum siap mengisi formulir?"
        description="Simpan halaman ini, atau mulai dari program Academy yang paling dekat dengan tujuan Anda."
        primaryLabel="Lihat program Academy"
        primaryHref="/academy"
        secondaryLabel="Tentang SHANATECH"
        secondaryHref="/about"
        secondaryIcon="none"
      />
    </>
  );
}
