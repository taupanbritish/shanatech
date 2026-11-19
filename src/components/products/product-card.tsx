import { ArrowUpRight, LayoutGrid, MonitorPlay } from "lucide-react";
import Link from "next/link";
import type { ProductSummary } from "@/lib/product-queries";
import { cn } from "@/lib/utils";

export function TechBadges({
  items,
  tone = "light",
  limit,
}: {
  items: string[];
  tone?: "light" | "dark";
  limit?: number;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  const rest = limit ? items.length - shown.length : 0;

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Teknologi">
      {shown.map((item) => (
        <li
          key={item}
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
            tone === "dark"
              ? "border border-white/12 bg-white/5 text-white/75"
              : "border border-line bg-cream text-ink/75",
          )}
        >
          {item}
        </li>
      ))}
      {rest > 0 ? (
        <li
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium",
            tone === "dark" ? "text-white/50" : "text-muted",
          )}
        >
          +{rest}
        </li>
      ) : null}
    </ul>
  );
}

/** Sampul bawaan dengan ukuran yang sama agar grid tetap rata saat produk belum punya gambar. */
export function ProductCoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-navy">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-40 w-40 rounded-full bg-brand/25 blur-3xl" />
      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <LayoutGrid className="h-7 w-7 text-brand" strokeWidth={1.6} />
        <span className="font-display text-lg font-semibold text-white">{title}</span>
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white transition-shadow hover:shadow-[0_30px_70px_-50px_rgba(7,20,38,0.45)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-cream">
        {product.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverUrl}
            alt={product.coverCaption ?? `Tampilan ${product.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductCoverPlaceholder title={product.title} />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.featured ? (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[10.5px] font-semibold text-navy">
              Unggulan
            </span>
          ) : null}
          {product.hasDemo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-ink">
              <MonitorPlay className="h-3 w-3" />
              Demo tersedia
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-strong uppercase">
          {product.category}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-ink">{product.title}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{product.tagline}</p>

        <div className="mt-5">
          <TechBadges items={product.techStack} limit={4} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="text-[12px] text-muted">{product.pricingModels.join(" · ")}</span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink group-hover:text-brand-strong">
            Lihat detail
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
