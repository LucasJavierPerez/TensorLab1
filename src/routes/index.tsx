import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sprout, Beef, Dna, Cpu, Network, Flame, Activity, ShieldCheck } from "lucide-react";
import { Header } from "@/components/tl/Header";
import { Footer } from "@/components/tl/Footer";
import { IndustryCard } from "@/components/tl/IndustryCard";
import { AreaSpark, BarMatrix, RadialGauge } from "@/components/tl/MiniChart";

import heroBg from "@/assets/hero-bg.jpg";
import indAgro from "@/assets/ind-agro.jpg";
import indGanaderia from "@/assets/ind-ganaderia.jpg";
import indMedicina from "@/assets/ind-medicina.jpg";
import indManufactura from "@/assets/ind-manufactura.jpg";
import indTech from "@/assets/ind-tech.jpg";
import indOil from "@/assets/ind-oil.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const series = (seed: number, n = 40) =>
  Array.from({ length: n }, (_, i) => 50 + Math.sin(i * 0.6 + seed) * 18 + Math.sin(i * 0.21 + seed * 2) * 12 + i * 0.3);

function Index() {
  return (
    <div className="min-h-screen bg-atmosphere">
      <Header />
      <Hero />
      <Pillars />

      <IndustryCard
        index={1}
        code="AGRO · 014"
        title="Predicción agronómica con resolución sub-parcela."
        subtitle="Agricultura de precisión"
        description="Modelos multiespectrales que integran clima, NDVI y suelo para optimizar rendimiento y agua por píxel de cultivo."
        image={indAgro}
        icon={Sprout}
        highlight="+ 23.4% rendimiento"
        metrics={[
          { label: "Hectáreas", value: "1.24 M", trend: "↑ 8.1% YoY" },
          { label: "Modelos activos", value: "42" },
          { label: "Precisión NDVI", value: "98.7%", trend: "σ 0.14" },
          { label: "Ahorro hídrico", value: "31%" },
        ]}
        visual={<AreaSpark data={series(1)} height={64} />}
      />

      <IndustryCard
        index={2}
        code="LIVE · 027"
        title="Bienestar y trazabilidad ganadera en tiempo real."
        subtitle="Ganadería inteligente"
        description="Visión por computadora y sensores corporales para detectar patología, celo y eficiencia alimentaria a escala de hato."
        image={indGanaderia}
        icon={Beef}
        highlight="Detección 14d antes"
        reverse
        metrics={[
          { label: "Cabezas", value: "84,210" },
          { label: "Eventos/día", value: "12.4 M" },
          { label: "Mortandad", value: "↓ 41%", trend: "vs. 2024" },
          { label: "Conversión", value: "1:6.2" },
        ]}
        visual={<AreaSpark data={series(2)} height={64} />}
      />

      <IndustryCard
        index={3}
        code="BIO · 003"
        title="Bio-descubrimiento molecular acelerado por ML."
        subtitle="Medicina computacional"
        description="Pipelines de plegamiento, docking y síntesis asistida que comprimen ciclos de descubrimiento de meses a horas."
        image={indMedicina}
        icon={Dna}
        highlight="3.8M moléculas/h"
        metrics={[
          { label: "Compuestos", value: "2.1 B" },
          { label: "Hit rate", value: "0.041%" },
          { label: "Confianza", value: "94.6%", trend: "AUROC" },
          { label: "Tiempo medio", value: "11 min" },
        ]}
        visual={<AreaSpark data={series(3)} height={64} />}
      />

      <IndustryCard
        index={4}
        code="MFG · 041"
        title="BIM estructural y gemelo digital de planta."
        subtitle="Manufactura 4.0"
        description="Simulación física en tiempo real de líneas robotizadas, mantenimiento predictivo y control estadístico cerrado."
        image={indManufactura}
        icon={Cpu}
        highlight="OEE 92.4%"
        reverse
        metrics={[
          { label: "Plantas", value: "37" },
          { label: "MTBF", value: "412 h", trend: "↑ 18%" },
          { label: "Defectos PPM", value: "84" },
          { label: "Latencia bus", value: "4 ms" },
        ]}
        visual={<AreaSpark data={series(4)} height={64} />}
      />

      <IndustryCard
        index={5}
        code="NET · 058"
        title="Robótica cognitiva y orquestación distribuida."
        subtitle="Tecnología & Edge"
        description="Coordinación de flotas autónomas, federated learning en el edge y observabilidad de extremo a extremo."
        image={indTech}
        icon={Network}
        highlight="1,248 nodos"
        metrics={[
          { label: "Throughput", value: "8.4 GB/s" },
          { label: "p99 latencia", value: "9.2 ms" },
          { label: "Uptime 30d", value: "99.998%" },
          { label: "Drift modelo", value: "0.3%" },
        ]}
        visual={<AreaSpark data={series(5)} height={64} />}
      />

      <IndustryCard
        index={6}
        code="ENG · 072"
        title="Optimización sub-superficie y seguridad operativa."
        subtitle="Oil & Gas"
        description="Inversión sísmica neural, detección de fugas con sensórica acústica y planificación dinámica de pozos."
        image={indOil}
        icon={Flame}
        highlight="− 22% emisiones"
        reverse
        metrics={[
          { label: "Pozos", value: "1,084" },
          { label: "Detección fugas", value: "< 90 s" },
          { label: "Recuperación", value: "+ 9.6%" },
          { label: "Sensores", value: "318 K" },
        ]}
        visual={<AreaSpark data={series(6)} height={64} />}
      />

      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Top status bar */}
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 md:col-span-7 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-strong text-[11px] font-mono-data">
              <span className="pulse-dot" />
              <span className="text-muted-foreground">ESTADO DEL SISTEMA</span>
              <span className="text-glow">ACTIVO · NOMINAL</span>
            </div>
            <span className="hidden md:inline data-tick">02.001 · CLINICAL PRECISION v1.0</span>
          </div>
          <div className="col-span-12 md:col-span-5 flex md:justify-end items-center gap-6 font-mono-data text-[11px] text-muted-foreground">
            <span>LAT 12 ms</span><span>NODES 1,248</span><span>SR 99.998%</span>
          </div>
        </div>

        {/* Headline */}
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-9">
            <div className="label-tag mb-4">— Plataforma de inteligencia industrial</div>
            <h1 className="font-display text-[44px] sm:text-6xl md:text-[88px] leading-[0.95] tracking-tight font-medium">
              Inteligencia de <span className="italic font-light text-glow">precisión</span><br />
              para cada industria.
            </h1>
          </div>
          <div className="col-span-12 md:col-span-3 md:pl-6 md:border-l border-border/60">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ciencia de datos y machine learning calibrados al milímetro. Seis ecosistemas. Una sola arquitectura clínica.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/soluciones" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition">
                Abrir panel <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a href="#ecosistemas" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border glass text-[13px] hover:bg-accent/40 transition">
                Ver ecosistemas
              </a>
            </div>
          </div>
        </div>

        {/* HUD strip */}
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
            <div className="mt-3 grid grid-cols-3 gap-3 font-mono-data text-[11px]">
              <div><div className="text-muted-foreground">P50</div><div className="text-foreground">12 ms</div></div>
              <div><div className="text-muted-foreground">P95</div><div className="text-foreground">38 ms</div></div>
              <div><div className="text-muted-foreground">P99</div><div className="text-foreground">94 ms</div></div>
            </div>
          </div>

          <div className="col-span-6 md:col-span-3 glass-strong rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="label-tag mb-1">Carga distribuida</div>
              <div className="font-display text-2xl">Mapa de nodos</div>
            </div>
            <BarMatrix rows={5} cols={16} className="mt-4" />
            <div className="mt-3 flex items-center justify-between font-mono-data text-[11px] text-muted-foreground">
              <span>1,248 activos</span><span className="text-glow">98% sat.</span>
            </div>
          </div>

          <div className="col-span-6 md:col-span-2 glass-strong rounded-xl p-5 flex flex-col items-center justify-center">
            <RadialGauge value={94} label="Confianza modelo" size={108} />
          </div>

          <div className="col-span-12 md:col-span-2 glass-strong rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="label-tag mb-1">Eventos</div>
              <div className="font-display text-2xl">Live feed</div>
            </div>
            <ul className="mt-3 space-y-1.5 font-mono-data text-[10px]">
              {[
                ["12:04:21", "MFG · OEE +0.4%"],
                ["12:04:18", "AGRO · NDVI sync"],
                ["12:04:11", "BIO · 412 hits"],
                ["12:04:02", "NET · scale +6"],
                ["12:03:54", "ENG · leak ok"],
              ].map(([t, m]) => (
                <li key={t} className="flex justify-between gap-2 text-muted-foreground">
                  <span>{t}</span><span className="text-foreground truncate">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Logo ticker */}
      <div className="border-y border-border/60 py-4 overflow-hidden">
        <div className="flex w-max ticker-track gap-12 whitespace-nowrap font-mono-data text-[11px] text-muted-foreground">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 px-6">
              {["NORDIA AGRO", "PAMPA LIVESTOCK", "BIOTECH CORP", "AURORA ROBOTICS", "MERIDIAN ENERGY", "QUANTUM FAB", "OAK MEDICAL", "STELLAR NET", "CAMPO GENOMICS", "DELTA OIL"].map((b) => (
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
    { icon: Activity, k: "01", t: "Calibración clínica", d: "Cada modelo se valida contra trazas físicas reales antes de operar en producción." },
    { icon: ShieldCheck, k: "02", t: "Resiliencia industrial", d: "Tolerancia a fallos por diseño, observabilidad de extremo a extremo, SLAs verificables." },
    { icon: Network, k: "03", t: "Topología compuesta", d: "Cómputo en edge, fog y nube federada bajo una única superficie de control." },
  ];
  return (
    <section className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-[1400px] px-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <div className="label-tag mb-3">— Principios</div>
          <h3 className="font-display text-3xl tracking-tight">Una arquitectura, seis dominios.</h3>
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

function CTA() {
  return (
    <section className="relative border-t border-border/60 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-atmosphere -z-10" />
      <div className="mx-auto max-w-[1400px] px-6 grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-8">
          <div className="label-tag mb-4">— Operación 24 / 7 · 365</div>
          <h3 className="font-display text-4xl md:text-6xl tracking-tight leading-[1.05]">
            Active el grado <span className="text-glow italic font-light">instrumental</span><br />
            en su organización.
          </h3>
        </div>
        <div className="col-span-12 md:col-span-4 flex md:justify-end gap-3">
          <Link to="/soluciones" className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition">
            Abrir panel de soluciones <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
