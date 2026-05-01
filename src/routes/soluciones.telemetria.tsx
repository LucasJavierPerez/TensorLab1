import { createFileRoute } from "@tanstack/react-router";
import { Activity, Zap, ShieldCheck, Cpu } from "lucide-react";
import { SideNav, DashboardTopBar } from "@/components/tl/SideNav";
import { AreaSpark, BarMatrix, RadialGauge } from "@/components/tl/MiniChart";

export const Route = createFileRoute("/soluciones/telemetria")({
  head: () => ({
    meta: [
      { title: "Telemetría · TensorLabs" },
      { name: "description", content: "Telemetría en tiempo real: latencia, throughput, saturación de nodos y eventos del cluster." },
    ],
  }),
  component: Telemetria,
});

const series = (seed: number, n = 80) =>
  Array.from({ length: n }, (_, i) => 50 + Math.sin(i * 0.4 + seed) * 18 + Math.cos(i * 0.21 + seed * 2) * 10 + i * 0.15);

const nodes = [
  { id: "node-001", region: "us-east", role: "primary", cpu: 62, gpu: 88, mem: 48, lat: 9, status: "OK" },
  { id: "node-006", region: "us-east", role: "worker", cpu: 81, gpu: 92, mem: 76, lat: 11, status: "WARN" },
  { id: "node-018", region: "eu-west", role: "worker", cpu: 44, gpu: 71, mem: 38, lat: 12, status: "OK" },
  { id: "node-021", region: "eu-west", role: "worker", cpu: 90, gpu: 84, mem: 88, lat: 18, status: "ERR" },
  { id: "node-034", region: "ap-south", role: "worker", cpu: 51, gpu: 68, mem: 41, lat: 14, status: "OK" },
  { id: "node-052", region: "sa-east", role: "edge", cpu: 38, gpu: 0, mem: 22, lat: 7, status: "OK" },
];

const events = [
  ["12:04:21.044", "INFO", "node-018", "Inference batch 4128 → 12.4 ms"],
  ["12:04:18.812", "INFO", "scheduler", "Promoted BTC-237 → tier-1"],
  ["12:04:11.337", "WARN", "node-006", "GPU mem 92% — autoscaling +2"],
  ["12:04:02.118", "INFO", "ingest", "Stream EU-W flush 412 MB"],
  ["12:03:58.901", "INFO", "model:af3", "Checkpoint saved · step 18,420"],
  ["12:03:54.222", "ERR ", "node-021", "OOM on batch 4127 — retried OK"],
  ["12:03:49.014", "INFO", "auth", "Service token rotated"],
  ["12:03:42.778", "INFO", "telemetry", "P99 latency window: 9.2 ms"],
  ["12:03:31.011", "INFO", "node-001", "Heartbeat 1Hz · pulse OK"],
  ["12:03:24.555", "WARN", "ingest", "Backpressure 12% on EU-W"],
];
const lvlClr: Record<string, string> = {
  INFO: "text-muted-foreground",
  WARN: "text-warning",
  "ERR ": "text-destructive",
};
const statusClr: Record<string, string> = {
  OK: "text-glow border-glow/40",
  WARN: "text-warning border-warning/40",
  ERR: "text-destructive border-destructive/40",
};

function Telemetria() {
  return (
    <div className="min-h-screen flex bg-background">
      <SideNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopBar crumbs={["SOLUCIONES", "TELEMETRÍA"]} />
        <main className="flex-1 p-5 md:p-7 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="label-tag mb-1.5">Cluster · LIVE</div>
              <h1 className="font-display text-3xl md:text-4xl tracking-tight">
                Telemetría <span className="text-glow italic font-light">en tiempo real</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                1,248 nodos · 6 regiones · ventana deslizante 24h. Ingesta de eventos a 412 K/s.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong text-[11px] font-mono-data">
              <span className="pulse-dot" />
              <span className="text-muted-foreground">STREAM</span>
              <span className="text-foreground">412,884 ev/s</span>
            </div>
          </div>

          {/* Top metrics */}
          <div className="grid grid-cols-12 gap-4">
            {[
              { label: "Latencia P50", value: "12 ms", trend: "− 0.4 ms", icon: Zap },
              { label: "Throughput", value: "8.4 GB/s", trend: "+ 12.4%", icon: Activity },
              { label: "Uptime 30d", value: "99.998%", trend: "SLA OK", icon: ShieldCheck },
              { label: "Carga GPU", value: "82%", trend: "saturación media", icon: Cpu },
            ].map((k) => (
              <div key={k.label} className="col-span-6 lg:col-span-3 glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <k.icon className="h-3.5 w-3.5 text-glow" />
                    <div className="label-tag">{k.label}</div>
                  </div>
                  <span className="font-mono-data text-[10px] text-glow">{k.trend}</span>
                </div>
                <div className="font-display text-3xl">{k.value}</div>
                <div className="mt-3"><AreaSpark data={series(k.label.length, 40)} height={42} showGrid={false} /></div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8 glass rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="label-tag mb-1">Latencia P99 · 1h</div>
                  <div className="font-display text-xl">Distribución temporal</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono-data">
                  {["1H", "24H", "7D"].map((p) => (
                    <button key={p} className={`px-2 py-1 rounded border ${p === "1H" ? "border-glow text-glow" : "border-border text-muted-foreground hover:text-foreground"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <AreaSpark data={series(33, 100)} height={220} />
            </div>
            <div className="col-span-12 lg:col-span-4 glass rounded-xl p-5 flex flex-col gap-4">
              <div>
                <div className="label-tag mb-1">Saturación nodos · 24×6</div>
                <div className="font-display text-xl">Mapa de calor</div>
              </div>
              <BarMatrix rows={6} cols={24} />
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/60">
                <RadialGauge value={88} label="GPU" size={72} />
                <RadialGauge value={62} label="CPU" size={72} />
                <RadialGauge value={48} label="MEM" size={72} />
              </div>
            </div>
          </div>

          {/* Nodes + log */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7 glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="label-tag mb-1">Inventario</div>
                  <div className="font-display text-xl">Nodos del cluster</div>
                </div>
                <span className="font-mono-data text-[11px] text-muted-foreground">{nodes.length} de 1,248</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      {["ID", "Región", "Rol", "CPU", "GPU", "MEM", "Lat", "Estado"].map((h) => (
                        <th key={h} className="label-tag px-3 py-2.5 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((n, i) => (
                      <tr key={n.id} className={`border-t border-border/60 ${i % 2 ? "bg-muted/10" : ""} hover:bg-accent/30 transition`}>
                        <td className="px-3 py-2.5 font-mono-data text-[11px] text-foreground">{n.id}</td>
                        <td className="px-3 py-2.5 font-mono-data text-[11px] text-muted-foreground">{n.region}</td>
                        <td className="px-3 py-2.5 font-mono-data text-[11px]">{n.role}</td>
                        <td className="px-3 py-2.5 font-mono-data text-[11px]">{n.cpu}%</td>
                        <td className="px-3 py-2.5 font-mono-data text-[11px] text-glow">{n.gpu}%</td>
                        <td className="px-3 py-2.5 font-mono-data text-[11px]">{n.mem}%</td>
                        <td className="px-3 py-2.5 font-mono-data text-[11px]">{n.lat} ms</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono-data ${statusClr[n.status]}`}>
                            {n.status === "OK" && <span className="pulse-dot" />} {n.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 glass rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="label-tag mb-1">Eventos · stream</div>
                  <div className="font-display text-xl">Log en vivo</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-data">
                  <span className="pulse-dot" /> <span className="text-muted-foreground">tail -f</span>
                </span>
              </div>
              <div className="flex-1 rounded-lg border border-border/60 bg-background/60 p-3 font-mono-data text-[11px] leading-relaxed">
                {events.map(([t, lvl, src, msg]) => (
                  <div key={t + msg} className="flex gap-2 py-0.5">
                    <span className="text-muted-foreground">{t}</span>
                    <span className={lvlClr[lvl] ?? "text-muted-foreground"}>[{lvl}]</span>
                    <span className="text-glow">{src}</span>
                    <span className="text-foreground/90 truncate">{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
