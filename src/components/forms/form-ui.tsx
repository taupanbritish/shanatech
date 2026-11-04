import { CheckCircle2, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 transition-colors focus:border-brand-strong focus:outline-none focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted";

export function fieldClass(hasError?: boolean) {
  return cn(inputClass, hasError && "border-red-400 focus:border-red-500 focus:ring-red-100");
}

export function FormField({
  label,
  htmlFor,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-ink">
          {label}
        </label>
        {optional ? <span className="text-[10.5px] text-muted">opsional</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[11.5px] font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.status === "idle") return null;

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold">Terkirim.</p>
          <p className="mt-0.5 text-emerald-800">{state.message}</p>
          {state.reference ? (
            <p className="mt-2 text-[11px] font-semibold tracking-wide text-emerald-700">
              Nomor referensi: <span className="font-mono">{state.reference}</span>
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
    >
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div className="text-sm leading-relaxed">
        <p className="font-semibold">Belum bisa diproses.</p>
        <p className="mt-0.5 text-red-800">{state.message}</p>
      </div>
    </div>
  );
}
