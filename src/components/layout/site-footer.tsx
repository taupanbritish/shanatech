import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang SHANATECH", href: "/about" },
      { label: "Layanan", href: "/services" },
      { label: "Kenapa Kami", href: "/why-us" },
      { label: "Kontak", href: "/contact" },
    ],
  },
  {
    title: "Layanan",
    links: [
      { label: "Web & Application", href: "/services#web-development" },
      { label: "Mobile App", href: "/services#mobile-development" },
      { label: "UI/UX Design", href: "/services#ui-ux-design" },
      { label: "Cloud & DevOps", href: "/services#cloud-devops" },
      { label: "Data & AI", href: "/services#data-ai" },
    ],
  },
  {
    title: "Academy",
    links: [
      { label: "Program Komputer", href: "/academy#program" },
      { label: "Bahasa Inggris", href: "/academy#program" },
      { label: "Jadwal Kelas", href: "/academy#jadwal" },
      { label: "Pendaftaran", href: "/academy#daftar" },
    ],
  },
];

function SocialIcon({ name }: { name: "instagram" | "linkedin" | "youtube" }) {
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M8 10.5V17M8 7.2v.01M12.5 17v-3.6a2.9 2.9 0 0 1 5.8 0V17" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-brand/10 blur-[120px]" />
      <div className="shell relative">
        <div className="grid gap-12 border-b border-white/10 py-16 lg:grid-cols-[1.4fr_repeat(3,0.7fr)] lg:gap-8">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-white/55">{site.description}</p>
            <div className="mt-6 space-y-3 text-sm text-white/60">
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="h-4 w-4 text-brand" />
                {site.email}
              </a>
              <a href={`tel:${site.phoneHref}`} className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4 text-brand" />
                {site.phone}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </span>
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {(["instagram", "linkedin", "youtube"] as const).map((name) => (
                <a
                  key={name}
                  href={site.social[name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/5 text-white/65 transition-colors hover:border-brand/40 hover:text-white"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SHANATECH. Seluruh hak cipta dilindungi.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>
              {site.address.locality}, {site.address.region}
            </span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-brand"
            >
              Bicara dengan kami
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
