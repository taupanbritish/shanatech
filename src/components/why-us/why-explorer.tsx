"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import { whyUs } from "@/lib/content";
import { cn } from "@/lib/utils";

export function WhyExplorer() {
  const [active, setActive] = useState(0);
  const item = whyUs[active];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
      <div
        role="tablist"
        aria-label="Alasan memilih SHANATECH"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {whyUs.map((reason, index) => {
          const selected = index === active;
          return (
            <button
              key={reason.id}
              type="button"
              role="tab"
              id={`tab-${reason.id}`}
              aria-selected={selected}
              aria-controls={`panel-${reason.id}`}
              onClick={() => setActive(index)}
              className={cn(
                "group flex min-w-[220px] items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 lg:min-w-0",
                selected
                  ? "border-ink bg-ink text-white shadow-[0_18px_40px_-24px_rgba(7,20,38,0.5)]"
                  : "border-line bg-white text-ink hover:border-brand-strong/30",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "font-display text-[11px] font-semibold tabular-nums",
                    selected ? "text-brand" : "text-muted/45",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[13.5px] font-semibold leading-snug">{reason.title}</span>
              </span>
              <ArrowUpRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  selected ? "text-brand" : "text-muted/30 group-hover:text-brand-strong",
                )}
              />
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${item.id}`}
        aria-labelledby={`tab-${item.id}`}
        className="relative overflow-hidden rounded-[28px] border border-line bg-white p-7 sm:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand/10 blur-[80px]" />
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
              {item.eyebrow}
            </p>
            <h3 className="mt-3 max-w-xl text-2xl leading-snug font-semibold text-ink sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed font-medium text-ink/75">
              {item.lead}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{item.description}</p>

            <div className="mt-8 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
              <ul className="space-y-2.5">
                {item.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[13px] text-ink/70">
                    <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-strong">
                      <Check className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="shrink-0 rounded-2xl bg-cream px-5 py-4 text-right ring-1 ring-inset ring-line">
                <p className="font-display text-3xl font-semibold text-ink">{item.proof.value}</p>
                <p className="mt-1 max-w-[170px] text-[11px] leading-snug text-muted">
                  {item.proof.label}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
