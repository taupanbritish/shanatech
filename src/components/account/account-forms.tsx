"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import {
  loginStudent,
  registerStudent,
  requestPasswordReset,
  resetPassword,
} from "@/app/account-actions";
import { PasswordInput } from "@/components/account/password-input";
import { FormField, fieldClass } from "@/components/forms/form-ui";
import { initialFormState, type FormState } from "@/lib/form-state";

function ErrorBanner({ state }: { state: FormState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
    >
      {state.message}
    </div>
  );
}

function SubmitButton({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? busy : idle}
    </button>
  );
}

function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function LoginForm({ next, notice }: { next: string; notice?: ReactNode }) {
  const [state, action, pending] = useActionState(loginStudent, initialFormState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "idle" ? notice : null}
      <ErrorBanner state={state} />
      <input type="hidden" name="next" value={next} />

      <FormField label="Email" htmlFor="loginEmail" error={errors.email}>
        <input
          id="loginEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={values.email}
          placeholder="nama@email.com"
          aria-invalid={Boolean(errors.email) || undefined}
          className={fieldClass(Boolean(errors.email))}
        />
      </FormField>

      <FormField label="Password" htmlFor="loginPassword" error={errors.password}>
        <PasswordInput
          id="loginPassword"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          hasError={Boolean(errors.password)}
        />
      </FormField>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-[12.5px] font-semibold text-brand-strong hover:underline"
        >
          Lupa password?
        </Link>
      </div>

      <SubmitButton pending={pending} idle="Masuk" busy="Memeriksa…" />
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerStudent, initialFormState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <ErrorBanner state={state} />
      <input type="hidden" name="next" value={next} />
      <Honeypot />

      <FormField label="Nama lengkap" htmlFor="registerName" error={errors.fullName}>
        <input
          id="registerName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          defaultValue={values.fullName}
          placeholder="Sesuai nama di sertifikat"
          aria-invalid={Boolean(errors.fullName) || undefined}
          className={fieldClass(Boolean(errors.fullName))}
        />
      </FormField>

      <FormField label="Email" htmlFor="registerEmail" error={errors.email}>
        <input
          id="registerEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={values.email}
          placeholder="nama@email.com"
          aria-invalid={Boolean(errors.email) || undefined}
          className={fieldClass(Boolean(errors.email))}
        />
      </FormField>

      <FormField label="Nomor WhatsApp" htmlFor="registerPhone" optional error={errors.phone}>
        <input
          id="registerPhone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={values.phone}
          placeholder="0812 3456 7890"
          aria-invalid={Boolean(errors.phone) || undefined}
          className={fieldClass(Boolean(errors.phone))}
        />
      </FormField>

      <FormField label="Password" htmlFor="registerPassword" error={errors.password}>
        <PasswordInput
          id="registerPassword"
          name="password"
          required
          autoComplete="new-password"
          placeholder="Minimal 8 karakter, huruf dan angka"
          hasError={Boolean(errors.password)}
        />
      </FormField>

      <FormField label="Ulangi password" htmlFor="registerPasswordConfirm" error={errors.passwordConfirm}>
        <PasswordInput
          id="registerPasswordConfirm"
          name="passwordConfirm"
          required
          autoComplete="new-password"
          placeholder="Ketik ulang password"
          hasError={Boolean(errors.passwordConfirm)}
        />
      </FormField>

      <SubmitButton pending={pending} idle="Buat akun" busy="Membuat akun…" />
      <p className="text-center text-[11.5px] leading-relaxed text-muted">
        Akun dipakai untuk mengikuti kelas online, menyimpan progres belajar, dan menerima
        sertifikat.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13.5px] leading-relaxed text-emerald-900"
      >
        {state.message}
        <p className="mt-3">
          <Link href="/login" className="font-semibold text-emerald-800 underline">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <ErrorBanner state={state} />
      <Honeypot />
      <FormField label="Email akun" htmlFor="forgotEmail" error={errors.email}>
        <input
          id="forgotEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={values.email}
          placeholder="nama@email.com"
          aria-invalid={Boolean(errors.email) || undefined}
          className={fieldClass(Boolean(errors.email))}
        />
      </FormField>
      <SubmitButton pending={pending} idle="Kirim tautan reset" busy="Mengirim…" />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialFormState);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <ErrorBanner state={state} />
      {errors.token ? (
        <p className="-mt-2 mb-2 text-[12.5px]">
          <Link href="/forgot-password" className="font-semibold text-brand-strong hover:underline">
            Minta tautan reset baru
          </Link>
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />

      <FormField label="Password baru" htmlFor="resetPassword" error={errors.password}>
        <PasswordInput
          id="resetPassword"
          name="password"
          required
          autoComplete="new-password"
          placeholder="Minimal 8 karakter, huruf dan angka"
          hasError={Boolean(errors.password)}
        />
      </FormField>

      <FormField label="Ulangi password baru" htmlFor="resetPasswordConfirm" error={errors.passwordConfirm}>
        <PasswordInput
          id="resetPasswordConfirm"
          name="passwordConfirm"
          required
          autoComplete="new-password"
          placeholder="Ketik ulang password baru"
          hasError={Boolean(errors.passwordConfirm)}
        />
      </FormField>

      <SubmitButton pending={pending} idle="Simpan password baru" busy="Menyimpan…" />
    </form>
  );
}
