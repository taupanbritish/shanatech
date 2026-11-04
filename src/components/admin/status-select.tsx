"use client";

import { useActionState } from "react";
import { initialFormState, type FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

export function StatusSelect({
  action,
  id,
  status,
  options,
  label,
}: {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  id: number;
  status: string;
  options: readonly string[];
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="min-w-[136px]">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        aria-label={label}
        disabled={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={cn(
          "h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[12px] font-medium text-ink transition-colors focus:border-brand-strong focus:outline-none focus:ring-4 focus:ring-brand/10 disabled:opacity-60",
          state.status === "error" && "border-red-300",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {state.status === "error" ? (
        <p role="alert" className="mt-1.5 max-w-[180px] text-[10.5px] leading-snug text-red-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
