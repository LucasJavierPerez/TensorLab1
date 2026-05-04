import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Activity, ShieldCheck, Database, Zap, Cpu } from "lucide-react";
import { Header } from "@/components/tl/Header";
import { Footer } from "@/components/tl/Footer";
import { AreaSpark, BarMatrix, RadialGauge } from "@/components/tl/MiniChart";

import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

// Generador de datos para los mini-gráficos
const series = (seed: number, n = 40) =>
  Array.from({ length: n }, (_, i) => 
    50 + Math.sin(i * 0.6 + seed) * 18 + Math.sin(i * 0.21 + seed * 2) * 12 + i * 0.3
  );

function Index() {
  return (
    <div className="min-h-screen bg-atmosphere">
      <Header />
      <Hero />
      <Pillars />
      <GlobalKpis />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img 
          src={heroBg} 
          alt="Background Industrial" 
          className="absolute inset-0 h-full w-full object-cover opacity-70" 
          width={1920} 
          height={1080} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Barra de estado superior */}
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 md:col-span-7 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-strong text-[11px] font-mono-data">
              <span className="pulse-dot" />
              <span className="text-muted-foreground uppercase">Estado del sistema</span>
              <span className="text-glow">ACTIVO · NOMINAL</span>
            </div>
            <span className="hidden md:inline data-tick">02.001 · CLINICAL PRECISION v1.0</span>
          </div>
          <div className="col-span-12 md:col-span-5 flex md:justify-end items-center gap-6 font-mono-data text-[11px] text-muted-foreground">
            <span>LAT 12 ms</span><span>NODES 1,248</span><span>SR 99.998%</span>
          </div>
        </div>

        {/* Headline Principal */}
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-9">
            <div className="label-tag mb-4">— Inteligencia de precisión industrial</div>
            <h1 className="font-display text-[44px] sm:text-6xl md:text-[88px] leading-[0.95] tracking-tight font-medium">
                 Precisión predictiva de grado industrial: 
                <span className="italic font-bold text-glow-green block mt-2">
                  transformamos datos en certezas.
                </span>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-3 md:pl-6 md:border-l border-border/60">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Analizamos sus datos operativos para diseñar modelos predictivos que eliminan la incertidumbre y maximizan su rinde.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/contacto" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition">
                Solicitar demo <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/laboratorio" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border glass text-[13px] hover:bg-accent/40 transition">
                Ver ecosistemas
              </Link>
            </div>
          </div>
        </div>

        {/* HUD Widgets */}
        <div className="mt-14 grid grid-cols-12 gap-3" id="ecosistemas">
          <div className="col-span-12 md:col-span-5 glass-strong rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label-tag mb-1">Telemetría global · 24h</div>
                <div className="font-display text-2xl">Throughput de cómputo</div>
              </div>
              <div className="text-right">
                <div className="font-mono-data text-[11px] text-glow">+ 12.4%</div>
                <div className="font-display text-xl">8.4 <span className="text-xs text-muted-foreground">GB/s</span></div>
              </div>
            </div>
            <AreaSpark data={series(99, 60)} height={120} />
          </div>

          <div className="col-span-6 md:col-span-3 glass-strong rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="label-tag mb-1">Carga distribuida</div>
              <div className="font-display text-2xl">Mapa de nodos</div>
            </div>
            <BarMatrix rows={5} cols={16} className="mt-4" />
          </div>

          <div className="col-span-6 md:col-span-2 glass-strong rounded-xl p-5 flex flex-col items-center justify-center">
            <RadialGauge value={94} label="Confianza modelo" size={108} />
          </div>

          <div className="col-span-12 md:col-span-2 glass-strong rounded-xl p-5 flex flex-col justify-between">
            <div className="label-tag mb-1">Eventos</div>
            <ul className="mt-3 space-y-1.5 font-mono-data text-[10px]">
              {[
                ["12:04:21", "MFG · OEE +0.4%"],
                ["12:04:18", "AGRO · NDVI sync"],
                ["12:04:11", "BIO · 412 hits"],
              ].map(([t, m]) => (
                <li key={t} className="flex justify-between gap-2 text-muted-foreground">
                  <span>{t}</span><span className="text-foreground truncate">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Logo ticker infinito */}
      <div className="border-y border-border/60 py-4 overflow-hidden">
        <div className="flex w-max ticker-track gap-12 whitespace-nowrap font-mono-data text-[11px] text-muted-foreground">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 px-6">
              {["NORDIA AGRO", "PAMPA LIVESTOCK", "BIOTECH CORP", "AURORA ROBOTICS", "MERIDIAN ENERGY"].map((b) => (
                <span key={b} className="tracking-[0.25em]">◆ {b}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    { icon: Database, k: "01", t: "Análisis de Alta Resolución", d: "Transformamos el ruido de sus sensores en datos estructurados." },
    { icon: Zap, k: "02", t: "Modelado Predictivo Dinámico", d: "Sistemas que aprenden y se ajustan en tiempo real." },
    { icon: ShieldCheck, k: "03", t: "Integración de Precisión", d: "Conectamos nuestra inteligencia con su infraestructura actual." },
  ];
  return (
    <section className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-[1400px] px-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <div className="label-tag mb-3">— El método TensorLabs</div>
          <h3 className="font-display text-3xl tracking-tight">Su operación genera datos. Nosotros, rentabilidad.</h3>
        </div>
        {items.map((it) => (
          <div key={it.k} className="col-span-12 md:col-span-3 glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <it.icon className="h-4 w-4 text-glow" />
              <span className="data-tick">{it.k}</span>
            </div>
            <div className="font-display text-lg mb-2">{it.t}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GlobalKpis() {
  const stats = [
    { label: "Precisión", value: "98.9%", trend: "grado instrumental", icon: ShieldCheck, seed: 10 },
    { label: "Eventos", value: "+500M", trend: "real-time", icon: Activity, seed: 20 },
    { label: "ROI", value: "+24%", trend: "promedio anual", icon: Zap, seed: 30 },
    { label: "Uptime", value: "99.99%", trend: "SLA", icon: Cpu, seed: 40 },
  ];

  return (
    <section className="py-12 border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-3.5 w-3.5 text-glow" />
                <span className="label-tag">{s.label}</span>
              </div>
              <div className="font-display text-4xl md:text-5xl font-medium tracking-tight">{s.value}</div>
              <div className="mt-3 h-8">
                <AreaSpark data={series(s.seed, 20)} height={32} showGrid={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative border-t border-border/60 py-24 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 text-center">
        <div className="label-tag mb-4 mx-auto w-fit">— Evaluación estratégica</div>
        <h3 className="font-display text-4xl md:text-6xl tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Transforme su incertidumbre en una <span className="text-glow italic font-light">ventaja competitiva</span>.
        </h3>
        <div className="mt-8">
          <Link to="/contacto" className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition">
            Solicitar demo <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}