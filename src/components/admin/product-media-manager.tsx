"use client";

import {
  ArrowDown,
  ArrowUp,
  CloudUpload,
  Film,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  addProductVideo,
  attachProductImage,
  createProductImageUpload,
  deleteProductMedia,
  moveProductMedia,
  updateProductMediaCaption,
} from "@/app/admin/product-actions";
import { fieldClass } from "@/components/forms/form-ui";
import { IMAGE_ACCEPT, isImageMime, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/media-rules";
import { MAX_PRODUCT_MEDIA, type ProductMediaItem } from "@/lib/products";
import { cn } from "@/lib/utils";

type Feedback = { tone: "success" | "error"; text: string } | null;

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      role={feedback.tone === "error" ? "alert" : "status"}
      className={cn(
        "mt-3 rounded-xl px-4 py-2.5 text-[12.5px] font-medium",
        feedback.tone === "error"
          ? "border border-red-200 bg-red-50 text-red-700"
          : "border border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {feedback.text}
    </p>
  );
}

function ImageUploader({ productId, disabled }: { productId: number; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function upload(file: File) {
    setFeedback(null);
    if (!isImageMime(file.type)) {
      setFeedback({ tone: "error", text: "Format gambar harus JPG, PNG, WebP, atau AVIF." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFeedback({ tone: "error", text: `Ukuran gambar maksimal ${MAX_IMAGE_LABEL}.` });
      return;
    }

    try {
      setStage("Meminta izin unggah…");
      const ticket = await createProductImageUpload({
        productId,
        contentType: file.type,
        size: file.size,
      });
      if (!ticket.ok) {
        setFeedback({ tone: "error", text: ticket.message });
        return;
      }

      setStage("Mengunggah ke R2…");
      const response = await fetch(ticket.uploadUrl, {
        method: "PUT",
        headers: { "content-type": ticket.contentType },
        body: file,
      });
      if (!response.ok) {
        setFeedback({
          tone: "error",
          text: `Unggahan ditolak R2 (HTTP ${response.status}). Periksa kredensial dan CORS bucket.`,
        });
        return;
      }

      setStage("Memverifikasi file…");
      const result = await attachProductImage({ productId, key: ticket.key, caption });
      if (result.ok) {
        setCaption("");
        setFeedback({ tone: "success", text: result.message ?? "Gambar ditambahkan." });
      } else {
        setFeedback({ tone: "error", text: result.message });
      }
    } catch (error) {
      console.error(error);
      setFeedback({
        tone: "error",
        text: "Koneksi ke R2 gagal. Biasanya karena aturan CORS bucket belum mengizinkan domain ini.",
      });
    } finally {
      setStage(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const busy = stage !== null;

  return (
    <div className="rounded-xl border border-line bg-cream/40 p-4">
      <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
        <ImagePlus className="h-4 w-4 text-brand-strong" />
        Unggah gambar
      </p>
      <p className="mt-1 text-[11px] text-muted">
        JPG, PNG, WebP, atau AVIF · maksimal {MAX_IMAGE_LABEL} · disimpan di Cloudflare R2.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={160}
          placeholder="Keterangan gambar (opsional)"
          disabled={disabled || busy}
          className={fieldClass()}
        />
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-semibold text-white hover:bg-ink/85 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
          {busy ? stage : "Pilih file"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <FeedbackLine feedback={feedback} />
    </div>
  );
}

function VideoForm({ productId, disabled }: { productId: number; disabled: boolean }) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="rounded-xl border border-line bg-cream/40 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setFeedback(null);
        startTransition(async () => {
          const result = await addProductVideo({ productId, url, caption });
          if (result.ok) {
            setUrl("");
            setCaption("");
            setFeedback({ tone: "success", text: result.message ?? "Video ditambahkan." });
          } else {
            setFeedback({ tone: "error", text: result.message });
          }
        });
      }}
    >
      <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
        <Film className="h-4 w-4 text-brand-strong" />
        Sematkan video
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Bunny Stream (iframe.mediadelivery.net/embed/…) atau tautan YouTube.
      </p>
      <div className="mt-3 grid gap-2">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          placeholder="https://iframe.mediadelivery.net/embed/12345/…"
          disabled={disabled || pending}
          className={fieldClass()}
        />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={160}
            placeholder="Keterangan video (opsional)"
            disabled={disabled || pending}
            className={fieldClass()}
          />
          <button
            type="submit"
            disabled={disabled || pending || !url}
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/25 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Tambahkan
          </button>
        </div>
      </div>
      <FeedbackLine feedback={feedback} />
    </form>
  );
}

function MediaCard({
  item,
  index,
  total,
  onFeedback,
}: {
  item: ProductMediaItem;
  index: number;
  total: number;
  onFeedback: (feedback: Feedback) => void;
}) {
  const [caption, setCaption] = useState(item.caption ?? "");
  const [pending, startTransition] = useTransition();
  const dirty = caption !== (item.caption ?? "");

  const run = (task: () => Promise<{ ok: boolean; message?: string }>) =>
    startTransition(async () => {
      const result = await task();
      onFeedback(
        result.ok
          ? result.message
            ? { tone: "success", text: result.message }
            : null
          : { tone: "error", text: result.message ?? "Aksi gagal." },
      );
    });

  return (
    <li className={cn("overflow-hidden rounded-xl border border-line bg-white", pending && "opacity-60")}>
      <div className="relative aspect-video bg-cream">
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.caption ?? `Media ${index + 1}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={item.url}
            title={item.caption ?? `Video ${index + 1}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture"
            className="h-full w-full"
          />
        )}
        <span className="absolute top-2 left-2 rounded-full bg-navy/80 px-2 py-0.5 text-[10.5px] font-semibold text-white">
          {index === 0 ? "Sampul" : `#${index + 1}`} · {item.type === "image" ? "Gambar" : "Video"}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={160}
            placeholder="Keterangan"
            aria-label={`Keterangan media ${index + 1}`}
            className="h-9 w-full rounded-lg border border-line px-3 text-[12.5px] text-ink focus:border-brand-strong focus:outline-none"
          />
          <button
            type="button"
            disabled={!dirty || pending}
            onClick={() => run(() => updateProductMediaCaption({ id: item.id, caption }))}
            aria-label="Simpan keterangan"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-ink hover:border-ink/25 disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={index === 0 || pending}
              onClick={() => run(() => moveProductMedia({ id: item.id, direction: "up" }))}
              aria-label="Pindah ke depan"
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink hover:border-ink/25 disabled:opacity-35"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1 || pending}
              onClick={() => run(() => moveProductMedia({ id: item.id, direction: "down" }))}
              aria-label="Pindah ke belakang"
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink hover:border-ink/25 disabled:opacity-35"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const message =
                item.type === "image" && item.storageKey
                  ? "Hapus gambar ini? File di R2 juga akan dihapus."
                  : "Hapus media ini dari galeri?";
              if (window.confirm(message)) run(() => deleteProductMedia({ id: item.id }));
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11.5px] font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        </div>
      </div>
    </li>
  );
}

export function ProductMediaManager({
  productId,
  media,
  storageReady,
}: {
  productId: number;
  media: ProductMediaItem[];
  storageReady: boolean;
}) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const full = media.length >= MAX_PRODUCT_MEDIA;

  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Galeri media</h2>
        <span className="text-[12px] text-muted">
          {media.length}/{MAX_PRODUCT_MEDIA} media · gambar pertama menjadi sampul katalog
        </span>
      </div>

      {!storageReady ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-900">
          Unggah gambar belum aktif karena Cloudflare R2 belum dikonfigurasi. Isi variabel
          R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, dan
          R2_PUBLIC_BASE_URL di server. Sematan video tetap bisa dipakai.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ImageUploader productId={productId} disabled={!storageReady || full} />
        <VideoForm productId={productId} disabled={full} />
      </div>

      <FeedbackLine feedback={feedback} />

      {media.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center text-[12.5px] text-muted">
          Belum ada media. Halaman publik akan menampilkan sampul bawaan sampai gambar ditambahkan.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item, index) => (
            <MediaCard
              key={`${item.id}-${item.caption ?? ""}`}
              item={item}
              index={index}
              total={media.length}
              onFeedback={setFeedback}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
