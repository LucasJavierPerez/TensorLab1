import { createFileRoute } from "@tanstack/react-router";
import { Sprout, Beef, Dna, Cpu, Network, Flame } from "lucide-react";
import { Header } from "@/components/tl/Header";
import { Footer } from "@/components/tl/Footer";
import { IndustryCard } from "@/components/tl/IndustryCard";
import { AreaSpark, BarMatrix, BarSpark, PointMap, RegressionChart, ScatterClusteringChart } from "@/components/tl/MiniChart";

import indAgro from "@/assets/ind-agro.jpg";
import indGanaderia from "@/assets/ind-ganaderia.jpg";
import indMedicina from "@/assets/ind-medicina.jpg";
import indManufactura from "@/assets/ind-manufactura.jpg";
import indTech from "@/assets/ind-tech.jpg";
import indOil from "@/assets/ind-oil.jpg";

export const Route = createFileRoute("/industria")({
  component: Industria,
});

const series = (seed: number, n = 40) =>
  Array.from({ length: n }, (_, i) => 50 + Math.sin(i * 0.6 + seed) * 18 + Math.sin(i * 0.21 + seed * 2) * 12 + i * 0.3);

function Industria() {
  return (
    <div className="min-h-screen bg-atmosphere">
      <Header />
      
      <section className="pt-24 pb-12 border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="label-tag mb-4">— Portafolio Industrial</div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight max-w-4xl">
            Soluciones de precisión para <span className="italic font-light text-glow">ecosistemas críticos</span>.
          </h1>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Nuestros modelos predictivos están diseñados para operar en los entornos más exigentes, donde la eficiencia y la seguridad son los pilares de la rentabilidad.
          </p>
        </div>
      </section>

      <div className="space-y-0">
        <IndustryCard
          index={1}
          code="AGRO · 014"
          title="Optimización del rinde mediante análisis multiespectral."
          subtitle="Agricultura de precisión"
          description="Análisis de datos y modelos predictivos para anticipar el estrés hídrico y optimizar el uso de insumos con precisión de metro cuadrado."
          image={indAgro}
          icon={Sprout}
          highlight="+ 23.4% rinde estimado"
          metrics={[
            { label: "Hectáreas", value: "1.24 M", trend: "↑ 8.1% YoY" },
            { label: "Modelos activos", value: "42" },
            { label: "Precisión NDVI", value: "98.7%", trend: "σ 0.14" },
            { label: "Ahorro hídrico", value: "31%" },
          ]}
          visual={<BarSpark data={series(1, 24)} height={64} />}
        />

        <IndustryCard
          index={2}
          code="LIVE · 027"
          title="Detección temprana de patologías mediante telemetría."
          subtitle="Ganadería inteligente"
          description="Telemetría avanzada y modelos de predicción de salud para detectar anomalías en el rodeo semanas antes de los primeros síntomas."
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
          visual={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    {/* Gráfico de la Izquierda: Análisis Predictivo */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono-data text-muted-foreground uppercase tracking-widest">Regresión Lineal</span>
                        <span className="text-[10px] font-mono-data text-glow-green">CI 95%</span>
                      </div>
                      <RegressionChart /> 
                    </div>

                    {/* Gráfico de la Derecha: Inferencia de Anomalías */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono-data text-muted-foreground uppercase tracking-widest">Distribución de Nodos</span>
                        <span className="text-[10px] font-mono-data text-glow-green">LIVE FEED</span>
                      </div>
                      <ScatterClusteringChart /> {/* O el componente que prefieras para la derecha */}
                    </div>
                  </div>
                }
        />

        <IndustryCard
          index={3}
          code="BIO · 003"
          title="Bio-descubrimiento acelerado por modelos de rinde."
          subtitle="Medicina computacional"
          description="Análisis masivo de datos y modelos de descubrimiento que predicen la eficacia de nuevos fármacos analizando billones de compuestos."
          image={indMedicina}
          icon={Dna}
          highlight="3.8M moléculas/h"
          metrics={[
            { label: "Compuestos", value: "2.1 B" },
            { label: "Hit rate", value: "0.041%" },
            { label: "Confianza", value: "94.6%", trend: "AUROC" },
            { label: "Tiempo medio", value: "11 min" },
          ]}
          visual={<PointMap className="mt-2" />}
        />

        <IndustryCard
          index={4}
          code="MFG · 041"
          title="Eliminación de paradas mediante análisis vibracional."
          subtitle="Manufactura 4.0"
          description="Modelado de fatiga y análisis de datos en tiempo real para saber exactamente qué pieza va a fallar antes de que se detenga la producción."
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
          visual={<BarSpark data={series(4, 24)} height={64} />}
        />

        <IndustryCard
          index={5}
          code="NET · 058"
          title="Escalabilidad inteligente por predicción de carga."
          subtitle="Tecnología & Edge"
          description="Predicción de demanda e infraestructura para escalar sistemas de forma automática, adelantándose a los picos de tráfico."
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
          title="Maximización de extracción y detección de anomalías."
          subtitle="Oil & Gas"
          description="Modelado de rinde y detección de anomalías estructurales en tiempo real para maximizar la extracción y prevenir riesgos ambientales."
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
          visual={
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
    {/* Gráfico de la Izquierda: Análisis Predictivo */}
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono-data text-muted-foreground uppercase tracking-widest">Regresión Lineal</span>
        <span className="text-[10px] font-mono-data text-glow-green">CI 95%</span>
      </div>
      <RegressionChart /> 
    </div>

    {/* Gráfico de la Derecha: Inferencia de Anomalías */}
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono-data text-muted-foreground uppercase tracking-widest">Distribución de Nodos</span>
        <span className="text-[10px] font-mono-data text-glow-green">LIVE FEED</span>
      </div>
      <ScatterClusteringChart /> {/* O el componente que prefieras para la derecha */}
    </div>
  </div>
}
        />
      </div>

      <Footer />
    </div>
  );
}
