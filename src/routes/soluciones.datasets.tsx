import { createFileRoute } from "@tanstack/react-router";
import { Database, Search, Filter, Download, ArrowUpRight, ShieldCheck } from "lucide-react";
import { SideNav, DashboardTopBar } from "@/components/tl/SideNav";
import { AreaSpark } from "@/components/tl/MiniChart";

export const Route = createFileRoute("/soluciones/datasets")({
  head: () => ({
    meta: [
      { title: "Datasets · TensorLabs" },
      { name: "description", content: "Catálogo clínico de datasets industriales: linaje, calidad, frescura y permisos." },
    ],
  }),
  component: Datasets,
});

const series = (seed: number, n = 30) =>
  Array.from({ length: n }, (_, i) => 50 + Math.sin(i * 0.5 + seed) * 16 + Math.cos(i * 0.21 + seed * 2) * 9 + i * 0.2);

const datasets = [
  { id: "DS-AGRO-014", name: "NDVI · Pampa Húmeda 2024-25", domain: "AGRO", rows: "1.24 B", size: "412 GB", quality: 98.7, fresh: "2 min", access: "Restringido", trend: 1 },
  { id: "DS-LIVE-027", name: "Telemetría corporal hato bovino", domain: "LIVE", rows: "84.2 M", size: "61 GB", quality: 96.1, fresh: "12 s", access: "Partner", trend: 2 },
  { id: "DS-BIO-003", name: "Compuestos · ZINC22 enriched", domain: "BIO", rows: "2.10 B", size: "1.8 TB", quality: 99.2, fresh: "1 h", access: "Confidencial", trend: 3 },
  { id: "DS-MFG-041", name: "Vibración · líneas robot K7", domain: "MFG", rows: "318 M", size: "84 GB", quality: 94.4, fresh: "4 s", access: "Interno", trend: 4 },
  { id: "DS-NET-058", name: "Trazas distribuidas edge-fleet", domain: "NET", rows: "8.4 B", size: "2.4 TB", quality: 97.8, fresh: "1 s", access: "Interno", trend: 5 },
  { id: "DS-ENG-072", name: "Inversión sísmica 3D · Cuenca-N", domain: "ENG", rows: "12.1 M", size: "920 GB", quality: 92.3, fresh: "6 h", access: "Confidencial", trend: 6 },
  { id: "DS-AGRO-018", name: "Suelo multiespectral SAR", domain: "AGRO", rows: "412 M", size: "188 GB", quality: 95.6, fresh: "1 h", access: "Restringido", trend: 7 },
  { id: "DS-BIO-009", name: "Cohorte clínica oncología fase II", domain: "BIO", rows: "1.2 M", size: "8 GB", quality: 99.8, fresh: "24 h", access: "Confidencial", trend: 8 },
];

const domainClr: Record<string, string> = {
  AGRO: "text-[#7ee3a0] border-[#7ee3a0]/30",
  LIVE: "text-[#e8c15a] border-[#e8c15a]/30",
  BIO: "text-[#7ec7ff] border-[#7ec7ff]/30",
  MFG: "text-[#ff9a7e] border-[#ff9a7e]/30",
  NET: "text-glow border-glow/40",
  ENG: "text-[#d18cff] border-[#d18cff]/30",
};

function Datasets() {
  const totalRows = "13.4 B";
  const totalSize = "5.9 TB";
  const avgQuality = 96.7;

  return (
    <div className="min-h-screen flex bg-background">
      <SideNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopBar crumbs={["SOLUCIONES", "DATASETS"]} />
        <main className="flex-1 p-5 md:p-7 space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="label-tag mb-1.5">Catálogo · INFRAESTRUCTURA</div>
              <h1 className="font-display text-3xl md:text-4xl tracking-tight">
                Datasets <span className="text-glow italic font-light">activos</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                Linaje verificado, frescura instrumentada, permisos por partner. Ingesta continua desde 1,248 nodos edge.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-card/40 w-72">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" placeholder="Buscar dataset, dominio…" />
              </div>
              <button className="h-9 px-3 rounded-md border border-border hover:bg-accent/50 transition inline-flex items-center gap-1.5 text-[13px]">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </button>
              <button className="h-9 px-3 rounded-md bg-foreground text-background inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-90 transition">
                <Download className="h-3.5 w-3.5" /> Exportar
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-12 gap-4">
            {[
              { label: "Datasets", value: "184", trend: "+ 6 esta semana", icon: Database },
              { label: "Filas totales", value: totalRows, trend: "ingesta 412 K/s" },
              { label: "Volumen", value: totalSize, trend: "+ 84 GB / 24h" },
              { label: "Calidad media", value: `${avgQuality}%`, trend: "σ 0.21", icon: ShieldCheck },
            ].map((k) => (
              <div key={k.label} className="col-span-6 lg:col-span-3 glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="label-tag">{k.label}</div>
                  <span className="font-mono-data text-[10px] text-glow">{k.trend}</span>
                </div>
                <div className="font-display text-3xl">{k.value}</div>
                <div className="mt-3"><AreaSpark data={series(k.label.length)} height={40} showGrid={false} /></div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label-tag mb-1">Inventario</div>
                <div className="font-display text-xl">Datasets registrados</div>
              </div>
              <button className="inline-flex items-center gap-1.5 text-[12px] font-mono-data text-glow hover:underline">
                Ver linaje completo <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm min-w-[860px]">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    {["ID", "Nombre", "Dominio", "Filas", "Volumen", "Calidad", "Frescura", "Acceso"].map((h) => (
                      <th key={h} className="label-tag px-3 py-2.5 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d, i) => (
                    <tr key={d.id} className={`border-t border-border/60 ${i % 2 ? "bg-muted/10" : ""} hover:bg-accent/30 transition`}>
                      <td className="px-3 py-2.5 font-mono-data text-[11px] text-muted-foreground">{d.id}</td>
                      <td className="px-3 py-2.5 text-foreground">{d.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono-data ${domainClr[d.domain]}`}>
                          {d.domain}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono-data text-[11px]">{d.rows}</td>
                      <td className="px-3 py-2.5 font-mono-data text-[11px]">{d.size}</td>
                      <td className="px-3 py-2.5 w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-[var(--glow)]" style={{ width: `${d.quality}%` }} />
                          </div>
                          <span className="font-mono-data text-[10px] text-glow">{d.quality}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono-data text-[11px] text-muted-foreground">{d.fresh}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono-data text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{d.access}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
