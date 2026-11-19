"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { PoolClient } from "pg";
import { productSchema } from "@/lib/admin-validation";
import { requireAdminSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import {
  detectImageMime,
  isImageMime,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_LABEL,
  toVideoEmbedUrl,
} from "@/lib/media-rules";
import { MAX_PRODUCT_MEDIA, PRODUCTS_TAG } from "@/lib/products";
import {
  copyObject,
  createObjectKey,
  createUploadUrl,
  deleteObject,
  finalObjectKey,
  headObject,
  IMAGE_UPLOAD_TTL_SECONDS,
  isStorageConfigured,
  publicObjectUrl,
  readObjectPrefix,
} from "@/lib/storage";
import { toFieldErrors } from "@/lib/validation";

type MediaResult = { ok: true; message?: string } | { ok: false; message: string };

function errorState(message: string, errors?: Record<string, string>): FormState {
  return { status: "error", message, errors };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function validId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function refreshProducts(productId?: number) {
  updateTag(PRODUCTS_TAG);
  revalidatePath("/products");
  revalidatePath("/admin/produk");
  if (productId) revalidatePath(`/admin/produk/${productId}`);
}

function textValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("cred") && key !== "pricingModels") {
      values[key] = value;
    }
  }
  return values;
}

function readCredentials(formData: FormData) {
  const field = (name: string) => formData.getAll(name).map((value) => String(value));
  const roles = field("credRole");
  const usernames = field("credUsername");
  const passwords = field("credPassword");
  const notes = field("credNote");

  return roles
    .map((role, index) => ({
      role,
      username: usernames[index] ?? "",
      password: passwords[index] ?? "",
      note: notes[index] ?? "",
    }))
    .filter((row) => [row.role, row.username, row.password, row.note].some((v) => v.trim()));
}

export async function saveProduct(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdminSession();

  const parsed = productSchema.safeParse({
    ...Object.fromEntries(formData),
    pricingModels: formData.getAll("pricingModels").map(String),
    demoCredentials: readCredentials(formData),
  });

  if (!parsed.success) {
    const errors = toFieldErrors(parsed.error);
    const credentialIssue = parsed.error.issues.find(
      (issue) => issue.path[0] === "demoCredentials" && typeof issue.path[1] === "number",
    );
    if (credentialIssue) {
      errors.demoCredentials = `Akun demo #${Number(credentialIssue.path[1]) + 1}: ${credentialIssue.message}`;
    }
    return {
      ...errorState("Periksa kembali data produk.", errors),
      values: textValues(formData),
    };
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);
  if (!slug) {
    return {
      ...errorState("Slug produk belum valid.", {
        slug: "Isi slug atau gunakan nama produk yang mengandung huruf/angka.",
      }),
      values: textValues(formData),
    };
  }

  const credentials = data.demoCredentials.map((item) => ({
    role: item.role,
    username: item.username,
    password: item.password,
    ...(item.note ? { note: item.note } : {}),
  }));

  const params = [
    slug,
    data.title,
    data.tagline,
    data.category,
    data.description,
    data.features,
    data.techStack,
    data.pricingModels,
    data.pricingNote ?? null,
    data.demoUrl ?? null,
    JSON.stringify(credentials),
    data.demoNote ?? null,
    data.caseStudy ?? null,
    data.impactPoints,
    data.featured,
    data.status,
    data.sortOrder,
  ];

  let productId = data.id;
  try {
    if (data.id) {
      const result = await query(
        `UPDATE products SET
           slug = $1, title = $2, tagline = $3, category = $4, description = $5,
           features = $6, tech_stack = $7, pricing_models = $8, pricing_note = $9,
           demo_url = $10, demo_credentials = $11::jsonb, demo_note = $12,
           case_study = $13, impact_points = $14, is_featured = $15, status = $16,
           sort_order = $17, updated_at = NOW()
         WHERE id = $18`,
        [...params, data.id],
      );
      if (result.rowCount === 0) {
        return { ...errorState("Produk tidak ditemukan."), values: textValues(formData) };
      }
    } else {
      const { rows } = await query<{ id: number }>(
        `INSERT INTO products
           (slug, title, tagline, category, description, features, tech_stack,
            pricing_models, pricing_note, demo_url, demo_credentials, demo_note,
            case_study, impact_points, is_featured, status, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17)
         RETURNING id`,
        params,
      );
      productId = rows[0].id;
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return {
        ...errorState("Slug sudah digunakan produk lain.", { slug: "Slug harus unik." }),
        values: textValues(formData),
      };
    }
    console.error("[admin] Gagal menyimpan produk:", error);
    return { ...errorState("Produk belum bisa disimpan. Coba lagi."), values: textValues(formData) };
  }

  refreshProducts(productId);
  redirect(`/admin/produk/${productId}?notice=${data.id ? "diperbarui" : "dibuat"}`);
}

export async function deleteProduct(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdminSession();

  const id = validId(formData.get("id"));
  if (!id) return errorState("Produk tidak valid.");

  let keys: string[] | null;
  try {
    keys = await withMediaTransaction(async (client) => {
      // Snapshot daftar media harus diambil setelah unggahan yang memegang lock selesai.
      if (!(await lockProduct(client, id))) return null;
      const { rows } = await client.query<{ storage_key: string }>(
        `SELECT storage_key FROM product_media
          WHERE product_id = $1 AND storage_key IS NOT NULL
         UNION
         SELECT staging_key AS storage_key FROM product_image_uploads WHERE product_id = $1`,
        [id],
      );
      await client.query("DELETE FROM products WHERE id = $1", [id]);
      return rows.map((row) => row.storage_key);
    });
    if (keys === null) return errorState("Produk tidak ditemukan.");
  } catch (error) {
    console.error("[admin] Gagal menghapus produk:", error);
    return errorState("Produk belum bisa dihapus. Coba lagi.");
  }

  await removeObjects(keys);
  refreshProducts();
  return { status: "success", message: "Produk dihapus." };
}

/** Hapus objek R2 secara best-effort; kegagalan dicatat tanpa membatalkan aksi. */
async function removeObjects(keys: string[]) {
  if (keys.length === 0 || !isStorageConfigured()) return;
  await Promise.all(
    keys.map((key) =>
      deleteObject(key).catch((error) => {
        console.error(`[media] Gagal menghapus objek R2 ${key}:`, error);
      }),
    ),
  );
}

async function withMediaTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function lockProduct(client: PoolClient, productId: number) {
  const { rows } = await client.query<{ id: number }>(
    "SELECT id FROM products WHERE id = $1 FOR UPDATE",
    [productId],
  );
  return Boolean(rows[0]);
}

async function productMediaCount(client: PoolClient, productId: number) {
  const { rows } = await client.query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM product_media WHERE product_id = $1",
    [productId],
  );
  return rows[0].count;
}

async function sweepExpiredImageUploads() {
  try {
    const { rows } = await query<{ staging_key: string }>(
      `WITH expired AS (
         SELECT staging_key FROM product_image_uploads
          WHERE expires_at <= clock_timestamp()
          ORDER BY expires_at, staging_key LIMIT 25 FOR UPDATE SKIP LOCKED
       )
       DELETE FROM product_image_uploads u USING expired e
        WHERE u.staging_key = e.staging_key RETURNING u.staging_key`,
    );
    await removeObjects(rows.map((row) => row.staging_key));
  } catch (error) {
    console.error("[media] Gagal membersihkan tiket unggahan kedaluwarsa:", error);
  }
}

/** Terbitkan tiket DB dan PUT staging; final tidak pernah diberi URL unggah publik. */
export async function createProductImageUpload(input: {
  productId: number;
  contentType: string;
  size: number;
}): Promise<
  | { ok: true; uploadUrl: string; key: string; contentType: string }
  | { ok: false; message: string }
> {
  await requireAdminSession();

  if (!isStorageConfigured()) {
    return { ok: false, message: "Penyimpanan R2 belum dikonfigurasi di server (variabel R2_*)." };
  }

  const productId = validId(input?.productId);
  if (!productId) return { ok: false, message: "Produk tidak valid." };

  const contentType = String(input.contentType ?? "");
  if (!isImageMime(contentType)) {
    return { ok: false, message: "Format gambar harus JPG, PNG, WebP, atau AVIF." };
  }

  const size = Number(input.size);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_BYTES) {
    return { ok: false, message: `Ukuran gambar maksimal ${MAX_IMAGE_LABEL}.` };
  }

  try {
    await sweepExpiredImageUploads();
    return await withMediaTransaction(async (client) => {
      if (!(await lockProduct(client, productId))) {
        return { ok: false as const, message: "Produk tidak ditemukan." };
      }
      if ((await productMediaCount(client, productId)) >= MAX_PRODUCT_MEDIA) {
        return { ok: false as const, message: `Maksimal ${MAX_PRODUCT_MEDIA} media per produk.` };
      }

      const key = createObjectKey("products", contentType);
      const finalKey = finalObjectKey(key);
      const uploadUrl = createUploadUrl(key, contentType);
      await client.query(
        `INSERT INTO product_image_uploads
           (staging_key, final_key, product_id, content_type, expires_at)
         VALUES ($1, $2, $3, $4, clock_timestamp() + $5 * INTERVAL '1 second')`,
        [key, finalKey, productId, contentType, IMAGE_UPLOAD_TTL_SECONDS],
      );
      return { ok: true as const, uploadUrl, key, contentType };
    });
  } catch (error) {
    console.error("[media] Gagal membuat tiket unggahan:", error);
    return { ok: false, message: "Unggahan belum bisa disiapkan. Coba lagi." };
  }
}

/** Salin staging milik tiket, verifikasi final, lalu simpan media dan konsumsi tiket. */
export async function attachProductImage(input: {
  productId: number;
  key: string;
  caption?: string;
}): Promise<MediaResult> {
  await requireAdminSession();

  const productId = validId(input?.productId);
  const key = String(input?.key ?? "");
  const finalKey = finalObjectKey(key);
  const caption = String(input?.caption ?? "").trim().slice(0, 160) || null;

  if (!productId || !finalKey || !key.startsWith("staging/products/")) {
    return { ok: false, message: "Data unggahan tidak valid." };
  }
  if (!isStorageConfigured()) {
    return { ok: false, message: "Penyimpanan R2 belum dikonfigurasi di server." };
  }

  let attached = false;
  let result: MediaResult;
  try {
    result = await withMediaTransaction<MediaResult>(async (client) => {
      if (!(await lockProduct(client, productId))) {
        return { ok: false, message: "Produk tidak ditemukan." };
      }

      const existing = await client.query<{ product_id: number }>(
        "SELECT product_id FROM product_media WHERE storage_key = $1",
        [finalKey],
      );
      if (existing.rows[0]) {
        return existing.rows[0].product_id === productId
          ? { ok: true, message: "Gambar sudah ditambahkan." }
          : { ok: false, message: "Data unggahan tidak valid." };
      }

      const { rows } = await client.query<{
        final_key: string;
        content_type: string;
        valid: boolean;
      }>(
        `SELECT final_key, content_type, expires_at > clock_timestamp() AS valid
           FROM product_image_uploads
          WHERE staging_key = $1 AND product_id = $2 FOR UPDATE`,
        [key, productId],
      );
      const ticket = rows[0];
      if (!ticket || ticket.final_key !== finalKey || !isImageMime(ticket.content_type)) {
        return { ok: false, message: "Tiket unggahan tidak valid. Ulangi unggahan." };
      }
      if (!ticket.valid) {
        return { ok: false, message: "Tiket unggahan kedaluwarsa. Ulangi unggahan." };
      }
      if ((await productMediaCount(client, productId)) >= MAX_PRODUCT_MEDIA) {
        return { ok: false, message: `Maksimal ${MAX_PRODUCT_MEDIA} media per produk.` };
      }

      await client.query("SAVEPOINT image_attachment");
      try {
        await copyObject(key, finalKey);
        const head = await headObject(finalKey);
        let rejectReason: string | null = null;
        if (!head) {
          rejectReason = "File final belum ditemukan di R2. Ulangi unggahan.";
        } else if (!Number.isSafeInteger(head.size) || head.size <= 0 || head.size > MAX_IMAGE_BYTES) {
          rejectReason = `Ukuran gambar maksimal ${MAX_IMAGE_LABEL}.`;
        } else if (
          head.contentType !== ticket.content_type ||
          detectImageMime(await readObjectPrefix(finalKey)) !== ticket.content_type
        ) {
          rejectReason = "Isi dan tipe file harus sesuai format gambar yang diunggah.";
        }
        if (rejectReason) {
          await removeObjects([finalKey]);
          return { ok: false, message: rejectReason };
        }

        await client.query(
          `INSERT INTO product_media (product_id, media_url, storage_key, media_type, caption, sort_order)
           VALUES ($1, $2, $3, 'image', $4,
                   COALESCE((SELECT MAX(sort_order) + 1 FROM product_media WHERE product_id = $1), 0))`,
          [productId, publicObjectUrl(finalKey), finalKey, caption],
        );
        await client.query("DELETE FROM product_image_uploads WHERE staging_key = $1", [key]);
        attached = true;
        return { ok: true, message: "Gambar ditambahkan." };
      } catch (error) {
        // Pulihkan transaksi tanpa melepas lock produk/tiket sebelum cleanup final.
        await client.query("ROLLBACK TO SAVEPOINT image_attachment");
        await removeObjects([finalKey]);
        throw error;
      }
    });
  } catch (error) {
    // COMMIT yang gagal/ambigu tidak boleh diikuti DELETE objek yang mungkin sudah direferensikan.
    console.error("[media] Gagal melampirkan gambar produk:", error);
    return { ok: false, message: "Media belum bisa disimpan atau diverifikasi. Coba lagi." };
  }

  if (result.ok) {
    if (attached) await removeObjects([key]);
    refreshProducts(productId);
  }
  return result;
}

/** Video produk disematkan dari Bunny Stream atau YouTube, tidak disimpan di R2. */
export async function addProductVideo(input: {
  productId: number;
  url: string;
  caption?: string;
}): Promise<MediaResult> {
  await requireAdminSession();

  const productId = validId(input?.productId);
  if (!productId) return { ok: false, message: "Produk tidak valid." };

  const embedUrl = toVideoEmbedUrl(String(input?.url ?? ""));
  if (!embedUrl) {
    return {
      ok: false,
      message:
        "Gunakan URL embed Bunny Stream (iframe.mediadelivery.net/embed/…) atau tautan YouTube.",
    };
  }

  const caption = String(input?.caption ?? "").trim().slice(0, 160) || null;
  let result: MediaResult;
  try {
    result = await withMediaTransaction<MediaResult>(async (client) => {
      if (!(await lockProduct(client, productId))) {
        return { ok: false, message: "Produk tidak ditemukan." };
      }
      if ((await productMediaCount(client, productId)) >= MAX_PRODUCT_MEDIA) {
        return { ok: false, message: `Maksimal ${MAX_PRODUCT_MEDIA} media per produk.` };
      }
      await client.query(
        `INSERT INTO product_media (product_id, media_url, storage_key, media_type, caption, sort_order)
         VALUES ($1, $2, NULL, 'video', $3,
                 COALESCE((SELECT MAX(sort_order) + 1 FROM product_media WHERE product_id = $1), 0))`,
        [productId, embedUrl, caption],
      );
      return { ok: true, message: "Video ditambahkan." };
    });
  } catch (error) {
    console.error("[media] Gagal menambahkan video:", error);
    return { ok: false, message: "Video belum bisa disimpan. Coba lagi." };
  }

  if (result.ok) refreshProducts(productId);
  return result;
}

export async function updateProductMediaCaption(input: {
  id: number;
  caption: string;
}): Promise<MediaResult> {
  await requireAdminSession();
  const id = validId(input?.id);
  if (!id) return { ok: false, message: "Media tidak valid." };

  const caption = String(input?.caption ?? "").trim().slice(0, 160) || null;
  let productId: number;
  try {
    const { rows } = await query<{ product_id: number }>(
      `UPDATE product_media SET caption = $1 WHERE id = $2 RETURNING product_id`,
      [caption, id],
    );
    if (!rows[0]) return { ok: false, message: "Media tidak ditemukan." };
    productId = rows[0].product_id;
  } catch (error) {
    console.error("[media] Gagal menyimpan keterangan media:", error);
    return { ok: false, message: "Keterangan belum bisa disimpan. Coba lagi." };
  }

  refreshProducts(productId);
  return { ok: true, message: "Keterangan disimpan." };
}

export async function moveProductMedia(input: {
  id: number;
  direction: "up" | "down";
}): Promise<MediaResult> {
  await requireAdminSession();
  const id = validId(input?.id);
  if (!id || (input.direction !== "up" && input.direction !== "down")) {
    return { ok: false, message: "Permintaan tidak valid." };
  }

  let productId: number | undefined;
  let result: MediaResult;
  try {
    result = await withMediaTransaction<MediaResult>(async (client) => {
      const parent = await client.query<{ id: number }>(
        `SELECT p.id FROM products p
          WHERE p.id = (SELECT product_id FROM product_media WHERE id = $1)
          FOR UPDATE OF p`,
        [id],
      );
      productId = parent.rows[0]?.id;
      if (!productId) return { ok: false, message: "Media tidak ditemukan." };

      const { rows } = await client.query<{ id: number; sort_order: number }>(
        `SELECT id, sort_order FROM product_media WHERE product_id = $1
          ORDER BY id ASC FOR UPDATE`,
        [productId],
      );
      const ids = rows.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id).map((row) => row.id);
      const index = ids.indexOf(id);
      if (index < 0) return { ok: false, message: "Media tidak ditemukan." };
      const target = input.direction === "up" ? index - 1 : index + 1;
      if (target >= 0 && target < ids.length) {
        [ids[index], ids[target]] = [ids[target], ids[index]];
      }
      await client.query(
        `UPDATE product_media m SET sort_order = o.position - 1
           FROM unnest($1::int[]) WITH ORDINALITY AS o(id, position)
          WHERE m.id = o.id`,
        [ids],
      );
      return { ok: true };
    });
  } catch (error) {
    console.error("[media] Gagal mengubah urutan media:", error);
    return { ok: false, message: "Urutan belum bisa diubah. Coba lagi." };
  }

  if (result.ok) refreshProducts(productId);
  return result;
}

export async function deleteProductMedia(input: { id: number }): Promise<MediaResult> {
  await requireAdminSession();
  const id = validId(input?.id);
  if (!id) return { ok: false, message: "Media tidak valid." };

  let removed: { product_id: number; storage_key: string | null };
  try {
    const { rows } = await query<typeof removed>(
      `DELETE FROM product_media WHERE id = $1 RETURNING product_id, storage_key`,
      [id],
    );
    if (!rows[0]) return { ok: false, message: "Media tidak ditemukan." };
    removed = rows[0];
  } catch (error) {
    console.error("[media] Gagal menghapus media:", error);
    return { ok: false, message: "Media belum bisa dihapus. Coba lagi." };
  }

  if (removed.storage_key) await removeObjects([removed.storage_key]);
  refreshProducts(removed.product_id);
  return { ok: true, message: "Media dihapus." };
}
