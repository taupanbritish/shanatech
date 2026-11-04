"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { navigation, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          solid
            ? "border-b border-white/10 bg-navy/90 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="shell flex h-[76px] items-center justify-between gap-6">
          <Link href="/" aria-label="SHANATECH — Beranda" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
                    active ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  {active ? (
                    <span className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-inset ring-white/10" />
                  ) : null}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-[13px] font-semibold text-navy transition-colors hover:bg-cyan-300"
            >
              Mulai proyek
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[76px] bottom-0 z-40 overflow-y-auto border-t border-white/10 bg-navy lg:hidden"
          >
            <div className="shell flex min-h-full flex-col py-8">
              <nav aria-label="Navigasi seluler" className="flex flex-col">
                {navigation.map((item, index) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl font-semibold transition-colors",
                          active ? "text-brand" : "text-white hover:text-brand",
                        )}
                      >
                        {item.label}
                        <ArrowUpRight className="h-5 w-5 opacity-50" />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-8">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-[15px] font-semibold text-navy"
                >
                  Mulai proyek
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="mt-8 space-y-2 text-sm text-white/55">
                  <p>{site.email}</p>
                  <p>{site.phone}</p>
                  <p>{site.hours}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
