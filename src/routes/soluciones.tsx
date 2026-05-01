import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3, FileText, Bell, Search,
  Database, Cpu, ShieldCheck, ArrowUpRight, ChevronRight, Activity, Zap,
  Sun, Moon, Dna,
} from "lucide-react";
import { AreaSpark, BarMatrix, RadialGauge } from "@/components/tl/MiniChart";
import { useTheme } from "@/components/theme-provider";
import { SideNav } from "@/components/tl/SideNav";
import biotechHero from "@/assets/biotech-hero.jpg";

export const Route = createFileRoute("/soluciones")({
  head: () => ({
    meta: [
      { title: "Panel de Soluciones · TensorLabs" },
      { name: "description", content: "Panel clínico de control: KPIs, modelos activos, telemetría y partners industriales." },
    ],
  }),
  component: Soluciones,
});

const series = (seed: number, n = 60) =>
  Array.from({ length: n }, (_, i) => 50 + Math.sin(i * 0.4 + seed) * 18 + Math.cos(i * 0.21 + seed * 2) * 10 + i * 0.2);

function Soluciones() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex bg-background">
      <SideNav />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border/60 glass-strong flex items-center px-5 gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-[12px] font-mono-data text-muted-foreground">
            <Link to="/" className="hover:text-foreground">TENSORLABS</Link>
            <ChevronRight className="h-3 w-3" />
            <span>SOLUCIONES</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">BIOTECH CORP</span>
          </div>
          <div className="flex-1 max-w-md mx-auto hidden md:flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-card/40">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" placeholder="Buscar partners, modelos, runs…" />
            <kbd className="font-mono-data text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border text-[11px] font-mono-data">
              <span className="pulse-dot" /> <span className="text-muted-foreground">CLUSTER</span> <span className="text-foreground">us-east · primary</span>
            </div>
            <button onClick={toggle} className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-accent/50 transition" aria-label="theme">
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button className="h-8 w-8 grid place-items-center rounded-md border border-border hover:bg-accent/50 transition relative">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive" />
            </button>
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-[var(--glow)] grid place-items-center text-[11px] font-display font-semibold text-background">DR</div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 space-y-5">
          <PartnerHeader />
          <KpiRow />
          <ChartsRow />
          <ProjectsAndLog />
        </main>
      </div>
    </div>
  );
}


function PartnerHeader() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 glass-strong">
      <div className="absolute inset-0 -z-10 opacity-50">
        <img src={biotechHero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent" />
      </div>
      <div className="p-6 md:p-8 grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-[var(--glow)] grid place-items-center">
              <Dna className="h-5 w-5 text-background" />
            </div>
            <div>
              <div className="label-tag">Partner · BIO · 003</div>
              <div className="font-display text-xl font-medium">BioTech Corp</div>
            </div>
            <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border text-[10px] font-mono-data">
              <span className="pulse-dot" /> ACTIVE
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight leading-tight">
            Pipeline de bio-descubrimiento <span className="text-glow italic font-light">en producción</span>.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl">
            42 modelos orquestando docking, plegamiento y síntesis sobre 2.1 B compuestos. Latencia media 11 min por evaluación.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 grid grid-cols-3 gap-3">
          <RadialGauge value={94} label="Eficiencia" />
          <RadialGauge value={87} label="Datos" />
          <RadialGauge value={2} label="Error" />
        </div>
      </div>
    </div>
  );
}

function KpiRow() {
  const kpis = [
    { label: "Eficiencia operativa", value: "94.2%", trend: "+ 2.1%", spark: series(1, 30), icon: Zap },
    { label: "Rendimiento de datos", value: "8.4 GB/s", trend: "+ 12.4%", spark: series(2, 30), icon: Database },
    { label: "Tasa de error", value: "0.041%", trend: "− 18.7%", spark: series(3, 30).map((v) => 100 - v), icon: ShieldCheck },
    { label: "Modelos activos", value: "42 / 48", trend: "6 entrenando", spark: series(4, 30), icon: Cpu },
  ];
  return (
    <div className="grid grid-cols-12 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-3 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <k.icon className="h-3.5 w-3.5 text-glow" />
              <div className="label-tag">{k.label}</div>
            </div>
            <span className="font-mono-data text-[10px] text-glow">{k.trend}</span>
          </div>
          <div className="font-display text-3xl font-medium">{k.value}</div>
          <div className="mt-3">
            <AreaSpark data={k.spark} height={48} showGrid={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartsRow() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-8 glass rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="label-tag mb-1">Tendencia temporal · 7d</div>
            <div className="font-display text-xl">Throughput de inferencia</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono-data">
            {["1H", "24H", "7D", "30D"].map((p) => (
              <button key={p} className={`px-2 py-1 rounded border ${p === "7D" ? "border-glow text-glow" : "border-border text-muted-foreground hover:text-foreground"}`}>{p}</button>
            ))}
          </div>
        </div>
        <AreaSpark data={series(11, 80)} height={220} />
        <div className="mt-4 grid grid-cols-4 gap-3 font-mono-data text-[11px]">
          {[
            ["Pico", "12.8 GB/s"],
            ["Medio", "8.4 GB/s"],
            ["P95", "11.2 GB/s"],
            ["SLA", "99.998%"],
          ].map(([k, v]) => (
            <div key={k} className="border-l border-border pl-3">
              <div className="text-muted-foreground">{k}</div>
              <div className="text-foreground text-sm">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="label-tag">Mapa de calor · nodos</div>
          <span className="data-tick">24 × 6</span>
        </div>
        <BarMatrix rows={6} cols={24} />
        <div className="mt-4 flex items-center justify-between text-[11px] font-mono-data text-muted-foreground">
          <span>00:00</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-border" /> low
            <span className="w-2 h-2 rounded-sm" style={{ background: "color-mix(in oklab, var(--glow) 55%, transparent)" }} /> med
            <span className="w-2 h-2 rounded-sm bg-glow" /> peak
          </span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
}

function ProjectsAndLog() {
  const projects = [
    { id: "BTC-241", name: "Ligand binding · Kinase-X", status: "Running", prog: 78, eta: "01:24:11", lat: "9 ms" },
    { id: "BTC-238", name: "AlphaFold ensemble v3", status: "Queued", prog: 0, eta: "—", lat: "—" },
    { id: "BTC-237", name: "Molecular docking sweep", status: "Running", prog: 52, eta: "03:11:02", lat: "12 ms" },
    { id: "BTC-235", name: "Synthesis route ranker", status: "Done", prog: 100, eta: "—", lat: "8 ms" },
    { id: "BTC-232", name: "Toxicity screening · cohort B", status: "Failed", prog: 41, eta: "—", lat: "—" },
    { id: "BTC-228", name: "Genomic variant calling", status: "Running", prog: 88, eta: "00:18:44", lat: "11 ms" },
  ];
  const statusClr: Record<string, string> = {
    Running: "text-glow border-glow/40",
    Queued: "text-muted-foreground border-border",
    Done: "text-success border-success/40",
    Failed: "text-destructive border-destructive/40",
  };

  const log = [
    ["12:04:21.044", "INFO", "node-018", "Inference batch 4128 → 12.4 ms"],
    ["12:04:18.812", "INFO", "scheduler", "Promoted BTC-237 → tier-1"],
    ["12:04:11.337", "WARN", "node-006", "GPU mem 92% — autoscaling +2"],
    ["12:04:02.118", "INFO", "ingest", "Stream EU-W flush 412 MB"],
    ["12:03:58.901", "INFO", "model:af3", "Checkpoint saved · step 18,420"],
    ["12:03:54.222", "ERR ", "node-021", "OOM on batch 4127 — retried OK"],
    ["12:03:49.014", "INFO", "auth", "Service token rotated · partner=BTC"],
    ["12:03:42.778", "INFO", "telemetry", "P99 latency window: 9.2 ms"],
  ];
  const lvlClr: Record<string, string> = {
    INFO: "text-muted-foreground",
    WARN: "text-warning",
    "ERR ": "text-destructive",
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-7 glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-tag mb-1">Inventario</div>
            <div className="font-display text-xl">Proyectos activos</div>
          </div>
          <button className="inline-flex items-center gap-1.5 text-[12px] font-mono-data text-glow hover:underline">
            Ver todos <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                {["ID", "Proyecto", "Estado", "Progreso", "ETA", "Latencia"].map((h) => (
                  <th key={h} className="label-tag px-3 py-2.5 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} className={`border-t border-border/60 ${i % 2 ? "bg-muted/10" : ""} hover:bg-accent/30 transition`}>
                  <td className="px-3 py-2.5 font-mono-data text-[11px] text-muted-foreground">{p.id}</td>
                  <td className="px-3 py-2.5 text-foreground">{p.name}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono-data ${statusClr[p.status]}`}>
                      {p.status === "Running" && <span className="pulse-dot" />} {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 w-[160px]">
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-[var(--glow)]" style={{ width: `${p.prog}%` }} />
                    </div>
                    <div className="font-mono-data text-[10px] text-muted-foreground mt-1">{p.prog}%</div>
                  </td>
                  <td className="px-3 py-2.5 font-mono-data text-[11px]">{p.eta}</td>
                  <td className="px-3 py-2.5 font-mono-data text-[11px] text-glow">{p.lat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 glass rounded-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-tag mb-1">Telemetría</div>
            <div className="font-display text-xl">Log de actividad</div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-data">
            <span className="pulse-dot" /> <span className="text-muted-foreground">stream</span>
          </span>
        </div>
        <div className="flex-1 rounded-lg border border-border/60 bg-background/60 p-3 font-mono-data text-[11px] leading-relaxed overflow-hidden">
          {log.map(([t, lvl, src, msg]) => (
            <div key={t + msg} className="flex gap-2 py-0.5">
              <span className="text-muted-foreground">{t}</span>
              <span className={lvlClr[lvl] ?? "text-muted-foreground"}>[{lvl}]</span>
              <span className="text-glow">{src}</span>
              <span className="text-foreground/80 truncate">{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
