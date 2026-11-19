import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-strong uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white", className)}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: "brand" | "violet" | "emerald" | "amber";
}) {
  const tones = {
    brand: "bg-brand/12 text-brand-strong",
    violet: "bg-accent/10 text-accent",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <AdminCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-medium tracking-wide text-muted uppercase">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
          {hint ? <p className="mt-1 text-[11.5px] text-muted">{hint}</p> : null}
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
          {icon}
        </span>
      </div>
    </AdminCard>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    Baru: "bg-brand/12 text-brand-strong ring-brand/20",
    Dihubungi: "bg-amber-50 text-amber-700 ring-amber-200",
    Terdaftar: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Batal: "bg-red-50 text-red-600 ring-red-200",
    Diproses: "bg-amber-50 text-amber-700 ring-amber-200",
    Selesai: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Dibuka: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Ditutup: "bg-amber-50 text-amber-700 ring-amber-200",
    Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Nonaktif: "bg-cream text-muted ring-line",
    Draf: "bg-amber-50 text-amber-700 ring-amber-200",
    Terbit: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Arsip: "bg-cream text-muted ring-line",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        tones[status] ?? "bg-cream text-muted ring-line",
      )}
    >
      {status}
    </span>
  );
}

export function Notice({ notice }: { notice?: string }) {
  const messages: Record<string, string> = {
    dibuat: "Data baru berhasil dibuat.",
    diperbarui: "Perubahan berhasil disimpan.",
    dihapus: "Data berhasil dihapus.",
  };
  const message = notice ? messages[notice] : undefined;
  if (!message) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
    >
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

export type FilterOption = { label: string; value: string; count?: number };

export function FilterTabs({
  options,
  current,
  basePath,
  search,
}: {
  options: FilterOption[];
  current: string;
  basePath: string;
  search?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const params = new URLSearchParams();
        if (option.value) params.set("status", option.value);
        if (search) params.set("q", search);
        const href = params.size ? `${basePath}?${params.toString()}` : basePath;
        const active = option.value === current;

        return (
          <Link
            key={option.value || "semua"}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              active
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-muted hover:border-ink/20 hover:text-ink",
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10.5px]",
                  active ? "bg-white/15 text-white" : "bg-cream text-muted",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  basePath,
  search,
  status,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  search?: string;
  status?: string;
}) {
  if (pageCount <= 1) return null;

  const buildHref = (target: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("q", search);
    if (target > 1) params.set("page", String(target));
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <nav aria-label="Paginasi" className="flex items-center justify-between gap-3 text-sm">
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="rounded-full border border-line bg-white px-4 py-2 font-medium text-ink hover:border-ink/25"
        >
          Sebelumnya
        </Link>
      ) : (
        <span className="rounded-full border border-transparent px-4 py-2 text-muted/40">
          Sebelumnya
        </span>
      )}
      <span className="text-[12.5px] text-muted">
        Halaman {page} dari {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          href={buildHref(page + 1)}
          className="rounded-full border border-line bg-white px-4 py-2 font-medium text-ink hover:border-ink/25"
        >
          Berikutnya
        </Link>
      ) : (
        <span className="rounded-full border border-transparent px-4 py-2 text-muted/40">
          Berikutnya
        </span>
      )}
    </nav>
  );
}

export function SearchBar({
  action,
  defaultValue,
  placeholder,
  status,
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
  status?: string;
}) {
  return (
    <form action={action} className="flex w-full items-center gap-2 sm:w-auto">
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-line bg-white px-4 text-[13px] text-ink placeholder:text-muted/50 focus:border-brand-strong focus:outline-none focus:ring-4 focus:ring-brand/10 sm:w-64"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white hover:bg-ink/85"
      >
        Cari
      </button>
    </form>
  );
}
