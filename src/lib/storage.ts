import { randomUUID } from "node:crypto";
import { IMAGE_TYPES, type ImageMime } from "@/lib/media-rules";
import { encodeKeyPath, presignUrl } from "@/lib/sigv4";

/** R2: browser menulis staging; server menyalin dan memverifikasi objek final. */

type R2Config = {
  host: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

const REQUEST_TIMEOUT_MS = 15_000;

function readConfig(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) return null;
  if (!/^https:\/\//.test(publicBaseUrl)) return null;

  return {
    host: `${accountId}.r2.cloudflarestorage.com`,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
  };
}

export function isStorageConfigured() {
  return readConfig() !== null;
}

function requireConfig() {
  const config = readConfig();
  if (!config) throw new Error("Penyimpanan R2 belum dikonfigurasi (R2_*).");
  return config;
}

function signedUrl(
  config: R2Config,
  method: "GET" | "PUT" | "HEAD" | "DELETE",
  key: string,
  expiresIn: number,
  signedHeaders?: Record<string, string>,
) {
  return presignUrl({
    method,
    host: config.host,
    path: `/${encodeKeyPath(config.bucket)}/${encodeKeyPath(key)}`,
    region: "auto",
    service: "s3",
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    expiresIn,
    signedHeaders,
  });
}

export const IMAGE_UPLOAD_TTL_SECONDS = 300;

export function createObjectKey(folder: "products" | "courses", mime: ImageMime) {
  const year = new Date().getUTCFullYear();
  return `staging/${folder}/${year}/${randomUUID()}.${IMAGE_TYPES[mime]}`;
}

export const STAGING_OBJECT_KEY_PATTERN =
  /^staging\/(products|courses)\/\d{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$/;

export function finalObjectKey(stagingKey: string): string | null {
  if (!STAGING_OBJECT_KEY_PATTERN.test(stagingKey)) return null;
  const [, folder, year, filename] = stagingKey.split("/");
  return `${folder}/final/${year}/${filename}`;
}

/** PUT dapat diulang hingga kedaluwarsa, tetapi hanya boleh menulis staging. */
export function createUploadUrl(
  key: string,
  contentType: ImageMime,
  expiresIn = IMAGE_UPLOAD_TTL_SECONDS,
) {
  if (!STAGING_OBJECT_KEY_PATTERN.test(key)) throw new Error("Key staging tidak valid.");
  const config = requireConfig();
  return signedUrl(config, "PUT", key, expiresIn, { "content-type": contentType });
}

export function publicObjectUrl(key: string) {
  const config = requireConfig();
  return `${config.publicBaseUrl}/${encodeKeyPath(key)}`;
}

export async function copyObject(stagingKey: string, finalKey: string) {
  if (finalObjectKey(stagingKey) !== finalKey) throw new Error("Tujuan salinan tidak valid.");
  const config = requireConfig();
  const headers = {
    "x-amz-copy-source": `/${encodeKeyPath(config.bucket)}/${encodeKeyPath(stagingKey)}`,
  };
  const response = await fetch(signedUrl(config, "PUT", finalKey, 60, headers), {
    method: "PUT",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`COPY objek gagal: HTTP ${response.status}`);

  // S3 dapat mengembalikan Error dalam body meskipun statusnya HTTP 200.
  const body = await response.text();
  if (
    /<(?:[\w.-]+:)?Error(?:\s|\/?>)/.test(body) ||
    !/<(?:[\w.-]+:)?CopyObjectResult(?:\s[^>]*)?>[\s\S]*<\/(?:[\w.-]+:)?CopyObjectResult\s*>/.test(body)
  ) {
    throw new Error("COPY objek gagal: respons S3 tidak mengonfirmasi salinan.");
  }
}

export async function headObject(key: string) {
  const config = requireConfig();
  const response = await fetch(signedUrl(config, "HEAD", key, 60), {
    method: "HEAD",
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HEAD objek gagal: HTTP ${response.status}`);
  return {
    size: Number(response.headers.get("content-length") ?? "0"),
    contentType: response.headers.get("content-type") ?? "",
  };
}

/** Baca prefix saja, termasuk bila endpoint mengabaikan header Range. */
export async function readObjectPrefix(key: string, length = 32) {
  if (!Number.isSafeInteger(length) || length < 1 || length > 1024) {
    throw new Error("Panjang prefix tidak valid.");
  }
  const config = requireConfig();
  const response = await fetch(signedUrl(config, "GET", key, 60), {
    method: "GET",
    headers: { range: `bytes=0-${length - 1}` },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GET objek gagal: HTTP ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("GET objek gagal: body kosong.");
  const prefix = new Uint8Array(length);
  let offset = 0;
  try {
    while (offset < length) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value.subarray(0, length - offset);
      prefix.set(chunk, offset);
      offset += chunk.length;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return prefix.slice(0, offset);
}

export async function deleteObject(key: string) {
  const config = requireConfig();
  const response = await fetch(signedUrl(config, "DELETE", key, 60), {
    method: "DELETE",
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  // S3/R2 mengembalikan 204 juga untuk objek yang sudah tidak ada.
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE objek gagal: HTTP ${response.status}`);
  }
}
