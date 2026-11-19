import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminPageHeader, Notice, StatusBadge } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { ProductMediaManager } from "@/components/admin/product-media-manager";
import { requireAdminSession } from "@/lib/auth";
import { getAdminProduct } from "@/lib/product-queries";
import { isStorageConfigured } from "@/lib/storage";

export const metadata: Metadata = { title: "Edit Produk" };

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-80 animate-pulse rounded-2xl border border-line bg-white" />
      <div className="h-[640px] animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function EditProductContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ id }, { notice }] = await Promise.all([params, searchParams]);
  const productId = Number(id);

  await requireAdminSession();
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const product = await getAdminProduct(productId);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/produk"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar produk
      </Link>

      <AdminPageHeader
        eyebrow={product.category}
        title={product.title}
        description="Perubahan tersinkron ke halaman /products setelah disimpan."
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={product.status} />
            {product.status === "Terbit" ? (
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[12.5px] font-semibold text-ink hover:border-ink/25"
              >
                <ExternalLink className="h-4 w-4" />
                Lihat halaman publik
              </Link>
            ) : null}
          </div>
        }
      />

      <Notice notice={notice} />

      <ProductMediaManager
        productId={product.id}
        media={product.media}
        storageReady={isStorageConfigured()}
      />

      <ProductForm key={product.updatedAt} product={product} />
    </div>
  );
}

export default function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditProductContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
