import { execFile } from "node:child_process";
import { chmod, mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BACKUP_PATTERN = /^shanatech-\d{8}-\d{6}\.dump$/;
const MAX_BACKUPS = 7;
const COMMAND_TIMEOUT_MS = 5 * 60 * 1000;

export type BackupFile = {
  name: string;
  size: number;
  createdAt: Date;
};

function backupRoot() {
  return process.env.BACKUP_DIR?.trim() || path.join(process.cwd(), "backups");
}

function pgConnection() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgres://shanatech:shanatech@127.0.0.1:5433/shanatech";
  const url = new URL(connectionString);
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: decodeURIComponent(url.pathname.replace(/^\//, "")),
  };
  const sslmode = url.searchParams.get("sslmode");
  if (sslmode) env.PGSSLMODE = sslmode;
  return { env, database: env.PGDATABASE ?? "" };
}

function timestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `${day}-${time}`;
}

function commandError(tool: string, error: unknown) {
  if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
    return `${tool} tidak ditemukan di server. Setel path-nya lewat environment.`;
  }
  if (error && typeof error === "object") {
    const detail = String(
      (error as { stderr?: string }).stderr ?? (error as { message?: string }).message ?? "",
    ).trim();
    if (detail) return detail.split("\n").slice(-4).join(" ");
  }
  return `Perintah ${tool} gagal dijalankan.`;
}

export function isBackupName(name: string) {
  return BACKUP_PATTERN.test(name);
}

export function backupPath(name: string) {
  if (!isBackupName(name)) throw new Error("Nama berkas backup tidak valid.");
  return path.join(/*turbopackIgnore: true*/ backupRoot(), name);
}

export async function listBackups(): Promise<BackupFile[]> {
  let entries;
  try {
    entries = await readdir(/*turbopackIgnore: true*/ backupRoot(), { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && isBackupName(entry.name))
      .map(async (entry) => {
        const info = await stat(
          /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ backupRoot(), entry.name),
        );
        return { name: entry.name, size: info.size, createdAt: info.mtime };
      }),
  );

  return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

async function pruneBackups() {
  const backups = await listBackups();
  await Promise.all(
    backups
      .slice(MAX_BACKUPS)
      .map((backup) => unlink(backupPath(backup.name)).catch(() => undefined)),
  );
}

export async function createBackup(): Promise<BackupFile> {
  const directory = backupRoot();
  await mkdir(directory, { recursive: true, mode: 0o700 });

  const name = `shanatech-${timestamp()}.dump`;
  const filePath = path.join(directory, name);
  const binary = process.env.PG_DUMP_PATH?.trim() || "pg_dump";

  try {
    await execFileAsync(
      binary,
      ["--format=custom", "--no-owner", "--no-privileges", "--file", filePath],
      {
        env: pgConnection().env,
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
  } catch (error) {
    await unlink(filePath).catch(() => undefined);
    throw new Error(`Backup gagal: ${commandError(binary, error)}`);
  }

  await chmod(filePath, 0o600);
  const info = await stat(filePath);
  await pruneBackups();

  return { name, size: info.size, createdAt: info.mtime };
}

export async function deleteBackup(name: string) {
  await unlink(backupPath(name));
}

export async function restoreBackup(filePath: string): Promise<BackupFile> {
  const safety = await createBackup();
  const binary = process.env.PG_RESTORE_PATH?.trim() || "pg_restore";
  const { env, database } = pgConnection();

  try {
    await execFileAsync(
      binary,
      [
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-privileges",
        "--single-transaction",
        "--dbname",
        database,
        filePath,
      ],
      {
        env,
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: 20 * 1024 * 1024,
      },
    );
  } catch (error) {
    throw new Error(
      `Restore gagal. Backup keamanan tersimpan sebagai ${safety.name}. ${commandError(binary, error)}`,
    );
  }

  return safety;
}
