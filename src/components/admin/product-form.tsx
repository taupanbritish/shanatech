"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/product-actions";
import { FormAlert, FormField, fieldClass } from "@/components/forms/form-ui";
import { initialFormState } from "@/lib/form-state";
import type { Product } from "@/lib/product-queries";
import {
  MAX_DEMO_CREDENTIALS,
  pricingModelDescriptions,
  pricingModels,
  productCategories,
  productStatuses,
  type DemoCredential,
  type PricingModel,
} from "@/lib/products";

type CredentialRow = Required<DemoCredential> & { uid: number };

const toRow = (uid: number, item?: DemoCredential): CredentialRow => ({
  uid,
  role: item?.role ?? "",
  username: item?.username ?? "",
  password: item?.password ?? "",
  note: item?.note ?? "",
});

const nextUid = (rows: CredentialRow[]) => rows.reduce((max, row) => Math.max(max, row.uid), -1) + 1;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-[12.5px] text-muted">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[11px] text-muted">{children}</p>;
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState(saveProduct, initialFormState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  const [models, setModels] = useState<PricingModel[]>(product?.pricingModels ?? []);
  const [credentials, setCredentials] = useState<CredentialRow[]>(() =>
    (product?.demoCredentials ?? []).map((item, index) => toRow(index, item)),
  );

  const updateCredential = (uid: number, field: keyof DemoCredential, value: string) =>
    setCredentials((rows) => rows.map((row) => (row.uid === uid ? { ...row, [field]: value } : row)));

  return (
    <form action={action} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <FormAlert state={state.status === "error" ? state : initialFormState} />

      <Section title="Identitas produk" description="Tampil di katalog /products dan halaman detail.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nama produk" htmlFor="productTitle" error={errors.title}>
            <input
              id="productTitle"
              name="title"
              type="text"
              required
              defaultValue={values.title ?? product?.title}
              placeholder="Contoh: ShanaTech School"
              className={fieldClass(Boolean(errors.title))}
            />
          </FormField>

          <FormField label="Slug URL" htmlFor="productSlug" optional error={errors.slug}>
            <input
              id="productSlug"
              name="slug"
              type="text"
              defaultValue={values.slug ?? product?.slug}
              placeholder="otomatis-dari-nama"
              className={fieldClass(Boolean(errors.slug))}
            />
            <Hint>Dipakai di alamat /products/slug. Mengubahnya akan memutus tautan lama.</Hint>
          </FormField>

          <FormField label="Kategori" htmlFor="productCategory" error={errors.category}>
            <select
              id="productCategory"
              name="category"
              defaultValue={values.category ?? product?.category ?? productCategories[0].value}
              className={fieldClass(Boolean(errors.category))}
            >
              {productCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tagline" htmlFor="productTagline" error={errors.tagline}>
            <input
              id="productTagline"
              name="tagline"
              type="text"
              required
              defaultValue={values.tagline ?? product?.tagline}
              placeholder="Satu kalimat nilai utama produk"
              className={fieldClass(Boolean(errors.tagline))}
            />
          </FormField>

          <FormField
            label="Deskripsi"
            htmlFor="productDescription"
            error={errors.description}
            className="sm:col-span-2"
          >
            <textarea
              id="productDescription"
              name="description"
              rows={6}
              required
              defaultValue={values.description ?? product?.description}
              placeholder="Jelaskan masalah yang diselesaikan, pengguna, dan cara kerja produk."
              className={fieldClass(Boolean(errors.description))}
            />
            <Hint>Pisahkan paragraf dengan baris kosong.</Hint>
          </FormField>

          <FormField label="Fitur utama" htmlFor="productFeatures" error={errors.features}>
            <textarea
              id="productFeatures"
              name="features"
              rows={7}
              required
              defaultValue={values.features ?? product?.features.join("\n")}
              placeholder={"Satu fitur per baris"}
              className={fieldClass(Boolean(errors.features))}
            />
            <Hint>Satu fitur per baris, maksimal 16.</Hint>
          </FormField>

          <FormField label="Teknologi" htmlFor="productTech" error={errors.techStack}>
            <textarea
              id="productTech"
              name="techStack"
              rows={7}
              required
              defaultValue={values.techStack ?? product?.techStack.join("\n")}
              placeholder={"Laravel 13\nFlutter 3.41\nPostgreSQL 18"}
              className={fieldClass(Boolean(errors.techStack))}
            />
            <Hint>Satu teknologi per baris; tampil sebagai badge.</Hint>
          </FormField>
        </div>
      </Section>

      <Section
        title="Skema lisensi"
        description="Pilih skema yang tersedia. Matriks perbandingan di halaman publik hanya menampilkan skema yang dipilih."
      >
        <fieldset>
          <legend className="sr-only">Skema lisensi</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {pricingModels.map((model) => {
              const checked = models.includes(model);
              return (
                <label
                  key={model}
                  className="flex items-start gap-3 rounded-xl border border-line bg-cream/60 p-4 text-[12.5px]"
                >
                  <input
                    type="checkbox"
                    name="pricingModels"
                    value={model}
                    checked={checked}
                    onChange={(event) =>
                      setModels((current) =>
                        event.target.checked
                          ? [...current, model]
                          : current.filter((item) => item !== model),
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-brand-strong"
                  />
                  <span>
                    <span className="block font-semibold text-ink">{model}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                      {pricingModelDescriptions[model]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.pricingModels ? (
            <p className="mt-1.5 text-[11.5px] font-medium text-red-600">{errors.pricingModels}</p>
          ) : null}
        </fieldset>

        <FormField
          label="Catatan harga"
          htmlFor="pricingNote"
          optional
          error={errors.pricingNote}
          className="mt-4"
        >
          <input
            id="pricingNote"
            name="pricingNote"
            type="text"
            defaultValue={values.pricingNote ?? product?.pricingNote ?? ""}
            placeholder="Contoh: Penawaran disesuaikan dengan jumlah pengguna."
            className={fieldClass(Boolean(errors.pricingNote))}
          />
        </FormField>
      </Section>

      <Section
        title="Demo langsung"
        description="Kredensial di bawah ditampilkan PUBLIK dengan tombol salin. Isi hanya akun sandbox demo, jangan akun produksi."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="URL demo" htmlFor="demoUrl" optional error={errors.demoUrl}>
            <input
              id="demoUrl"
              name="demoUrl"
              type="url"
              defaultValue={values.demoUrl ?? product?.demoUrl ?? ""}
              placeholder="https://demo.contoh.id"
              className={fieldClass(Boolean(errors.demoUrl))}
            />
          </FormField>
          <FormField label="Catatan demo" htmlFor="demoNote" optional error={errors.demoNote}>
            <input
              id="demoNote"
              name="demoNote"
              type="text"
              defaultValue={values.demoNote ?? product?.demoNote ?? ""}
              placeholder="Contoh: Data demo direset setiap malam."
              className={fieldClass(Boolean(errors.demoNote))}
            />
          </FormField>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] font-semibold text-ink">
              Akun demo per peran{" "}
              <span className="font-normal text-muted">
                ({credentials.length}/{MAX_DEMO_CREDENTIALS})
              </span>
            </p>
            <button
              type="button"
              disabled={credentials.length >= MAX_DEMO_CREDENTIALS}
              onClick={() => setCredentials((rows) => [...rows, toRow(nextUid(rows))])}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah akun
            </button>
          </div>

          {credentials.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-5 text-center text-[12.5px] text-muted">
              Belum ada akun demo. Halaman publik akan menampilkan catatan demo dan tombol WhatsApp.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {credentials.map((row, index) => (
                <div
                  key={row.uid}
                  className="grid gap-3 rounded-xl border border-line bg-cream/40 p-4 sm:grid-cols-[1fr_1fr_1fr_1.3fr_auto]"
                >
                  {(
                    [
                      ["role", "credRole", "Peran", "Guru"],
                      ["username", "credUsername", "Username", "guru@demo.id"],
                      ["password", "credPassword", "Password", "demo1234"],
                      ["note", "credNote", "Catatan", "opsional"],
                    ] as const
                  ).map(([field, name, label, placeholder]) => (
                    <label key={field} className="block">
                      <span className="mb-1 block text-[11px] font-semibold text-ink/70">
                        {label} #{index + 1}
                      </span>
                      <input
                        name={name}
                        type="text"
                        value={row[field]}
                        onChange={(event) => updateCredential(row.uid, field, event.target.value)}
                        placeholder={placeholder}
                        autoComplete="off"
                        className={fieldClass()}
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setCredentials((rows) => rows.filter((item) => item.uid !== row.uid))
                    }
                    aria-label={`Hapus akun demo #${index + 1}`}
                    className="inline-flex h-[46px] items-center justify-center self-end rounded-xl border border-red-200 bg-red-50 px-3 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.demoCredentials ? (
            <p className="mt-2 text-[11.5px] font-medium text-red-600">{errors.demoCredentials}</p>
          ) : null}
        </div>
      </Section>

      <Section
        title="Studi kasus & dampak"
        description="Opsional. Isi hanya dengan data nyata dari implementasi; bagian ini disembunyikan bila kosong."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Studi kasus" htmlFor="caseStudy" optional error={errors.caseStudy}>
            <textarea
              id="caseStudy"
              name="caseStudy"
              rows={6}
              defaultValue={values.caseStudy ?? product?.caseStudy ?? ""}
              placeholder="Masalah klien, solusi yang diterapkan, dan hasilnya."
              className={fieldClass(Boolean(errors.caseStudy))}
            />
          </FormField>
          <FormField label="Poin dampak" htmlFor="impactPoints" optional error={errors.impactPoints}>
            <textarea
              id="impactPoints"
              name="impactPoints"
              rows={6}
              defaultValue={values.impactPoints ?? product?.impactPoints.join("\n") ?? ""}
              placeholder="Satu poin per baris, maksimal 8."
              className={fieldClass(Boolean(errors.impactPoints))}
            />
          </FormField>
        </div>
      </Section>

      <Section title="Publikasi">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Status" htmlFor="productStatus" error={errors.status}>
            <select
              id="productStatus"
              name="status"
              defaultValue={values.status ?? product?.status ?? "Draf"}
              className={fieldClass(Boolean(errors.status))}
            >
              {productStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Hint>Hanya status Terbit yang tampil publik.</Hint>
          </FormField>

          <FormField label="Urutan tampil" htmlFor="productSort" error={errors.sortOrder}>
            <input
              id="productSort"
              name="sortOrder"
              type="number"
              min={0}
              required
              defaultValue={values.sortOrder ?? product?.sortOrder ?? 0}
              className={fieldClass(Boolean(errors.sortOrder))}
            />
          </FormField>

          <label className="flex items-start gap-3 self-start rounded-xl border border-line bg-cream/60 p-4 text-[12.5px] sm:mt-6">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={
                state.values ? values.featured === "on" : product?.featured
              }
              className="mt-0.5 h-4 w-4 accent-brand-strong"
            />
            <span>
              <span className="block font-semibold text-ink">Produk unggulan</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                Ditampilkan paling depan di katalog.
              </span>
            </span>
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/85 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Menyimpan…" : product ? "Simpan perubahan" : "Buat produk"}
        </button>
        <Link
          href="/admin/produk"
          className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-medium text-ink hover:border-ink/25"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
