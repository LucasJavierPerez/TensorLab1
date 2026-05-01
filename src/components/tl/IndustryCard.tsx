import type { LucideIcon } from "lucide-react";

type Metric = { label: string; value: string; trend?: string };

export function IndustryCard({
  index,
  code,
  title,
  subtitle,
  description,
  image,
  icon: Icon,
  metrics,
  highlight,
  reverse,
  visual,
}: {
  index: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: LucideIcon;
  metrics: Metric[];
  highlight: string;
  reverse?: boolean;
  visual: React.ReactNode;
}) {
  return (
    <section className="relative py-20 md:py-28 border-t border-border/60">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Section header */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-2 flex items-start gap-3">
            <span className="data-tick text-glow">{String(index).padStart(2, "0")}</span>
            <span className="label-tag pt-0.5">{code}</span>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-glow" />
              <span className="label-tag">{subtitle}</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight leading-[1.05]">
              {title}
            </h2>
          </div>
          <div className="col-span-12 md:col-span-3 md:pl-6 md:border-l border-border/60">
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Visual + metrics */}
        <div className={`grid grid-cols-12 gap-6 ${reverse ? "md:[direction:rtl]" : ""}`}>
          <div className="col-span-12 md:col-span-7 [direction:ltr]">
            <div className="relative overflow-hidden rounded-xl border border-border/70 aspect-[16/10] group">
              <img
                src={image}
                alt={title}
                loading="lazy"
                width={1280}
                height={896}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/85 via-background/10 to-transparent" />
              <div className="absolute inset-0 scanline opacity-40 mix-blend-overlay" />

              {/* Floating glass HUD */}
              <div className="absolute left-4 top-4 glass-strong rounded-md px-3 py-2 flex items-center gap-2">
                <span className="pulse-dot" />
                <span className="font-mono-data text-[10px]">{code} · LIVE</span>
              </div>

              <div className="absolute right-4 top-4 glass-strong rounded-md px-3 py-2">
                <div className="label-tag mb-0.5">Highlight</div>
                <div className="font-display text-sm">{highlight}</div>
              </div>

              {/* Bottom data strip */}
              <div className="absolute inset-x-4 bottom-4 glass-strong rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-tag">Telemetry stream · 60s</span>
                  <span className="font-mono-data text-[10px] text-muted-foreground">1,248 nodes</span>
                </div>
                {visual}
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 [direction:ltr] grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="glass rounded-lg p-4">
                <div className="label-tag mb-2">{m.label}</div>
                <div className="font-display text-2xl font-medium">{m.value}</div>
                {m.trend && (
                  <div className="font-mono-data text-[11px] text-glow mt-1">{m.trend}</div>
                )}
              </div>
            ))}
            <div className="col-span-2 glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="label-tag">Performance map</span>
                <span className="data-tick">24 × 6</span>
              </div>
              {/* matrix-like visualization */}
              {visual}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
