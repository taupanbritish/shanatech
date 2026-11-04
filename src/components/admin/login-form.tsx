"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/admin/actions";
import { FormField, fieldClass } from "@/components/forms/form-ui";
import { initialFormState } from "@/lib/form-state";

export function AdminLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAdmin, initialFormState);
  const [email, setEmail] = useState("");
  const errors = state.errors ?? {};

  return (
    <form
      action={action}
      className="mt-7 space-y-4"
      aria-describedby={state.status === "error" ? "login-error" : undefined}
    >
      <input type="hidden" name="next" value={next} />

      {state.status === "error" ? (
        <div
          id="login-error"
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
        >
          {state.message}
        </div>
      ) : null}

      <FormField label="Email admin" htmlFor="adminEmail" error={errors.email}>
        <input
          id="adminEmail"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          placeholder="admin@shanatech.id"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass(Boolean(errors.email))}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>

      <FormField label="Password" htmlFor="adminPassword" error={errors.password}>
        <input
          id="adminPassword"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={fieldClass(Boolean(errors.password))}
          aria-invalid={Boolean(errors.password)}
        />
      </FormField>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memeriksa…
          </>
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" />
            Masuk ke panel
          </>
        )}
      </button>

      <p className="pt-1 text-center text-[11.5px] leading-relaxed text-muted">
        Sesi berlaku 8 jam. Hubungi pengelola sistem jika Anda tidak memiliki akses.
      </p>
    </form>
  );
}
