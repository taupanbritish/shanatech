"use client";

import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

export function RestoreForm() {
  const [fileName, setFileName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/admin/backup/restore"
      method="post"
      encType="multipart/form-data"
      onSubmit={(event) => {
        if (!fileName || !acknowledged) {
          event.preventDefault();
          return;
        }
        setPending(true);
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
          Berkas .dump
        </span>
        <input
          type="file"
          name="file"
          accept=".dump,application/octet-stream"
          required
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-line bg-cream/50 px-4 py-3 text-[12px] text-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:border-ink/25"
        />
      </label>

      <label className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-3">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          disabled={pending}
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
        />
        <span className="text-[12px] leading-snug text-red-700">
          Saya memahami seluruh data saat ini akan diganti dengan isi berkas{" "}
          <strong className="font-semibold">{fileName || "yang dipilih"}</strong>.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending || !fileName || !acknowledged}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {pending ? "Memulihkan database..." : "Mulai restore"}
      </button>
    </form>
  );
}
