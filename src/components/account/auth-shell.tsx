import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[460px] w-[460px] rounded-full bg-brand/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-[380px] w-[380px] rounded-full bg-accent/15 blur-[120px]" />
      <div className="shell relative flex justify-center pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="w-full max-w-md">
          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[0_40px_90px_-60px_rgba(0,0,0,0.6)] sm:p-9">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-strong uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-[28px]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
          {footer ? (
            <div className="mt-6 text-center text-[13px] text-white/60">{footer}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function AuthNotice({ tone = "success", children }: { tone?: "success" | "info"; children: ReactNode }) {
  return (
    <div
      role="status"
      className={
        tone === "success"
          ? "mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-800"
          : "mb-5 rounded-xl border border-line bg-cream px-4 py-3 text-[13px] font-medium text-ink/75"
      }
    >
      {children}
    </div>
  );
}
