import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Produk Baru" };

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-ink/10" />
      <div className="h-[640px] animate-pulse rounded-2xl border border-line bg-white" />
    </div>
  );
}

async function NewProductContent() {
  await requireAdminSession();

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
        eyebrow="Produk baru"
        title="Tambahkan produk"
        description="Simpan data produk terlebih dahulu. Galeri gambar dan video bisa ditambahkan setelah produk tersimpan."
      />

      <ProductForm />
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewProductContent />
    </Suspense>
  );
}
