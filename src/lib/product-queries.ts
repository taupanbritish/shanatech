import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/db";
import {
  PRODUCTS_TAG,
  type DemoCredential,
  type PricingModel,
  type ProductCategory,
  type ProductMediaItem,
  type ProductStatus,
} from "@/lib/products";

type ProductRow = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  category: ProductCategory;
  description: string;
  features: string[];
  tech_stack: string[];
  pricing_models: PricingModel[];
  pricing_note: string | null;
  demo_url: string | null;
  demo_credentials: DemoCredential[];
  demo_note: string | null;
  case_study: string | null;
  impact_points: string[];
  is_featured: boolean;
  status: ProductStatus;
  sort_order: number;
  updated_at: Date;
};

type MediaRow = {
  id: number;
  product_id: number;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  storage_key: string | null;
  sort_order: number;
};

export type Product = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  category: ProductCategory;
  description: string;
  features: string[];
  techStack: string[];
  pricingModels: PricingModel[];
  pricingNote: string | null;
  demoUrl: string | null;
  demoCredentials: DemoCredential[];
  demoNote: string | null;
  caseStudy: string | null;
  impactPoints: string[];
  featured: boolean;
  status: ProductStatus;
  sortOrder: number;
  updatedAt: string;
  media: ProductMediaItem[];
};

export type ProductSummary = Pick<
  Product,
  "id" | "slug" | "title" | "tagline" | "category" | "techStack" | "pricingModels" | "featured"
> & { coverUrl: string | null; coverCaption: string | null; hasDemo: boolean };

const PRODUCT_COLUMNS = `
  p.id, p.slug, p.title, p.tagline, p.category, p.description, p.features, p.tech_stack,
  p.pricing_models, p.pricing_note, p.demo_url, p.demo_credentials, p.demo_note,
  p.case_study, p.impact_points, p.is_featured, p.status, p.sort_order, p.updated_at`;

function toMedia(row: MediaRow): ProductMediaItem {
  return {
    id: row.id,
    url: row.media_url,
    type: row.media_type,
    caption: row.caption,
    storageKey: row.storage_key,
    sortOrder: row.sort_order,
  };
}

function toProduct(row: ProductRow, media: MediaRow[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    category: row.category,
    description: row.description,
    features: row.features,
    techStack: row.tech_stack,
    pricingModels: row.pricing_models,
    pricingNote: row.pricing_note,
    demoUrl: row.demo_url,
    demoCredentials: Array.isArray(row.demo_credentials) ? row.demo_credentials : [],
    demoNote: row.demo_note,
    caseStudy: row.case_study,
    impactPoints: row.impact_points,
    featured: row.is_featured,
    status: row.status,
    sortOrder: row.sort_order,
    updatedAt: new Date(row.updated_at).toISOString(),
    media: media.map(toMedia),
  };
}

async function mediaFor(productId: number) {
  const { rows } = await query<MediaRow>(
    `SELECT id, product_id, media_url, media_type, caption, storage_key, sort_order
       FROM product_media WHERE product_id = $1
      ORDER BY sort_order ASC, id ASC`,
    [productId],
  );
  return rows;
}

/* ------------------------------------------------------------------ */
/* Publik — di-cache dan diinvalidasi lewat updateTag(PRODUCTS_TAG)     */
/* ------------------------------------------------------------------ */

export async function getPublishedProducts(category?: ProductCategory): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_TAG);

  const { rows } = await query<{
    id: number;
    slug: string;
    title: string;
    tagline: string;
    category: ProductCategory;
    tech_stack: string[];
    pricing_models: PricingModel[];
    is_featured: boolean;
    has_demo: boolean;
    cover_url: string | null;
    cover_caption: string | null;
  }>(
    `SELECT p.id, p.slug, p.title, p.tagline, p.category, p.tech_stack, p.pricing_models,
            p.is_featured,
            (p.demo_url IS NOT NULL OR jsonb_array_length(p.demo_credentials) > 0) AS has_demo,
            cover.media_url AS cover_url, cover.caption AS cover_caption
       FROM products p
       LEFT JOIN LATERAL (
         SELECT media_url, caption FROM product_media m
          WHERE m.product_id = p.id AND m.media_type = 'image'
          ORDER BY m.sort_order ASC, m.id ASC LIMIT 1
       ) cover ON TRUE
      WHERE p.status = 'Terbit' AND ($1::text IS NULL OR p.category = $1)
      ORDER BY p.is_featured DESC, p.sort_order ASC, p.title ASC`,
    [category ?? null],
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    category: row.category,
    techStack: row.tech_stack,
    pricingModels: row.pricing_models,
    featured: row.is_featured,
    hasDemo: row.has_demo,
    coverUrl: row.cover_url,
    coverCaption: row.cover_caption,
  }));
}

export async function getPublishedCategoryCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_TAG);

  const { rows } = await query<{ category: string; count: number }>(
    `SELECT category, COUNT(*)::int AS count FROM products
      WHERE status = 'Terbit' GROUP BY category`,
  );
  return Object.fromEntries(rows.map((row) => [row.category, row.count]));
}

export async function getPublishedProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_TAG);

  const { rows } = await query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS} FROM products p WHERE p.slug = $1 AND p.status = 'Terbit'`,
    [slug],
  );
  const row = rows[0];
  if (!row) return null;
  return toProduct(row, await mediaFor(row.id));
}

/* ------------------------------------------------------------------ */
/* Admin — selalu segar, dipanggil setelah requireAdminSession()        */
/* ------------------------------------------------------------------ */

export type AdminProductListItem = {
  id: number;
  slug: string;
  title: string;
  category: ProductCategory;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  pricingModels: PricingModel[];
  mediaCount: number;
  credentialCount: number;
  coverUrl: string | null;
  updatedAt: string;
};

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const { rows } = await query<{
    id: number;
    slug: string;
    title: string;
    category: ProductCategory;
    status: ProductStatus;
    is_featured: boolean;
    sort_order: number;
    pricing_models: PricingModel[];
    media_count: number;
    credential_count: number;
    cover_url: string | null;
    updated_at: Date;
  }>(
    `SELECT p.id, p.slug, p.title, p.category, p.status, p.is_featured, p.sort_order,
            p.pricing_models, p.updated_at,
            jsonb_array_length(p.demo_credentials) AS credential_count,
            (SELECT COUNT(*)::int FROM product_media m WHERE m.product_id = p.id) AS media_count,
            (SELECT media_url FROM product_media m
              WHERE m.product_id = p.id AND m.media_type = 'image'
              ORDER BY m.sort_order ASC, m.id ASC LIMIT 1) AS cover_url
       FROM products p
      ORDER BY CASE p.status WHEN 'Terbit' THEN 0 WHEN 'Draf' THEN 1 ELSE 2 END,
               p.sort_order ASC, p.title ASC`,
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    featured: row.is_featured,
    sortOrder: row.sort_order,
    pricingModels: row.pricing_models,
    mediaCount: row.media_count,
    credentialCount: row.credential_count,
    coverUrl: row.cover_url,
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function getAdminProduct(id: number): Promise<Product | null> {
  const { rows } = await query<ProductRow>(
    `SELECT ${PRODUCT_COLUMNS} FROM products p WHERE p.id = $1`,
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  return toProduct(row, await mediaFor(row.id));
}
