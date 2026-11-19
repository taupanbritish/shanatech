export const site = {
  name: "SHANATECH",
  academyName: "Shanatech Academy",
  tagline: "Teknologi yang membangun, manusia yang bertumbuh.",
  description:
    "SHANATECH adalah mitra transformasi digital dan lembaga pelatihan teknologi di Binjai, Sumatera Utara. Kami membangun produk digital sekaligus menyiapkan talenta yang siap kerja.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@shanatech.web.id",
  academyEmail: "academy@shanatech.web.id",
  phone: "0812 6019 8745",
  phoneHref: "+6281260198745",
  whatsapp: "6281260198745",
  address: {
    line1: "Jl. Samanhudi II No. 3",
    line2: "Binjai, Sumatera Utara, Indonesia",
    locality: "Binjai",
    region: "Sumatera Utara",
  },
  hours: "Senin–Jumat, 08.30–17.30 WIB",
  social: {
    instagram: "https://instagram.com/shanatech",
    linkedin: "https://linkedin.com/company/shanatech",
    youtube: "https://youtube.com/@shanatech",
  },
} as const;

/** Tautan WhatsApp resmi dengan pesan pembuka yang sudah terisi. */
export function whatsappHref(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang" },
  { href: "/services", label: "Layanan" },
  { href: "/products", label: "Produk" },
  { href: "/why-us", label: "Kenapa Kami" },
  { href: "/academy", label: "Academy" },
] as const;

export const stats = [
  { value: 3, suffix: "", label: "Proyek pertama yang diselesaikan" },
  { value: 2, suffix: "", label: "Klien yang kembali bekerja sama" },
  { value: 40, suffix: "+", label: "Peserta Academy dari 3 angkatan" },
  { value: 9, suffix: "/10", label: "Peserta menyelesaikan kelas" },
] as const;
