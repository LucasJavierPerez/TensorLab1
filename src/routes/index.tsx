import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Activity, ShieldCheck, Database, Zap, Cpu, Bot } from "lucide-react";
import { Header } from "@/components/tl/Header";
import { Footer } from "@/components/tl/Footer";
import { AreaSpark } from "@/components/tl/MiniChart";

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
      <AiAssistant />
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
              
              <Link to="/laboratorio" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border glass text-[13px] hover:bg-accent/40 transition">
                Ver ecosistemas
              </Link>
            </div>
          </div>
        </div>

        {/* HUD Widgets */}
        <div className="mt-14 grid grid-cols-12 gap-3" id="ecosistemas">
          <div className="col-span-12 md:col-span-6 glass-strong rounded-xl overflow-hidden relative">
            <video
              src="/ganado_detectado.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ minHeight: 180 }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <div className="label-tag mb-1 text-[#257202]">Computer Vision · Tiempo Real</div>
              <div className="font-display text-xl leading-tight">Detección y clasificación<br />de individuos por inferencia óptica</div>
              <p className="mt-1.5 text-[11px] text-muted-foreground font-mono-data">
                modelo YOLOv · latencia &lt;40 ms · confianza 97.3%
              </p>
            </div>
          </div>

          {/* Tres cajas apiladas a la derecha */}
          <div className="col-span-12 md:col-span-6 flex flex-col gap-3">

            {/* Caja 1: Capacidades e Infraestructura */}
            <div className="glass-strong rounded-xl p-5 flex-1">
              <div className="label-tag mb-1">Infraestructura AI</div>
              <div className="font-display text-lg mb-2">Modelos a Medida y Eficientes</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Desarrollamos e implementamos arquitecturas optimizadas (YOLO, transformers) preparadas para correr de forma local o en la nube, garantizando latencias mínimas (&lt;40 ms) y máxima privacidad de datos.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["YOLO", "Transformers", "Edge", "Cloud"].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono-data glass border border-border/60 text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>

            {/* Caja 2: Verticales de impacto */}
            <div className="glass-strong rounded-xl p-5 flex-1">
              <div className="label-tag mb-1">Verticales de Impacto</div>
              <div className="font-display text-lg mb-3">Soluciones para Industrias Críticas</div>
              <div className="flex gap-2 flex-wrap">
                {["AgTech", "Oil & Gas", "Logística", "Manufactura"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md text-[11px] font-mono-data glass border border-border/60 text-foreground">{s}</span>
                ))}
              </div>
            </div>

            {/* Caja 3: CTA */}
            <div className="rounded-xl p-5 flex-1 border border-border/60 bg-gradient-to-br from-foreground/8 to-foreground/3 flex flex-col justify-between">
              <div>
                <div className="label-tag mb-1">Piloto </div>
                <div className="font-display text-lg mb-2">¿Tenés un desafío de datos?</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analicemos la viabilidad técnica de tu proyecto.
                </p>
              </div>
              <div className="mt-4">
                <Link to="/contacto" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition">
                  Analizar mi proyecto <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

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

function AiAssistant() {
  const features = [
    { t: "Consultas en lenguaje natural", d: "Sus equipos preguntan directamente, sin intermediarios técnicos." },
    { t: "Entrenado sobre sus datos", d: "Contexto específico de su industria y sus modelos productivos." },
    { t: "Disponible 24/7", d: "Integrado en su flujo de trabajo, accesible desde cualquier dispositivo." },
  ];
  return (
    <section className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="glass-strong rounded-2xl p-8 md:p-10 grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-7">
            <div className="label-tag mb-3">— Incluido en cada proyecto</div>
            <h3 className="font-display text-3xl md:text-4xl tracking-tight leading-tight mb-4">
              Asistente AI integrado<br className="hidden md:block" /> en su plataforma
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Cada ecosistema TensorLabs incluye un asistente conversacional entrenado sobre sus datos y modelos. Sus equipos interpretan resultados y toman decisiones sin fricción técnica.
            </p>
            <Link
              to="/laboratorio"
              className="inline-flex items-center gap-1.5 mt-6 h-9 px-4 rounded-md border border-border glass text-[13px] hover:bg-accent/40 transition"
            >
              Ver demo en el laboratorio <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="col-span-12 md:col-span-5 flex flex-col gap-3">
            {features.map(({ t, d }) => (
              <div key={t} className="flex items-start gap-3 glass rounded-xl p-4">
                <Bot className="h-4 w-4 text-glow shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium mb-0.5">{t}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
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