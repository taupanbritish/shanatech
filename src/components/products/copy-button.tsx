"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

async function writeClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Browser dapat menolak Clipboard API meskipun halaman memakai HTTPS.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Penyalinan ditolak browser.");
  } finally {
    textarea.remove();
  }
}

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        setFailed(false);
        try {
          await writeClipboard(value);
          setCopied(true);
        } catch {
          setCopied(false);
          setFailed(true);
        }
      }}
      aria-label={copied ? `${label} tersalin` : failed ? `Gagal menyalin ${label}. Coba lagi` : `Salin ${label}`}
      title={failed ? "Browser menolak penyalinan. Silakan salin teks secara manual." : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-semibold transition-colors",
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-line bg-white text-ink hover:border-ink/25",
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Tersalin" : failed ? "Coba lagi" : "Salin"}
      <span aria-live="polite" className="sr-only">
        {copied ? `${label} tersalin` : failed ? "Penyalinan ditolak browser. Salin teks secara manual." : ""}
      </span>
    </button>
  );
}
