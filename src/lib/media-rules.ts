/** Aturan media yang dipakai bersama oleh klien (validasi awal) dan server (validasi final). */

export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type ImageMime = keyof typeof IMAGE_TYPES;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_LABEL = "5 MB";
export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");

export function isImageMime(value: string): value is ImageMime {
  return Object.prototype.hasOwnProperty.call(IMAGE_TYPES, value);
}

/** Kenali format gambar dari magic bytes, bukan dari nama file atau Content-Type klien. */
export function detectImageMime(bytes: Uint8Array): ImageMime | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)
  ) {
    return "image/png";
  }
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  if (bytes.length >= 12 && ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) {
    return "image/avif";
  }
  return null;
}

/**
 * Video produk disematkan dari Bunny Stream (atau YouTube), bukan diunggah ke R2.
 * Kembalikan URL embed yang aman, atau null bila host tidak diizinkan.
 */
export function toVideoEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();

  // Bunny Stream: https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
  // atau https://player.mediadelivery.net/embed/{libraryId}/{videoId}
  if (host === "iframe.mediadelivery.net" || host === "player.mediadelivery.net") {
    const match = url.pathname.match(/^\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})\/?$/i);
    if (!match) return null;
    return `https://iframe.mediadelivery.net/embed/${match[1]}/${match[2]}`;
  }

  // YouTube: watch?v=, youtu.be/, /embed/
  let youtubeId: string | null = null;
  if (host === "youtu.be") youtubeId = url.pathname.slice(1);
  if (host === "www.youtube.com" || host === "youtube.com" || host === "www.youtube-nocookie.com") {
    youtubeId = url.searchParams.get("v") ?? url.pathname.match(/^\/embed\/([^/]+)/)?.[1] ?? null;
  }
  if (youtubeId && /^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
  }

  return null;
}
