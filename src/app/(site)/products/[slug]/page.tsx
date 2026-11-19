import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  MessageCircle,
  MonitorPlay,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CopyButton } from "@/components/products/copy-button";
import { TechBadges } from "@/components/products/product-card";
import { ProductGallery } from "@/components/products/product-gallery";
import { ButtonLink } from "@/components/ui/button";
import { getPublishedProduct, type Product } from "@/lib/product-queries";
import { categorySlug, licenseMatrix, pricingModelDescriptions } from "@/lib/products";
import { site, whatsappHref } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) {
    return { title: "Produk tidak ditemukan", robots: { index: false, follow: false } };
  }
  const cover = product.media.find((item) => item.type === "image");
  return {
    title: product.title,
    description: product.tagline,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.title} — ${site.name}`,
      description: product.tagline,
      url: `${site.url}/products/${product.slug}`,
      type: "website",
      ...(cover ? { images: [{ url: cover.url, alt: cover.caption ?? product.title }] } : {}),
    },
  };
}

function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function productJsonLd(product: Product) {
  const images = product.media.filter((item) => item.type === "image").map((item) => item.url);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.title,
    description: product.tagline,
    applicationCategory:
      product.category === "Mobile App" ? "MobileApplication" : "BusinessApplication",
    operatingSystem: product.category === "Mobile App" ? "Android" : "Web",
    url: `${site.url}/products/${product.slug}`,
    ...(images.length ? { image: images } : {}),
    featureList: product.features,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

function DemoBlock({ product }: { product: Product }) {
  const hasCredentials = product.demoCredentials.length > 0;
  const demoMessage = `Halo SHANATECH, saya ingin mencoba demo ${product.title}. Mohon dibantu akses demonya.`;

  return (
    <div className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <MonitorPlay className="h-5 w-5 text-brand-strong" />
        <h2 className="font-display text-xl font-semibold text-ink">Coba demo langsung</h2>
      </div>

      {product.demoNote ? (
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{product.demoNote}</p>
      ) : null}

      {hasCredentials ? (
        <div className="mt-5 space-y-3">
          {product.demoCredentials.map((credential, index) => (
            <div
              key={`${credential.role}-${index}`}
              className="rounded-2xl border border-line bg-cream/50 p-4"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-brand-strong" />
                <p className="text-[13px] font-semibold text-ink">{credential.role}</p>
              </div>
              <dl className="mt-3 space-y-2">
                {(
                  [
                    ["Username", credential.username],
                    ["Password", credential.password],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2">
                    <dt className="w-20 shrink-0 text-[11.5px] text-muted">{label}</dt>
                    <dd className="min-w-0 flex-1 truncate rounded-lg border border-line bg-white px-3 py-1.5 font-mono text-[12.5px] text-ink">
                      {value}
                    </dd>
                    <CopyButton value={value} label={`${label} ${credential.role}`} />
                  </div>
                ))}
              </dl>
              {credential.note ? (
                <p className="mt-2 text-[11.5px] text-muted">{credential.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {product.demoUrl ? (
          <ButtonLink href={product.demoUrl} external size="md" className="sm:flex-1">
            Buka demo
            <ExternalLink className="h-4 w-4" />
          </ButtonLink>
        ) : null}
        <ButtonLink
          href={whatsappHref(demoMessage)}
          external
          variant="outline"
          size="md"
          className="sm:flex-1"
        >
          <MessageCircle className="h-4 w-4" />
          {product.demoUrl ? "Tanya via WhatsApp" : "Minta akses demo"}
        </ButtonLink>
      </div>
      {product.demoUrl && hasCredentials ? (
        <p className="mt-3 text-[11.5px] text-muted">
          Akun di atas khusus lingkungan demo. Mohon tidak memasukkan data pribadi asli.
        </p>
      ) : null}
    </div>
  );
}

function LicenseMatrix({ product }: { product: Product }) {
  const models = product.pricingModels;
  if (models.length === 0) return null;

  return (
    <section aria-labelledby="lisensi" className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
      <h2 id="lisensi" className="font-display text-xl font-semibold text-ink">
        Skema lisensi
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
        {product.pricingNote ??
          "Harga final disusun dalam penawaran tertulis sesuai skala dan kebutuhan Anda."}
      </p>

      <p className="mt-4 text-[11.5px] text-muted sm:hidden">Geser tabel untuk melihat semua skema.</p>
      <div className="mt-6 overflow-x-auto" tabIndex={0} aria-label="Perbandingan skema lisensi">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left text-[13px]">
          <thead>
            <tr>
              <th scope="col" className="w-1/4 border-b border-line pb-3 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                Aspek
              </th>
              {models.map((model) => (
                <th key={model} scope="col" className="border-b border-line px-3 pb-3 align-bottom">
                  <span className="block font-display text-[15px] font-semibold text-ink">{model}</span>
                  <span className="mt-0.5 block text-[11.5px] font-normal text-muted">
                    {pricingModelDescriptions[model]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {licenseMatrix.map((row) => (
              <tr key={row.aspect}>
                <th scope="row" className="border-b border-line/70 py-3 pr-3 font-medium text-ink/70">
                  {row.aspect}
                </th>
                {models.map((model) => (
                  <td key={model} className="border-b border-line/70 px-3 py-3 text-ink">
                    {row.values[model]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <>
      <section className="bg-navy">
        <div className="shell pt-32 pb-16 sm:pt-36">
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 h-12 w-96 max-w-full animate-pulse rounded-xl bg-white/10" />
          <div className="mt-10 aspect-video max-w-4xl animate-pulse rounded-[24px] bg-white/5" />
        </div>
      </section>
      <section className="bg-cream">
        <div className="shell grid gap-6 py-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="h-96 animate-pulse rounded-[28px] border border-line bg-white" />
          <div className="h-96 animate-pulse rounded-[28px] border border-line bg-white" />
        </div>
      </section>
    </>
  );
}

async function ProductDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();

  const consultMessage = `Halo SHANATECH, saya tertarik dengan ${product.title}. Boleh dijelaskan penawaran dan langkah implementasinya?`;
  const hasCaseStudy = Boolean(product.caseStudy) || product.impactPoints.length > 0;

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-brand/15 blur-[120px]" />
        <div className="shell relative pt-32 pb-16 sm:pt-36 sm:pb-20">
          <Link
            href={`/products?kategori=${categorySlug(product.category)}`}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {product.category}
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h1 className="text-4xl leading-[1.08] font-semibold sm:text-5xl">{product.title}</h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-lg">
                {product.tagline}
              </p>
              <div className="mt-6">
                <TechBadges items={product.techStack} tone="dark" />
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={whatsappHref(consultMessage)} external size="lg">
                  <MessageCircle className="h-4 w-4" />
                  Konsultasi via WhatsApp
                </ButtonLink>
                <ButtonLink href="#demo" variant="ghost" size="lg">
                  <MonitorPlay className="h-4 w-4" />
                  Coba demo
                </ButtonLink>
              </div>
            </div>
            <ProductGallery title={product.title} media={product.media} />
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="shell grid gap-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 space-y-6">
            <article className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink">Tentang produk</h2>
              <div className="mt-4 space-y-4 text-[14.5px] leading-relaxed text-ink/80">
                {paragraphs(product.description).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <h3 className="mt-8 text-[13px] font-semibold tracking-[0.14em] text-brand-strong uppercase">
                Fitur utama
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink/85">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>

            {hasCaseStudy ? (
              <article className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h2 className="font-display text-xl font-semibold text-ink">Studi kasus</h2>
                </div>
                {product.caseStudy ? (
                  <div className="mt-4 space-y-4 text-[14.5px] leading-relaxed text-ink/80">
                    {paragraphs(product.caseStudy).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                {product.impactPoints.length > 0 ? (
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {product.impactPoints.map((point) => (
                      <li
                        key={point}
                        className="rounded-2xl border border-line bg-cream/60 px-4 py-3 text-[13.5px] font-medium text-ink"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ) : null}

            <LicenseMatrix product={product} />
          </div>

          <div id="demo" className="min-w-0 scroll-mt-28 lg:sticky lg:top-28">
            <DemoBlock product={product} />
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

export default function ProductDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
