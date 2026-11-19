"use client";

import { useState } from "react";
import { ProductCoverPlaceholder } from "@/components/products/product-card";
import type { ProductMediaItem } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductGallery({ title, media }: { title: string; media: ProductMediaItem[] }) {
  const [index, setIndex] = useState(0);
  const current = media[index];

  return (
    <div className="min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-navy">
        {!current ? (
          <ProductCoverPlaceholder title={title} />
        ) : current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.caption ?? `Tampilan ${title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <iframe
            key={current.id}
            src={current.url}
            title={current.caption ?? `Video ${title}`}
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
      {current?.caption ? (
        <p className="mt-3 text-[12.5px] text-white/55">{current.caption}</p>
      ) : null}

      {media.length > 1 ? (
        <ul className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Pilih media">
          {media.map((item, itemIndex) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(itemIndex)}
                aria-label={`Tampilkan media ${itemIndex + 1}${item.caption ? `: ${item.caption}` : ""}`}
                aria-current={itemIndex === index ? "true" : undefined}
                className={cn(
                  "relative block h-14 w-24 overflow-hidden rounded-xl border-2 transition-colors",
                  itemIndex === index ? "border-brand" : "border-white/10 hover:border-white/30",
                )}
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-white/5 text-[10.5px] font-semibold text-white/70">
                    ▶ Video
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
