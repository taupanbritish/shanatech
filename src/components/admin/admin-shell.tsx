"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  DatabaseBackup,
  ExternalLink,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAdmin } from "@/app/admin/actions";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pendaftaran", label: "Pendaftaran", icon: ClipboardList },
  { href: "/admin/pesan", label: "Pesan masuk", icon: MessageSquare },
  { href: "/admin/program", label: "Program", icon: BookOpen },
  { href: "/admin/jadwal", label: "Jadwal batch", icon: CalendarDays },
  { href: "/admin/produk", label: "Produk", icon: LayoutGrid },
  { href: "/admin/backup", label: "Backup & Restore", icon: DatabaseBackup },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors",
              active
                ? "bg-white/10 text-white ring-1 ring-inset ring-white/10"
                : "text-white/55 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", active ? "text-brand" : "text-white/40")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ email }: { email: string }) {
  return (
    <div className="mt-auto border-t border-white/10 p-4">
      <div className="mb-3 rounded-xl bg-white/5 px-3 py-2.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Masuk sebagai
        </p>
        <p className="mt-1 truncate text-[12.5px] font-medium text-white/85">{email}</p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-white/55 transition-colors hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Lihat situs publik
      </Link>
      <form action={logoutAdmin}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] text-white/55 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Keluar dari panel
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-navy lg:flex">
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <Link href="/admin" aria-label="Dashboard SHANATECH">
            <Logo />
          </Link>
        </div>
        <div className="px-4 py-4">
          <p className="px-3.5 text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
            Panel admin
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <NavLinks />
        </div>
        <SidebarFooter email={email} />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-navy px-4 lg:hidden">
          <Link href="/admin" aria-label="Dashboard SHANATECH">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu admin"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white/80"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu admin"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-white/10 bg-navy shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu admin"
                className="grid h-9 w-9 place-items-center rounded-lg text-white/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter email={email} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-navy lg:block" />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-ink/10" />
          <div className="mt-4 h-4 w-80 animate-pulse rounded bg-ink/5" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
            ))}
          </div>
          <div className="mt-6 h-80 animate-pulse rounded-2xl border border-line bg-white" />
        </main>
      </div>
    </div>
  );
}
