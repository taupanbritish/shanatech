import { ExternalLink, LayoutGrid, PencilLine, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { deleteProduct } from "@/app/admin/product-actions";
import {
  AdminCard,
  AdminPageHeader,
  EmptyState,
  Notice,
  StatusBadge,
} from "@/components/admin/admin-ui";
import { DeleteForm } from "@/components/admin/delete-form";
import { requireAdminSession } from "@/lib/auth";
import { listAdminProducts } from "@/lib/product-queries";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Produk" };

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-96 animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function ProductsContent({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const params = await searchParams;
  await requireAdminSession();
  const products = await listAdminProducts();
  const published = products.filter((product) => product.status === "Terbit").length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Katalog B2B"
        title="Produk"
        description={`${products.length} produk tersimpan · ${published} terbit di halaman /products.`}
        action={
          <Link
            href="/admin/produk/baru"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white hover:bg-ink/85"
          >
            <Plus className="h-4 w-4" />
            Produk baru
          </Link>
        }
      />

      <Notice notice={params.notice} />

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk pertama agar tampil di katalog /products setelah diterbitkan."
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-cream/60 text-[10px] tracking-[0.12em] text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Produk</th>
                  <th className="px-3 py-3 font-semibold">Kategori</th>
                  <th className="px-3 py-3 font-semibold">Lisensi</th>
                  <th className="px-3 py-3 font-semibold">Media</th>
                  <th className="px-3 py-3 font-semibold">Akun demo</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-line/70 align-top last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand/12 text-brand-strong">
                          {product.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.coverUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <LayoutGrid className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">
                            {product.title}
                            {product.featured ? (
                              <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                Unggulan
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-muted/70">
                            /products/{product.slug}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            Diubah {formatDateTime(product.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-ink">{product.category}</td>
                    <td className="px-3 py-4 text-ink">{product.pricingModels.join(" · ")}</td>
                    <td className="px-3 py-4 text-ink">{product.mediaCount}</td>
                    <td className="px-3 py-4 text-ink">{product.credentialCount}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {product.status === "Terbit" ? (
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Lihat
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/produk/${product.id}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteForm
                          action={deleteProduct}
                          id={product.id}
                          label="Hapus"
                          confirmMessage={`Hapus produk "${product.title}" beserta seluruh medianya? Tindakan ini tidak bisa dibatalkan.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <p className="text-[11.5px] text-muted">
        Gunakan status Arsip untuk menyembunyikan produk dari publik tanpa menghapus data dan
        medianya.
      </p>
    </div>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
