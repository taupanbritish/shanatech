const technologies = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "PostgreSQL",
  "Node.js",
  "Flutter",
  "React Native",
  "Figma",
  "AWS",
  "Docker",
  "Python",
];

export function Capabilities() {
  return (
    <section aria-label="Teknologi yang kami gunakan" className="border-b border-line bg-white">
      <div className="shell flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-8">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Kami membangun dengan
        </p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="animate-marquee flex w-max items-center gap-8 hover:[animation-play-state:paused]">
            {[...technologies, ...technologies].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center gap-8 whitespace-nowrap text-[13px] font-medium text-ink/45"
              >
                {item}
                <span className="h-1 w-1 rounded-full bg-brand-strong/40" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
