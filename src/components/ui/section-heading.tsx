import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
            tone === "light" ? "text-brand" : "text-brand-strong",
            align === "center" && "justify-center",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              tone === "light" ? "bg-brand" : "bg-brand-strong",
            )}
          />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl leading-[1.12] font-semibold sm:text-4xl lg:text-[44px]",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 text-[15px] leading-relaxed sm:text-base",
            tone === "light" ? "text-white/65" : "text-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
