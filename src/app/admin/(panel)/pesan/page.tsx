import { Building2, Mail, MessageSquare, Phone, Send } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  FilterTabs,
  Pagination,
  SearchBar,
  StatusBadge,
} from "@/components/admin/admin-ui";
import { StatusSelect } from "@/components/admin/status-select";
import { updateMessageStatus } from "@/app/admin/actions";
import { listMessages, type MessageStatus } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Pesan Klien" };

const statuses = ["Baru", "Diproses", "Selesai"] as const;

function parseStatus(value?: string): MessageStatus | undefined {
  return statuses.includes(value as MessageStatus) ? (value as MessageStatus) : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-10 w-full max-w-xl animate-pulse rounded-full bg-white" />
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-44 animate-pulse rounded-2xl border border-line bg-white" />
      ))}
    </div>
  );
}

async function MessagesContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const q = params.q?.trim() || undefined;
  const page = parsePage(params.page);

  await requireAdminSession();
  const result = await listMessages({ status, q, page });
  const totalAll = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
  const filtered = Boolean(status || q?.trim());

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Konsultasi"
        title="Pesan dari klien"
        description="Permintaan konsultasi dari halaman kontak. Balas melalui email atau WhatsApp, lalu perbarui statusnya."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/pesan"
          current={status ?? ""}
          search={q}
          options={[
            { label: "Semua", value: "", count: totalAll },
            ...statuses.map((item) => ({
              label: item,
              value: item,
              count: result.counts[item],
            })),
          ]}
        />
        <SearchBar
          action="/admin/pesan"
          defaultValue={q}
          placeholder="Cari nama, email, atau layanan"
          status={status}
        />
      </div>

      <p className="text-[12.5px] text-muted">
        {result.total} pesan{filtered ? " sesuai filter" : ""} · halaman {result.page} dari{" "}
        {result.pageCount}
      </p>

      {result.rows.length === 0 ? (
        <EmptyState
          title={filtered ? "Tidak ada pesan yang cocok" : "Belum ada pesan masuk"}
          description={
            filtered
              ? "Coba ubah kata kunci atau pilih status lain."
              : "Pesan dari formulir kontak akan muncul di sini."
          }
        />
      ) : (
        <div className="space-y-3">
          {result.rows.map((row) => (
            <AdminCard key={row.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-[15px] font-semibold text-ink">{row.name}</p>
                    <StatusBadge status={row.status} />
                    {row.emailSent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10.5px] font-medium text-muted">
                        <Send className="h-3 w-3" />
                        Email terkirim
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
                    <a
                      href={`mailto:${row.email}?subject=Balasan%20SHANATECH`}
                      className="inline-flex items-center gap-1.5 hover:text-brand-strong"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {row.email}
                    </a>
                    {row.phone ? (
                      <a
                        href={`https://wa.me/${waNumber(row.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-brand-strong"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {row.phone}
                      </a>
                    ) : null}
                    {row.company ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {row.company}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] whitespace-nowrap text-muted">
                    {formatDateTime(row.createdAt)}
                  </span>
                  <StatusSelect
                    action={updateMessageStatus}
                    id={row.id}
                    status={row.status}
                    options={statuses}
                    label={`Status pesan dari ${row.name}`}
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                  Layanan
                </p>
                <p className="mt-1 text-[12.5px] font-medium text-ink">{row.service}</p>
                <div className="mt-3 flex gap-2 rounded-xl bg-cream/70 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink/80">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <p className="whitespace-pre-line">{row.message}</p>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        basePath="/admin/pesan"
        search={q}
        status={status}
      />
    </div>
  );
}

export default function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <MessagesContent searchParams={searchParams} />
    </Suspense>
  );
}
