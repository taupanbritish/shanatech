"use client";

import { Trash2 } from "lucide-react";

export function BackupDeleteForm({
  action,
  name,
}: {
  action: (formData: FormData) => Promise<void>;
  name: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Hapus berkas backup "${name}"? Berkas akan hilang dari server.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="name" value={name} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Hapus
      </button>
    </form>
  );
}
