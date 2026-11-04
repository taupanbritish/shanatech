"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitContact } from "@/app/actions";
import { FormAlert, FormField, fieldClass } from "@/components/forms/form-ui";
import { serviceOptions } from "@/lib/content";
import { initialFormState } from "@/lib/form-state";

export function ContactForm() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("service");
  const initialService = serviceOptions.find((option) => option === requested) ?? "";

  return <ContactFormFields key={initialService} initialService={initialService} />;
}

function ContactFormFields({ initialService }: { initialService: string }) {
  const [service, setService] = useState(initialService);
  const [state, formAction, pending] = useActionState(submitContact, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">
          Formulir kontak
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Ceritakan kebutuhan Anda.</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Semakin jelas konteksnya, semakin tepat saran kami. Konsultasi awal 30 menit tidak
          dikenakan biaya.
        </p>
      </div>

      <FormAlert state={state} />

      <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <FormField label="Nama" htmlFor="contactName" error={errors.name}>
          <input
            id="contactName"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Nama Anda"
            className={fieldClass(Boolean(errors.name))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contactName-error" : undefined}
          />
        </FormField>

        <FormField label="Email" htmlFor="contactEmail" error={errors.email}>
          <input
            id="contactEmail"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@perusahaan.com"
            className={fieldClass(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contactEmail-error" : undefined}
          />
        </FormField>

        <FormField
          label="Nomor telepon / WhatsApp"
          htmlFor="contactPhone"
          optional
          error={errors.phone}
        >
          <input
            id="contactPhone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            className={fieldClass(Boolean(errors.phone))}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contactPhone-error" : undefined}
          />
        </FormField>

        <FormField label="Perusahaan" htmlFor="company" optional error={errors.company}>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Nama perusahaan atau instansi"
            className={fieldClass(Boolean(errors.company))}
          />
        </FormField>

        <FormField
          label="Kebutuhan Anda"
          htmlFor="service"
          error={errors.service}
          className="sm:col-span-2"
        >
          <select
            id="service"
            name="service"
            required
            value={service}
            onChange={(event) => setService(event.target.value)}
            className={fieldClass(Boolean(errors.service))}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? "service-error" : undefined}
          >
            <option value="">Pilih kategori kebutuhan</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Pesan" htmlFor="message" error={errors.message} className="sm:col-span-2">
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Ceritakan tujuan, kendala, atau target waktu yang Anda bayangkan."
            className={fieldClass(Boolean(errors.message))}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
        </FormField>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-navy transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim pesan…
              </>
            ) : (
              <>
                Kirim pesan
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Dengan mengirim formulir, Anda menyetujui data digunakan untuk menindaklanjuti
            kebutuhan ini. Kami tidak membagikan data Anda ke pihak lain.
          </p>
        </div>
      </form>
    </div>
  );
}
