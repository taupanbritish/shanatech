"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { initialFormState, type FormState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

export function DeleteForm({
  action,
  id,
  label,
  confirmMessage,
  className,
}: {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  id: number;
  label: string;
  confirmMessage: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className={className}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60",
        )}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        {label}
      </button>
      {state.status === "error" ? (
        <p role="alert" className="mt-1.5 max-w-[260px] text-[10.5px] leading-snug text-red-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
