"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { createBackup, deleteBackup, isBackupName } from "@/lib/backups";

function noticeUrl(params: Record<string, string>) {
  return `/admin/backup?${new URLSearchParams(params).toString()}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.";
}

export async function createBackupAction() {
  await requireAdminSession();

  let target: string;
  try {
    const backup = await createBackup();
    target = noticeUrl({ created: backup.name });
  } catch (error) {
    target = noticeUrl({ error: errorMessage(error) });
  }

  revalidatePath("/admin/backup");
  redirect(target);
}

export async function deleteBackupAction(formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "");

  let target: string;
  try {
    if (!isBackupName(name)) throw new Error("Nama berkas backup tidak valid.");
    await deleteBackup(name);
    target = noticeUrl({ deleted: name });
  } catch (error) {
    target = noticeUrl({ error: errorMessage(error) });
  }

  revalidatePath("/admin/backup");
  redirect(target);
}
