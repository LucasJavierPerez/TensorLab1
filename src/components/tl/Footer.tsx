import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ArrowUpRight } from "lucide-react";

const cols: { title: string; items: { label: string; to?: "/" | "/soluciones" | "/contacto" | "/soluciones/datasets" | "/soluciones/telemetria" }[] }[] = [
  {
    title: "Ecosistemas",
    items: [
      { label: "Agricultura · AGRO" },
      { label: "Ganadería · LIVE" },
      { label: "Medicina · BIO" },
      { label: "Manufactura 4.0 · MFG" },
      { label: "Tecnología · NET" },
      { label: "Oil & Gas · ENG" },
    ],
  },
  {
    title: "Plataforma",
    items: [
      { label: "Panel de soluciones", to: "/soluciones" },
      { label: "Datasets", to: "/soluciones/datasets" },
      { label: "Telemetría", to: "/soluciones/telemetria" },
      { label: "Contacto", to: "/contacto" },
      { label: "API · SDK" },
    ],
  },
  {
    title: "Investigación",
    items: [
      { label: "Manifiesto técnico" },
      { label: "Whitepapers" },
      { label: "Casos de estudio" },
      { label: "Trust & Compliance" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 mt-20">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4 space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Inteligencia de precisión para sectores donde el margen de error es cero.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full glass text-[11px] font-mono-data">
              <span className="pulse-dot" />
              <span className="text-muted-foreground">CLINICAL PRECISION</span>
              <span className="text-foreground">v1.0</span>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="col-span-6 md:col-span-2 space-y-3">
              <div className="label-tag">{c.title}</div>
              <ul className="space-y-2 text-sm">
                {c.items.map((it) =>
                  it.to ? (
                    <li key={it.label}>
                      <Link to={it.to} className="text-foreground/80 hover:text-glow transition inline-flex items-center gap-1">
                        {it.label} <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ) : (
                    <li key={it.label} className="text-muted-foreground hover:text-foreground/90 transition cursor-default">
                      {it.label}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
          <div className="col-span-12 md:col-span-2 space-y-3">
            <div className="label-tag">Estado</div>
            <div className="font-mono-data text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between"><span>Latencia P50</span><span className="text-foreground">12 ms</span></div>
              <div className="flex justify-between"><span>Uptime 30d</span><span className="text-glow">99.998%</span></div>
              <div className="flex justify-between"><span>Nodos</span><span className="text-foreground">1,248</span></div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] font-mono-data text-muted-foreground">
          <div>© 2026 TENSORLABS · INSTRUMENT-GRADE INTELLIGENCE</div>
          <div className="flex gap-6">
            <span>SOC2 · ISO 27001</span>
            <span>BUILD 2026.05.01-α</span>
            <span>STO · BUE · MAD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
