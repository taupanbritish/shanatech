import { createHash, createHmac } from "node:crypto";

/**
 * Penandatangan AWS Signature Version 4 (query-string / presigned URL) minimal untuk
 * API S3-compatible seperti Cloudflare R2. Sengaja tanpa dependensi dan tanpa alias
 * impor agar bisa diuji langsung dengan Node terhadap vektor uji resmi AWS.
 */

export type PresignInput = {
  method: "GET" | "PUT" | "HEAD" | "DELETE";
  host: string;
  /** Path kanonis yang sudah ter-encode, diawali "/". */
  path: string;
  region: string;
  service: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Masa berlaku dalam detik (1–604800). */
  expiresIn: number;
  /** Header tambahan yang ikut ditandatangani; klien wajib mengirim nilai yang sama. */
  signedHeaders?: Record<string, string>;
  now?: Date;
};

export function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** Encode setiap segmen key objek, mempertahankan pemisah "/". */
export function encodeKeyPath(key: string) {
  return key.split("/").map(encodeRfc3986).join("/");
}

export function toAmzDate(now: Date) {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function hmac(key: Buffer | string, data: string) {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

export function presignUrl(input: PresignInput) {
  if (!Number.isInteger(input.expiresIn) || input.expiresIn < 1 || input.expiresIn > 604800) {
    throw new Error("expiresIn harus 1–604800 detik");
  }

  const datetime = toAmzDate(input.now ?? new Date());
  const date = datetime.slice(0, 8);
  const scope = `${date}/${input.region}/${input.service}/aws4_request`;

  const headers: Record<string, string> = { host: input.host };
  for (const [name, value] of Object.entries(input.signedHeaders ?? {})) {
    headers[name.toLowerCase()] = value.trim().replace(/\s+/g, " ");
  }
  const headerNames = Object.keys(headers).sort();
  const signedHeaders = headerNames.join(";");

  const params: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${input.accessKeyId}/${scope}`,
    "X-Amz-Date": datetime,
    "X-Amz-Expires": String(input.expiresIn),
    "X-Amz-SignedHeaders": signedHeaders,
  };
  const canonicalQuery = Object.keys(params)
    .sort()
    .map((key) => `${encodeRfc3986(key)}=${encodeRfc3986(params[key])}`)
    .join("&");

  const canonicalHeaders = headerNames.map((name) => `${name}:${headers[name]}\n`).join("");
  const canonicalRequest = [
    input.method,
    input.path,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    datetime,
    scope,
    createHash("sha256").update(canonicalRequest, "utf8").digest("hex"),
  ].join("\n");

  let signingKey = hmac(`AWS4${input.secretAccessKey}`, date);
  signingKey = hmac(signingKey, input.region);
  signingKey = hmac(signingKey, input.service);
  signingKey = hmac(signingKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");

  return `https://${input.host}${input.path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
