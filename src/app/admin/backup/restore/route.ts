import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { restoreBackup } from "@/lib/backups";
import { ACADEMY_CATALOG_TAG } from "@/lib/queries";

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

function redirectTo(request: NextRequest, params: Record<string, string>) {
  return NextResponse.redirect(
    new URL(`/admin/backup?${new URLSearchParams(params).toString()}`, request.url),
    303,
  );
}

function failure(request: NextRequest, message: string) {
  return redirectTo(request, { error: message.slice(0, 500) });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_UPLOAD_BYTES) {
    return failure(request, "Berkas terlalu besar. Maksimal 200 MB.");
  }

  let file: FormDataEntryValue | null;
  try {
    const form = await request.formData();
    file = form.get("file");
  } catch {
    return failure(request, "Berkas gagal diunggah. Coba lagi.");
  }

  if (!(file instanceof File) || file.size === 0) {
    return failure(request, "Pilih berkas .dump terlebih dahulu.");
  }
  if (!file.name.toLowerCase().endsWith(".dump")) {
    return failure(request, "Format berkas harus .dump hasil backup PostgreSQL.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return failure(request, "Berkas terlalu besar. Maksimal 200 MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString("latin1") !== "PGDMP") {
    return failure(
      request,
      "Berkas bukan dump PostgreSQL format custom. Buat backup melalui halaman ini atau dengan pg_dump --format=custom.",
    );
  }

  const directory = await mkdtemp(path.join(tmpdir(), "shanatech-restore-"));
  const tempFile = path.join(directory, "upload.dump");

  try {
    await writeFile(tempFile, bytes, { mode: 0o600 });
    const safety = await restoreBackup(tempFile);

    revalidateTag(ACADEMY_CATALOG_TAG, "max");
    revalidatePath("/academy");
    revalidatePath("/");

    return redirectTo(request, {
      restored: file.name,
      safety: safety.name,
    });
  } catch (error) {
    return failure(request, error instanceof Error ? error.message : "Restore gagal.");
  } finally {
    await rm(directory, { recursive: true, force: true }).catch(() => undefined);
  }
}
