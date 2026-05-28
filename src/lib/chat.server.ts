import { createServerFn } from "@tanstack/react-start";

const NOTEBOOK_CONTEXTS: Record<string, string> = {
  "01_sanidad_vegetal_mip.html": `
Notebook: Sanidad Vegetal y Manejo Integrado de Plagas (MIP)

Esta notebook aborda el monitoreo y control de plagas en cultivos agrícolas usando el enfoque MIP.

Conceptos clave:
- Nivel de Daño Económico (NDE): umbral de densidad poblacional de la plaga a partir del cual las pérdidas económicas superan el costo de control.
- Umbral de Acción (UA): nivel poblacional al que se toma la decisión de intervenir, típicamente 70-80% del NDE.
- Curvas de crecimiento poblacional: modelos logísticos y exponenciales para proyectar infestaciones.
- Análisis costo-beneficio: comparación entre costo de aplicación de agroquímicos vs. pérdida evitada.
- Índices de infestación: porcentaje de plantas afectadas, número de individuos por unidad de muestreo.
- Métodos de muestreo: transectas, trampas, conteos visuales.
- Productos y dosis: eficiencia de insecticidas/fungicidas, curvas dosis-respuesta.
- Resistencia: rotación de modos de acción para prevenir resistencia.

Cultivos y plagas frecuentes en el contexto:
- Soja: chinche, oruga medidora, trips.
- Maíz: gusano cogollero, pulgón.
- Trigo: roya, fusarium.

Modelos estadísticos usados: regresión logística, modelos de umbral, análisis de varianza.
`,

  "10_economia_agraria.html": `
Notebook: Economía Agraria y Toma de Decisiones

Esta notebook modela la rentabilidad de actividades agropecuarias y la toma de decisiones bajo incertidumbre.

Conceptos clave:
- Margen Bruto (MB): ingreso bruto menos costos directos. MB = Rendimiento × Precio - Costos directos.
- Costos directos: semillas, fertilizantes, agroquímicos, laboreos, cosecha.
- Costos indirectos/estructura: arrendamiento, maquinaria, administración.
- Punto de equilibrio: rendimiento mínimo para cubrir costos totales.
- Análisis de sensibilidad: variación del MB ante cambios en precio o rendimiento (±10%, ±20%).
- Optimización de cartera: mix de cultivos para maximizar margen por hectárea.
- Riesgo: distribuciones de probabilidad de precios y rendimientos, valor esperado, desvío estándar.
- VAN (Valor Actual Neto) y TIR para inversiones de largo plazo.

Actividades modeladas: soja, maíz, trigo, girasol, ganadería bovina.

Fórmulas centrales:
- MB = (rendimiento_tn × precio_usd) - suma(costos_directos)
- Punto_equilibrio = costos_totales / precio
- Rentabilidad_pct = MB / costos_totales × 100

Modelos: simulación Monte Carlo de precios, análisis de escenarios (optimista/base/pesimista).
`,

  "modulo_1_produccion_leche.html": `
Notebook: Producción de Leche — Curvas de Lactancia y Proyección

Esta notebook modela la producción individual y por rodeo en tambos lecheros.

Conceptos clave:
- Curva de lactancia: producción diaria de leche en función de los días en leche (DEL).
- Modelo de Wood: y(t) = a × t^b × e^(-ct), donde t = días en leche, a = escala, b = fase ascendente, c = tasa de declinación.
- Pico de lactancia: máxima producción, típicamente entre DEL 40-60.
- Persistencia: capacidad de mantener producción elevada después del pico. P = -b/log(c).
- Producción 305 días: proyección estándar para comparación entre animales.
- Categorías: vaquillonas 1er parto vs. vacas multíparas (distintos parámetros de curva).
- Factores que afectan: raza, nutrición, manejo, época de parto, número de parto.
- Proyección por rodeo: suma de curvas individuales ponderadas por distribución de DEL.

Métricas del tambo:
- Litros/vaca/día promedio del rodeo.
- Eficiencia de conversión alimenticia.
- Carga animal (vacas/ha).
- Relación producción/costo de alimentación.

Modelos alternativos: Wilmink (curva asimétrica), polinomio de Ali-Schaeffer.
`,

  "modulo_2_nutricion.html": `
Notebook: Nutrición Animal — Balance de Raciones y Requerimientos

Esta notebook calcula requerimientos nutricionales y balancea raciones para distintas categorías de bovinos.

Conceptos clave:
- Requerimientos de mantenimiento: energía y proteína mínimas para sostener el animal sin producción ni crecimiento.
- Requerimientos de producción: energía adicional por litro de leche, kg de carne o gestación.
- Energía Metabolizable (EM): energía disponible para el animal = ED × 0.82 (aprox).
- Proteína Cruda (PC) y Proteína Metabolizable (PM): fracción degradable (PDR) vs. no degradable en rumen (PNDR).
- Fibra Detergente Neutro (FDN): indicador de fibra estructural, regula consumo y función ruminal.
- Consumo Voluntario (CV): estimado como % del peso vivo (PV): CV ≈ 2-3% PV en MS.
- Balance: comparar aporte de la ración vs. requerimientos. Superávit o déficit en energía, proteína, minerales.

Tablas de composición de alimentos (valores típicos en % MS):
- Silaje de maíz: EM 2.4 Mcal/kg, PC 8%, FDN 45%.
- Pastura fresca: EM 2.6 Mcal/kg, PC 18-22%, FDN 40%.
- Grano de maíz: EM 3.2 Mcal/kg, PC 9%, FDN 12%.
- Expeller de soja: EM 2.7 Mcal/kg, PC 45%, FDN 15%.

Modelos: NRC 2001 (bovinos lecheros), NRC 2000 (bovinos carne).
Categorías: terneros, novillos, vaquillonas, vacas en lactancia, vacas secas.

Optimización: formulación de ración de mínimo costo con restricciones nutricionales (programación lineal).
`,
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const sendChatMessage = createServerFn({ method: "POST" }).handler(
  async ({
    data,
  }: {
    data: { message: string; notebookFile: string; history: ChatMessage[] };
  }) => {
    const { message, notebookFile, history } = data;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY no configurada");

    const context = NOTEBOOK_CONTEXTS[notebookFile] ?? "";

    const systemPrompt = `Sos un asistente de análisis de datos especializado en agroindustria e inteligencia artificial, parte del equipo de TensorLabs. El usuario está viendo la siguiente notebook interactiva y puede hacerte preguntas sobre ella.

CONTEXTO DE LA NOTEBOOK:
${context}

Respondé de forma concisa y técnica en español. Si te preguntan algo fuera de este contexto, respondé igual con tu mejor criterio. No uses markdown complejo, mantené respuestas cortas (máximo 3-4 párrafos).`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google AI error: ${err}`);
    }

    const result = await response.json() as { choices: { message: { content: string } }[] };
    return { reply: result.choices[0].message.content };
  }
);
