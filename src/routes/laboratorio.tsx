import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/tl/Header";
import { Footer } from "@/components/tl/Footer";
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  Database as DbIcon, 
  BarChart as ChartIcon, 
  Activity as TimelineIcon,
  Zap,
  Layout
} from "lucide-react";
import { useState, useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell
} from "recharts";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/laboratorio")({
  head: () => ({
    meta: [
      { title: "Laboratorio Reactivo · TensorLabs" },
      { name: "description", content: "Exploración interactiva de modelos predictivos e impacto industrial." },
    ],
  }),
  component: Laboratorio,
});

// --- Mock Data Generator ---
const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    time: i,
    date: `2024-05-${String(i + 1).padStart(2, "0")}`,
    rinde: 80 + Math.random() * 40 + Math.sin(i * 0.5) * 15,
    cost: 50 + Math.random() * 20,
    efficiency: 90 + Math.random() * 10,
    cluster: Math.floor(Math.random() * 3),
  }));
};

function Laboratorio() {
  const [dataPoints, setDataPoints] = useState([20]);
  const rawData = useMemo(() => generateData(dataPoints[0]), [dataPoints]);
  
  const stats = useMemo(() => {
    const avgRinde = rawData.reduce((acc, curr) => acc + curr.rinde, 0) / rawData.length;
    const maxEff = Math.max(...rawData.map(d => d.efficiency));
    return { avgRinde: avgRinde.toFixed(2), maxEff: maxEff.toFixed(1) };
  }, [rawData]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0d1117] text-foreground transition-colors">
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 py-8 md:py-12 space-y-12">
        {/* Header Cell */}
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-glow">
                <FlaskConical className="h-6 w-6" />
                <h1 className="font-display text-3xl font-medium tracking-tight">Research Environment</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Este es un entorno reactivo que simula la ingesta de datos de campo en tiempo real. 
                Utilizamos este pipeline para validar la precisión de nuestros modelos antes del despliegue en producción.
            </p>
        </div>

        {/* --- Cell 1: Data Ingestion --- */}
        <MarimoCell 
            number={1} 
            code={`import marimo as mo\nimport tensorlabs as tl\n\n# Simular ingesta de sensores industriales\ndata = tl.load_mock_telemetry(n_points=${dataPoints[0]})`}
        >
            <div className="space-y-6">
                <div className="flex flex-col gap-4 max-w-xs">
                    <label className="text-[11px] font-mono-data text-muted-foreground uppercase">Ajustar ventana de datos (N)</label>
                    <Slider 
                        value={dataPoints} 
                        onValueChange={setDataPoints} 
                        max={50} 
                        min={5} 
                        step={1} 
                    />
                    <div className="text-xs font-mono-data">n_points = {dataPoints[0]}</div>
                </div>

                <div className="rounded-lg border border-border/60 overflow-hidden bg-background shadow-sm">
                    <table className="w-full text-[12px] font-mono-data">
                        <thead className="bg-muted/50 border-b border-border/60">
                            <tr className="text-left">
                                <th className="px-3 py-2 font-medium">TIMESTAMP</th>
                                <th className="px-3 py-2 font-medium">RINDE (T/HA)</th>
                                <th className="px-3 py-2 font-medium">EFF (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawData.slice(0, 5).map((d, i) => (
                                <tr key={i} className="border-b border-border/40 last:border-0">
                                    <td className="px-3 py-2 text-muted-foreground">{d.date}</td>
                                    <td className="px-3 py-2 text-glow">{d.rinde.toFixed(2)}</td>
                                    <td className="px-3 py-2">{d.efficiency.toFixed(1)}%</td>
                                </tr>
                            ))}
                            <tr className="bg-muted/20">
                                <td colSpan={3} className="px-3 py-1 text-center text-[10px] text-muted-foreground italic">
                                    ... showing {rawData.length} rows
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </MarimoCell>

        {/* --- Cell 2: Timeline Visualization --- */}
        <MarimoCell 
            number={2} 
            code={`# Visualizar tendencia temporal\nmo.ui.line_chart(data, x="date", y="rinde")`}
        >
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rawData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                        <XAxis 
                            dataKey="date" 
                            fontSize={10} 
                            tickFormatter={(v) => v.split('-')[2]} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid rgba(128,128,128,0.2)', fontSize: '12px' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="rinde" 
                            stroke="var(--glow)" 
                            strokeWidth={2} 
                            dot={{ r: 3, fill: 'var(--glow)' }} 
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </MarimoCell>

        {/* --- Cell 3: Distribution & Correlation --- */}
        <MarimoCell 
            number={3} 
            code={`# Análisis de distribución y clusters\nfig = tl.plot_clusters(data, features=["efficiency", "cost"])`}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="space-y-2">
                    <div className="label-tag">Distribución de Eficiencia</div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rawData}>
                                <XAxis dataKey="time" hide />
                                <Bar dataKey="efficiency" fill="rgba(var(--glow-rgb), 0.4)" radius={[2, 2, 0, 0]}>
                                    {rawData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.efficiency > 95 ? "var(--glow)" : "rgba(var(--glow-rgb), 0.3)"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="label-tag">Correlación Costo/Rinde</div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <XAxis type="number" dataKey="cost" name="Costo" unit="$" fontSize={10} axisLine={false} />
                                <YAxis type="number" dataKey="rinde" name="Rinde" fontSize={10} axisLine={false} />
                                <ZAxis type="number" range={[50, 400]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Operación" data={rawData} fill="var(--glow)" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </MarimoCell>

        {/* --- Cell 4: Conclusion --- */}
        <MarimoCell 
            number={4} 
            code={`# Resumen de KPIs\nmo.md(f"Promedio rinde: **{avg_rinde}**")`}
        >
            <div className="flex flex-wrap gap-8 items-center py-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-glow/10 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-glow" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Rinde Medio</div>
                        <div className="text-2xl font-display font-medium">{stats.avgRinde} T/Ha</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChartIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pico Eficiencia</div>
                        <div className="text-2xl font-display font-medium">{stats.maxEff}%</div>
                    </div>
                </div>

                <div className="ml-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition">
                        Exportar reporte PDF
                    </button>
                </div>
            </div>
        </MarimoCell>

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}

function MarimoCell({ 
    number, 
    code, 
    children 
}: { 
    number: number; 
    code: string; 
    children: React.ReactNode 
}) {
  const [showCode, setShowCode] = useState(true);

  return (
    <div className="group relative flex gap-6 md:gap-8">
      {/* Sidebar area */}
      <div className="flex flex-col items-center pt-2 w-8 shrink-0">
        <div className="text-[10px] font-mono-data text-muted-foreground/50 mb-2">{String(number).padStart(2, '0')}</div>
        <div className="w-[1px] flex-1 bg-border/40 group-hover:bg-glow/40 transition-colors" />
      </div>

      <div className="flex-1 min-w-0 space-y-4 pb-8">
        {/* Code Block */}
        <div className="relative rounded-lg overflow-hidden border border-border/40 bg-[#f1f3f5] dark:bg-[#161b22]">
            <div className="flex items-center justify-between px-4 py-1.5 bg-muted/40 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                    <span className="text-[10px] font-mono-data text-muted-foreground ml-2">python · marimo</span>
                </div>
                <button 
                    onClick={() => setShowCode(!showCode)}
                    className="text-[10px] font-mono-data text-muted-foreground hover:text-foreground transition"
                >
                    {showCode ? "[ Hide Code ]" : "[ Show Code ]"}
                </button>
            </div>
            {showCode && (
                <pre className="p-4 text-[13px] font-mono-data text-foreground/80 overflow-x-auto leading-relaxed">
                    {code.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-muted-foreground/30 select-none w-4">{i + 1}</span>
                            <span>{line}</span>
                        </div>
                    ))}
                </pre>
            )}
        </div>

        {/* Output Area */}
        <div className="px-1">
            {children}
        </div>

        {/* Cell Actions (Float) */}
        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 p-2 transition-opacity">
            <button className="h-7 w-7 grid place-items-center bg-background border border-border rounded shadow-sm hover:bg-muted text-muted-foreground transition" title="Run Cell">
                <Play className="h-3 w-3" />
            </button>
            <button className="h-7 w-7 grid place-items-center bg-background border border-border rounded shadow-sm hover:bg-muted text-muted-foreground transition" title="Restart">
                <RotateCcw className="h-3 w-3" />
            </button>
        </div>
      </div>
    </div>
  );
}
