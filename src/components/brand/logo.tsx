import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span
        className={cn(
          "font-display text-[19px] leading-none tracking-[0.01em]",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        <span className="font-bold">SHANA</span>
        <span className="font-light">TECH</span>
        <span className="text-brand">.</span>
      </span>
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="shanatech-mark" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0" stopColor="#18c8e8" />
          <stop offset="1" stopColor="#6d5df6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#shanatech-mark)" />
      <path
        d="M26.6 13.2c-1.7-1.6-3.8-2.4-6.2-2.2-3.6.3-6.2 2.6-6.2 5.4 0 3.4 3.7 4.2 6.7 4.9 3 .7 4.6 1.8 4.6 4 0 2.6-2.6 4.6-5.9 4.6-2.5 0-4.7-1-6.2-2.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <circle cx="13.4" cy="13.6" r="2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
