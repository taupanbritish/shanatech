/** Konstanta & tipe katalog produk. Aman dipakai di server maupun klien (tanpa akses DB). */

export const PRODUCTS_TAG = "products";

export const productCategories = [
  { value: "Sistem Informasi Sekolah", slug: "sekolah", label: "Sistem Informasi Sekolah" },
  { value: "Enterprise Web", slug: "enterprise", label: "Enterprise Web" },
  { value: "Mobile App", slug: "mobile", label: "Mobile App" },
] as const;

export type ProductCategory = (typeof productCategories)[number]["value"];

export function categoryFromSlug(slug: string | undefined): ProductCategory | undefined {
  return productCategories.find((item) => item.slug === slug)?.value;
}

export function categorySlug(category: ProductCategory) {
  return productCategories.find((item) => item.value === category)?.slug ?? "";
}

export const pricingModels = ["SaaS", "Beli Putus", "Custom"] as const;
export type PricingModel = (typeof pricingModels)[number];

export const productStatuses = ["Draf", "Terbit", "Arsip"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const MAX_PRODUCT_MEDIA = 12;
export const MAX_DEMO_CREDENTIALS = 8;

export type DemoCredential = {
  role: string;
  username: string;
  password: string;
  note?: string;
};

export type ProductMediaItem = {
  id: number;
  url: string;
  type: "image" | "video";
  caption: string | null;
  storageKey: string | null;
  sortOrder: number;
};

/**
 * Ringkasan umum skema lisensi. Bukan harga — rincian final selalu mengikuti
 * penawaran dan kontrak tertulis. Ubah teks di sini bila kebijakan berubah.
 */
export const licenseMatrix: {
  aspect: string;
  values: Record<PricingModel, string>;
}[] = [
  {
    aspect: "Model biaya",
    values: {
      SaaS: "Langganan berkala",
      "Beli Putus": "Sekali bayar lisensi",
      Custom: "Sesuai lingkup proyek",
    },
  },
  {
    aspect: "Server & hosting",
    values: {
      SaaS: "Dikelola SHANATECH",
      "Beli Putus": "Di server Anda, instalasi kami bantu",
      Custom: "Sesuai kesepakatan",
    },
  },
  {
    aspect: "Pembaruan fitur",
    values: {
      SaaS: "Ikut berjalan selama berlangganan",
      "Beli Putus": "Melalui kontrak pemeliharaan",
      Custom: "Sesuai kesepakatan",
    },
  },
  {
    aspect: "Penyesuaian fitur",
    values: {
      SaaS: "Konfigurasi standar",
      "Beli Putus": "Terbatas, melalui penawaran",
      Custom: "Penuh sesuai kebutuhan",
    },
  },
  {
    aspect: "Kepemilikan data",
    values: {
      SaaS: "Milik klien",
      "Beli Putus": "Milik klien",
      Custom: "Milik klien",
    },
  },
];

export const pricingModelDescriptions: Record<PricingModel, string> = {
  SaaS: "Pakai langsung tanpa mengurus server.",
  "Beli Putus": "Lisensi permanen di infrastruktur Anda.",
  Custom: "Dikembangkan khusus untuk alur kerja Anda.",
};
