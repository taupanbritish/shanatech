import {
  DatabaseBackup,
  Download,
  FileArchive,
  HardDrive,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminCard, AdminPageHeader, EmptyState } from "@/components/admin/admin-ui";
import { BackupDeleteForm } from "@/components/admin/backup-delete-form";
import { RestoreForm } from "@/components/admin/restore-form";
import { createBackupAction, deleteBackupAction } from "@/app/admin/backup-actions";
import { requireAdminSession } from "@/lib/auth";
import { listBackups } from "@/lib/backups";

export const metadata: Metadata = { title: "Backup & Restore" };

type BackupSearchParams = {
  created?: string;
  deleted?: string;
  restored?: string;
  safety?: string;
  error?: string;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="h-80 animate-pulse rounded-2xl border border-line bg-white" />
        <div className="h-80 animate-pulse rounded-2xl border border-line bg-white" />
      </div>
    </div>
  );
}

function SuccessNotice({ title, detail }: { title: string; detail?: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      <p className="font-semibold">{title}</p>
      {detail ? <p className="mt-1 font-mono text-[11.5px] break-all">{detail}</p> : null}
    </div>
  );
}

async function BackupContent({ searchParams }: { searchParams: Promise<BackupSearchParams> }) {
  const params = await searchParams;

  await requireAdminSession();
  const backups = await listBackups();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Pemeliharaan"
        title="Backup & Restore"
        description={`${backups.length} berkas backup tersimpan di server. Tujuh backup terbaru disimpan otomatis.`}
        action={
          <form action={createBackupAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white hover:bg-ink/85"
            >
              <DatabaseBackup className="h-4 w-4" />
              Buat backup sekarang
            </button>
          </form>
        }
      />

      {params.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p className="font-semibold">Proses gagal</p>
          <p className="mt-1 text-[12.5px] break-words">{params.error}</p>
        </div>
      ) : null}

      {params.created ? (
        <SuccessNotice title="Backup berhasil dibuat." detail={params.created} />
      ) : null}

      {params.deleted ? (
        <SuccessNotice title="Berkas backup dihapus." detail={params.deleted} />
      ) : null}

      {params.restored ? (
        <SuccessNotice
          title="Database berhasil dipulihkan."
          detail={
            params.safety
              ? `Sumber: ${params.restored} · Backup keamanan: ${params.safety}`
              : `Sumber: ${params.restored}`
          }
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminCard className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                Berkas backup
              </p>
              <p className="mt-1 text-[12.5px] text-muted">
                Format custom PostgreSQL, dapat diunduh dan dipulihkan kembali.
              </p>
            </div>
            <span className="rounded-full bg-cream px-3 py-1 text-[11.5px] font-semibold text-muted">
              {backups.length}
            </span>
          </div>

          {backups.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Belum ada backup"
                description="Buat backup pertama sebelum melakukan perubahan besar pada data program, jadwal, atau pendaftaran."
              />
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {backups.map((backup) => (
                <li
                  key={backup.name}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand-strong">
                      <FileArchive className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[12px] font-semibold break-all text-ink">
                        {backup.name}
                      </p>
                      <p className="mt-1 text-[11.5px] text-muted">
                        {dateFormatter.format(backup.createdAt)} WIB · {formatSize(backup.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <a
                      href={`/admin/backup/files/${encodeURIComponent(backup.name)}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh
                    </a>
                    <BackupDeleteForm action={deleteBackupAction} name={backup.name} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <div className="space-y-5">
          <AdminCard className="border-red-200 bg-red-50/40 p-6">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-red-700 uppercase">
              <ShieldAlert className="h-4 w-4" />
              Zona berbahaya
            </p>
            <h2 className="mt-3 font-display text-lg font-semibold text-ink">Restore database</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Seluruh data saat ini akan diganti dengan isi berkas. Sistem membuat backup keamanan
              otomatis sebelum proses dimulai.
            </p>

            <div className="mt-5">
              <RestoreForm />
            </div>

            <ul className="mt-5 space-y-2 border-t border-red-200/70 pt-4 text-[11.5px] leading-relaxed text-muted">
              <li className="flex gap-2">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                Hanya menerima berkas .dump format custom dari halaman ini.
              </li>
              <li className="flex gap-2">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                Restore berjalan dalam satu transaksi: jika gagal, data lama tetap utuh.
              </li>
              <li className="flex gap-2">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                Setelah restore, katalog Academy di situs publik diperbarui otomatis.
              </li>
            </ul>
          </AdminCard>

          <AdminCard className="p-6">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              <HardDrive className="h-4 w-4 text-brand-strong" />
              Penyimpanan
            </p>
            <ul className="mt-4 space-y-2.5 text-[12px] leading-relaxed text-muted">
              <li>Disimpan di folder <span className="font-mono text-ink">backups/</span> atau sesuai <span className="font-mono text-ink">BACKUP_DIR</span>.</li>
              <li>Retensi otomatis: 7 backup terbaru, sisanya dihapus.</li>
              <li>Butuh biner <span className="font-mono text-ink">pg_dump</span> dan <span className="font-mono text-ink">pg_restore</span> yang tersedia bagi proses server.</li>
              <li>Serverless tanpa disk persisten tidak cocok untuk fitur ini.</li>
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

export default function BackupPage({
  searchParams,
}: {
  searchParams: Promise<BackupSearchParams>;
}) {
  return (
    <Suspense fallback={<Skeleton />}>
      <BackupContent searchParams={searchParams} />
    </Suspense>
  );
}
