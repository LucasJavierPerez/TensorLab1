import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/tl/Header";
import { FlaskConical, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/laboratorio")({
  head: () => ({
    meta: [
      { title: "Laboratorio Reactivo · TensorLabs" },
      { name: "description", content: "Exploración interactiva de modelos predictivos e impacto industrial." },
    ],
  }),
  component: Laboratorio,
});

const NOTEBOOK_EXAMPLES = [
  {
    file: "01_sanidad_vegetal_mip.html",
    title: "Sanidad Vegetal y MIP",
    description: "Manejo integrado de plagas y modelos de umbral económico.",
    tags: ["Agronomía", "MIP"],
  },
  {
    file: "modulo_2_nutricion.html",
    title: "Nutrición Animal",
    description: "Balance de raciones y requerimientos nutricionales por categoría.",
    tags: ["Ganadería", "Nutrición"],
  },
  {
    file: "modulo_1_produccion_leche.html",
    title: "Producción de Leche",
    description: "Curvas de lactancia y proyección de producción individual.",
    tags: ["Lechería", "Proyección"],
  },
  {
    file: "10_economia_agraria.html",
    title: "Economía Agraria y Decisiones",
    description: "Márgenes brutos y toma de decisiones bajo incertidumbre.",
    tags: ["Economía", "Gestión"],
  },
];

function Laboratorio() {
  const [selected, setSelected] = useState(NOTEBOOK_EXAMPLES[0]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-[#0d1117] text-foreground transition-colors">
      <Header />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-border/50 bg-background flex flex-col">
          <div className="px-4 py-5 border-b border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-glow">
              <FlaskConical className="h-4 w-4" />
              <span className="text-sm font-medium">Research Lab</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seleccioná un notebook para explorarlo en pantalla completa.
            </p>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {NOTEBOOK_EXAMPLES.map((nb) => {
              const isActive = selected.file === nb.file;
              return (
                <button
                  key={nb.file}
                  onClick={() => setSelected(nb)}
                  className={[
                    "w-full text-left px-3 py-3 rounded-lg transition-all duration-150 border",
                    isActive
                      ? "bg-glow/10 border-glow/20"
                      : "border-transparent hover:bg-muted/50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={["text-sm font-medium leading-snug", isActive ? "text-glow" : ""].join(" ")}>
                      {nb.title}
                    </span>
                    <ChevronRight
                      className={[
                        "h-3.5 w-3.5 shrink-0 mt-0.5 transition-transform",
                        isActive ? "text-glow rotate-90" : "text-muted-foreground/30",
                      ].join(" ")}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{nb.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {nb.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-3 border-t border-border/50">
            <span className="text-[10px] font-mono-data text-muted-foreground/40 uppercase tracking-widest">
              python · marimo
            </span>
          </div>
        </aside>

        {/* Iframe panel */}
        <main className="flex-1 overflow-hidden bg-background">
          <iframe
            key={selected.file}
            src={`/notebooks/${selected.file}`}
            className="w-full h-full border-0"
            title={selected.title}
          />
        </main>
      </div>

      <footer className="shrink-0 border-t border-border/50 px-6 py-2.5 flex items-center justify-between bg-background">
        <span className="text-[10px] font-mono-data text-muted-foreground/50 uppercase tracking-widest">
          © 2026 TensorLabs
        </span>
        <div className="flex items-center gap-4 text-[10px] font-mono-data text-muted-foreground/40">
          <span>Uptime 99.998%</span>
          <span>python · marimo</span>
        </div>
      </footer>
    </div>
  );
}
