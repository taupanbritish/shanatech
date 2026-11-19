import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/product-card";
import { CtaPanel } from "@/components/shared/cta-panel";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedCategoryCounts, getPublishedProducts } from "@/lib/product-queries";
import { categoryFromSlug, productCategories } from "@/lib/products";
import { whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Produk",
  description:
    "Produk perangkat lunak SHANATECH: sistem informasi sekolah, aplikasi ujian berbasis komputer (CBT), dan solusi web perusahaan. Coba demo langsung dan bandingkan skema lisensi.",
  alternates: { canonical: "/products" },
};

type CatalogParams = { kategori?: string };

function CatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat produk">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 w-36 animate-pulse rounded-full bg-line" />
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[440px] animate-pulse rounded-[24px] border border-line bg-white/70" />
        ))}
      </div>
    </div>
  );
}

async function Catalog({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const { kategori } = await searchParams;
  const category = categoryFromSlug(kategori);
  const [products, counts] = await Promise.all([
    getPublishedProducts(category),
    getPublishedCategoryCounts(),
  ]);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const tabs = [
    { slug: "", label: "Semua", count: total },
    ...productCategories.map((item) => ({
      slug: item.slug,
      label: item.label,
      count: counts[item.value] ?? 0,
    })),
  ];
  const activeSlug = category ? kategori : "";

  return (
    <>
      <nav aria-label="Filter kategori produk" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <Link
              key={tab.slug || "semua"}
              href={tab.slug ? `/products?kategori=${tab.slug}` : "/products"}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-muted hover:border-ink/20 hover:text-ink",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10.5px]",
                  active ? "bg-white/15 text-white" : "bg-cream text-muted",
                )}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {products.length === 0 ? (
        <div className="mt-8 rounded-[24px] border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Belum ada produk siap pakai di kategori ini
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            Kami tetap bisa membangunnya khusus untuk Anda. Ceritakan kebutuhan Anda dan tim kami
            akan menyiapkan rancangan solusinya.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/contact?service=Web%20%26%20Application%20Development"
              size="sm"
              variant="outline"
            >
              Diskusikan kebutuhan
            </ButtonLink>
            {category ? (
              <ButtonLink href="/products" size="sm" variant="outline">
                Lihat semua produk
              </ButtonLink>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ProductsPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  return (
    <>
      <PageHero
        eyebrow="Produk SHANATECH"
        title={
          <>
            Perangkat lunak siap pakai,
            <br className="hidden sm:block" /> bisa dicoba sebelum memutuskan.
          </>
        }
        description="Produk yang kami bangun dan rawat sendiri. Coba demo langsung, bandingkan skema lisensi, lalu diskusikan penerapannya dengan tim kami."
      >
        <ButtonLink
          href={whatsappHref("Halo SHANATECH, saya ingin berkonsultasi tentang produk Anda.")}
          external
          variant="ghost"
        >
          <MessageCircle className="h-4 w-4" />
          Konsultasi via WhatsApp
        </ButtonLink>
      </PageHero>

      <section className="bg-cream">
        <div className="shell py-16 sm:py-20">
          <Suspense fallback={<CatalogSkeleton />}>
            <Catalog searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <CtaPanel
        title="Butuh sistem yang belum ada di katalog?"
        description="Sebagian besar produk kami lahir dari proyek khusus. Ceritakan alur kerja Anda — kami bantu memetakan solusi dan estimasinya tanpa biaya konsultasi awal."
        primaryLabel="Mulai proyek"
        primaryHref="/contact"
        secondaryLabel="Lihat layanan"
        secondaryHref="/services"
        secondaryIcon="none"
      />
    </>
  );
}
