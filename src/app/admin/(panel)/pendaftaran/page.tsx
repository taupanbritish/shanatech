import { GraduationCap, Mail, MessageSquare, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  FilterTabs,
  Pagination,
  SearchBar,
} from "@/components/admin/admin-ui";
import { StatusSelect } from "@/components/admin/status-select";
import { DeleteForm } from "@/components/admin/delete-form";
import { deleteRegistration, updateRegistrationStatus } from "@/app/admin/actions";
import { listRegistrations, type RegistrationStatus } from "@/lib/admin-queries";
import { requireAdminSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Pendaftaran" };

const statuses = ["Baru", "Dihubungi", "Terdaftar", "Batal"] as const;

function parseStatus(value?: string): RegistrationStatus | undefined {
  return statuses.includes(value as RegistrationStatus)
    ? (value as RegistrationStatus)
    : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-10 w-full max-w-xl animate-pulse rounded-full bg-white" />
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-40 animate-pulse rounded-2xl border border-line bg-white" />
      ))}
    </div>
  );
}

async function RegistrationsContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const q = params.q?.trim() || undefined;
  const page = parsePage(params.page);

  await requireAdminSession();
  const result = await listRegistrations({ status, q, page });
  const totalAll = Object.values(result.counts).reduce((sum, count) => sum + count, 0);
  const filtered = Boolean(status || q?.trim());

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Academy"
        title="Pendaftaran peserta"
        description="Tindak lanjuti pendaftar dari halaman Academy. Ubah status setelah peserta dihubungi atau terdaftar."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/pendaftaran"
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
          action="/admin/pendaftaran"
          defaultValue={q}
          placeholder="Cari nama, email, atau telepon"
          status={status}
        />
      </div>

      <p className="text-[12.5px] text-muted">
        {result.total} pendaftaran{filtered ? " sesuai filter" : ""} · halaman {result.page} dari{" "}
        {result.pageCount}
      </p>

      {result.rows.length === 0 ? (
        <EmptyState
          title={filtered ? "Tidak ada pendaftaran yang cocok" : "Belum ada pendaftaran"}
          description={
            filtered
              ? "Coba ubah kata kunci atau pilih status lain."
              : "Pendaftaran yang dikirim melalui halaman Academy akan muncul di sini."
          }
        />
      ) : (
        <div className="space-y-3">
          {result.rows.map((row) => (
            <AdminCard key={row.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-semibold text-ink">
                    {row.fullName}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
                    <a
                      href={`mailto:${row.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-brand-strong"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {row.email}
                    </a>
                    <a
                      href={`tel:${row.phone}`}
                      className="inline-flex items-center gap-1.5 hover:text-brand-strong"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {row.phone}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className="text-[11px] whitespace-nowrap text-muted">
                    {formatDateTime(row.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusSelect
                      action={updateRegistrationStatus}
                      id={row.id}
                      status={row.status}
                      options={statuses}
                      label={`Status pendaftaran ${row.fullName}`}
                    />
                    {row.status === "Batal" ? (
                      <DeleteForm
                        action={deleteRegistration}
                        id={row.id}
                        label="Hapus"
                        confirmMessage={`Hapus permanen pendaftaran ${row.fullName}? Data tidak bisa dikembalikan.`}
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-line pt-4 text-[12.5px] sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                    Program
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-ink">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-strong" />
                    {row.courseName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                    Batch
                  </p>
                  <p className="mt-1 text-ink">
                    {row.batch ?? "Belum memilih batch"}
                    {row.scheduleLabel ? (
                      <span className="block text-[11.5px] text-muted">{row.scheduleLabel}</span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                    Pendidikan
                  </p>
                  <p className="mt-1 text-ink">{row.education ?? "—"}</p>
                </div>
              </div>

              {row.note ? (
                <div className="mt-3 flex gap-2 rounded-xl bg-cream/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-muted">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>{row.note}</p>
                </div>
              ) : null}
            </AdminCard>
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        basePath="/admin/pendaftaran"
        search={q}
        status={status}
      />

      <p className="text-[11.5px] text-muted">
        Pendaftaran berstatus <strong className="font-semibold text-ink">Batal</strong> bisa dihapus
        permanen. Status lain hanya bisa diubah agar riwayat tetap tersimpan.
      </p>

      <p className="text-[11.5px] text-muted">
        Butuh data program?{" "}
        <Link href="/admin/program" className="font-semibold text-brand-strong hover:underline">
          Kelola katalog program
        </Link>
        .
      </p>
    </div>
  );
}

export default function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <RegistrationsContent searchParams={searchParams} />
    </Suspense>
  );
}
