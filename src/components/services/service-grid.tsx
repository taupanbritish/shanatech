"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { ServiceIcon } from "@/components/ui/service-icon";
import type { Service } from "@/lib/content";
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.article
      id={service.slug}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group scroll-mt-28 rounded-[26px] border border-line bg-white p-7 transition-colors duration-300 hover:border-brand-strong/25 sm:p-8"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-13 w-13 place-items-center rounded-2xl bg-ink text-white transition-colors duration-300 group-hover:bg-brand-strong">
          <ServiceIcon name={service.icon} className="h-5.5 w-5.5" />
        </span>
        <span className="font-display text-sm font-semibold tabular-nums text-muted/35">
          0{index + 1}
        </span>
      </div>

      <h2 className="mt-7 text-xl font-semibold text-ink">{service.title}</h2>
      <p className="mt-1.5 text-[13px] font-medium text-brand-strong">{service.tagline}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">{service.description}</p>

      <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
        {service.deliverables.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink/70">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-strong" />
            {item}
          </li>
        ))}
      </ul>

      <Link
        href={`/contact?service=${encodeURIComponent(service.title)}`}
        className="mt-7 inline-flex items-center gap-2 text-[12.5px] font-semibold text-ink transition-colors hover:text-brand-strong"
      >
        Diskusikan kebutuhan ini
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </motion.article>
  );
}
