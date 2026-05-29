import marimo

__generated_with = "0.23.8"
app = marimo.App(width="wide", app_title="I. Sanidad Vegetal y MIP")


@app.cell
def _():
    import marimo as mo
    import numpy as np
    import pandas as pd
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    from scipy.stats import norm
    from scipy.optimize import curve_fit
    from statsmodels.tsa.seasonal import seasonal_decompose
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from utils.synthetic_data import generar_serie_meteorologica

    return curve_fit, generar_serie_meteorologica, go, make_subplots, mo, np


@app.cell
def _(mo):
    mo.md(r"""
    # I. Sanidad Vegetal y Manejo Integrado de Plagas (MIP)

    ## Fundamento Biológico y Matemático

    El modelo central de este módulo es la **acumulación de Grados-Día (GD)**, que describe la
    relación entre temperatura y desarrollo de insectos o enfermedades:

    $$GD = \sum_{i=1}^{n} \max\left(0, \frac{T_{max,i} + T_{min,i}}{2} - T_{base}\right)$$

    El **Índice de Riesgo de Enfermedad (IRE)** combina temperatura y humedad relativa mediante:

    $$IRE = \frac{1}{n}\sum_{i=1}^{n} \mathbb{1}\left[T_i \in [T_{opt,min}, T_{opt,max}] \cap HR_i > HR_{umbral}\right] \cdot w_i$$

    El **NDVI** (Índice de Vegetación de Diferencia Normalizada) se calcula como:

    $$NDVI = \frac{\rho_{NIR} - \rho_{Red}}{\rho_{NIR} + \rho_{Red}} \in [-1, 1]$$

    Valores de NDVI < 0.4 en cultivos adultos pueden indicar estrés biótico o abiótico.
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    ## Parámetros del Modelo MIP
    """)
    return


@app.cell
def _(mo):
    temp_base_slider = mo.ui.slider(
        start=5.0, stop=15.0, step=0.5, value=10.0,
        label="Temperatura Base (°C) — umbral de desarrollo del insecto"
    )
    umbral_gd = mo.ui.slider(
        start=100, stop=600, step=25, value=300,
        label="Umbral de GD para alerta de plaga"
    )
    umbral_hr = mo.ui.slider(
        start=60, stop=90, step=5, value=75,
        label="Humedad Relativa Umbral para enfermedad (%)"
    )
    temp_opt_min = mo.ui.slider(
        start=10, stop=20, step=1, value=15,
        label="Temp óptima mínima para hongo (°C)"
    )
    temp_opt_max = mo.ui.slider(
        start=20, stop=35, step=1, value=25,
        label="Temp óptima máxima para hongo (°C)"
    )
    return temp_base_slider, temp_opt_max, temp_opt_min, umbral_gd, umbral_hr


@app.cell
def _(mo, temp_base_slider, temp_opt_max, temp_opt_min, umbral_gd, umbral_hr):
    mo.vstack([
        mo.md("### Controles Interactivos"),
        mo.hstack([temp_base_slider, umbral_gd]),
        mo.hstack([umbral_hr, temp_opt_min, temp_opt_max]),
    ])
    return


@app.cell
def _(
    generar_serie_meteorologica,
    np,
    temp_base_slider,
    temp_opt_max,
    temp_opt_min,
    umbral_hr,
):
    # --- Generación de Datos Sintéticos ---
    df_clima = generar_serie_meteorologica(dias=365)

    # NDVI sintético con curva de crecimiento logística + ruido sensor
    t = np.arange(365)
    ndvi_base = 0.15 + 0.65 / (1 + np.exp(-0.05 * (t - 120))) * np.exp(-0.003 * (t - 200)**2 / 100)
    ndvi_base = np.clip(ndvi_base, 0.1, 0.9)
    rng = np.random.default_rng(99)
    df_clima["ndvi"] = np.round(ndvi_base + rng.normal(0, 0.03, 365), 3)
    df_clima["ndvi"] = np.clip(df_clima["ndvi"], 0.0, 1.0)

    # Condición favorable para hongo
    df_clima["cond_hongo"] = (
        (df_clima["temp_media_c"] >= temp_opt_min.value) &
        (df_clima["temp_media_c"] <= temp_opt_max.value) &
        (df_clima["humedad_rel_pct"] >= umbral_hr.value)
    ).astype(int)

    # Índice de riesgo de enfermedad acumulado (ventana 14 días)
    df_clima["ire_14d"] = df_clima["cond_hongo"].rolling(14).mean().fillna(0)

    # Grados-día acumulados desde el día 60 (siembra aprox.)
    df_clima["gd_diario"] = np.maximum(0, df_clima["temp_media_c"] - temp_base_slider.value)
    df_clima["gd_acum"] = df_clima["gd_diario"].cumsum()

    df_clima
    return (df_clima,)


@app.cell
def _(df_clima, go, make_subplots, umbral_gd):
    # --- Visualización principal ---
    fig = make_subplots(
        rows=3, cols=1,
        shared_xaxes=True,
        subplot_titles=[
            "Temperatura Máx/Mín y Humedad Relativa",
            "NDVI y Grados-Día Acumulados",
            "Índice de Riesgo de Enfermedad (IRE — ventana 14 días)"
        ],
        vertical_spacing=0.08,
        row_heights=[0.35, 0.35, 0.30]
    )

    # Panel 1: Temperatura y HR
    fig.add_trace(go.Scatter(
        x=df_clima["fecha"], y=df_clima["temp_max_c"],
        name="T máx (°C)", line=dict(color="#e74c3c", width=1.5),
        fill="tonexty", fillcolor="rgba(231,76,60,0.08)"
    ), row=1, col=1)
    fig.add_trace(go.Scatter(
        x=df_clima["fecha"], y=df_clima["temp_min_c"],
        name="T mín (°C)", line=dict(color="#3498db", width=1.5)
    ), row=1, col=1)
    fig.add_trace(go.Scatter(
        x=df_clima["fecha"], y=df_clima["humedad_rel_pct"],
        name="HR (%)", line=dict(color="#27ae60", width=1, dash="dot"),
        yaxis="y2"
    ), row=1, col=1)

    # Panel 2: NDVI y GD
    fig.add_trace(go.Scatter(
        x=df_clima["fecha"], y=df_clima["ndvi"],
        name="NDVI", line=dict(color="#2ecc71", width=2),
        fill="tozeroy", fillcolor="rgba(46,204,113,0.15)"
    ), row=2, col=1)
    fig.add_trace(go.Scatter(
        x=df_clima["fecha"], y=df_clima["gd_acum"],
        name="GD Acum.", line=dict(color="#e67e22", width=2),
        yaxis="y4"
    ), row=2, col=1)

    # Línea de alerta GD
    fig.add_hline(
        y=umbral_gd.value, row=2, col=1,
        line_dash="dash", line_color="red",
        annotation_text=f"Alerta: {umbral_gd.value} GD",
        annotation_position="bottom right"
    )

    # Panel 3: IRE
    fig.add_trace(go.Bar(
        x=df_clima["fecha"], y=df_clima["ire_14d"],
        name="IRE 14d", marker_color=df_clima["ire_14d"].apply(
            lambda v: "#e74c3c" if v > 0.5 else "#f39c12" if v > 0.25 else "#27ae60"
        )
    ), row=3, col=1)
    fig.add_hline(y=0.5, row=3, col=1, line_dash="dash", line_color="red",
                  annotation_text="Riesgo Alto")
    fig.add_hline(y=0.25, row=3, col=1, line_dash="dot", line_color="orange",
                  annotation_text="Riesgo Moderado")

    fig.update_layout(
        height=750, template="plotly_white",
        title="Dashboard MIP — Monitoreo Integrado de Plagas y Enfermedades",
        legend=dict(orientation="h", yanchor="bottom", y=1.02)
    )
    fig
    return


@app.cell
def _(df_clima, mo, umbral_gd):
    # --- KPIs del módulo ---
    dias_alerta_gd = int((df_clima["gd_acum"] >= umbral_gd.value).sum())
    fecha_alerta = df_clima.loc[df_clima["gd_acum"] >= umbral_gd.value, "fecha"].iloc[0] if dias_alerta_gd > 0 else "No alcanzado"
    dias_riesgo_alto = int((df_clima["ire_14d"] > 0.5).sum())
    ndvi_min = round(df_clima["ndvi"].min(), 3)

    mo.callout(
        mo.md(f"""
        **Resumen del Análisis MIP:**

        - Fecha de alerta por Grados-Día ({umbral_gd.value} GD acum.): **{fecha_alerta if isinstance(fecha_alerta, str) else fecha_alerta.strftime('%d/%m/%Y')}**
        - Días con Riesgo Alto de Enfermedad (IRE > 0.5): **{dias_riesgo_alto} días**
        - NDVI mínimo registrado: **{ndvi_min}** {'⚠️ posible estrés' if ndvi_min < 0.3 else '✓ normal'}
        - Precipitación anual acumulada: **{df_clima['lluvia_mm'].sum():.0f} mm**
        """),
        kind="warn" if dias_riesgo_alto > 30 else "info"
    )
    return


@app.cell
def _(mo):
    mo.md("""
    ## Análisis de Curva de Degradación Cinética de Plaguicidas (Scipy)
    """)
    return


@app.cell
def _(curve_fit, go, mo, np):
    # Modelo de degradación de primer orden: C(t) = C0 * exp(-k*t)
    dias_deg = np.arange(0, 60, 2, dtype=float)
    rng2 = np.random.default_rng(77)
    c0_real = 100.0
    k_real = 0.045
    conc_obs = c0_real * np.exp(-k_real * dias_deg) + rng2.normal(0, 2, len(dias_deg))
    conc_obs = np.clip(conc_obs, 0.1, None)

    def modelo_degradacion(t, c0, k):
        return c0 * np.exp(-k * t)

    popt, pcov = curve_fit(modelo_degradacion, dias_deg, conc_obs, p0=[90, 0.03])
    c0_fit, k_fit = popt
    dt50 = np.log(2) / k_fit

    t_fit = np.linspace(0, 60, 200)
    conc_fit = modelo_degradacion(t_fit, *popt)

    fig_deg = go.Figure()
    fig_deg.add_trace(go.Scatter(
        x=dias_deg, y=conc_obs, mode="markers",
        name="Concentración observada", marker=dict(color="#e74c3c", size=7)
    ))
    fig_deg.add_trace(go.Scatter(
        x=t_fit, y=conc_fit, mode="lines",
        name=f"Ajuste C(t)=C₀·e^(-kt) — DT₅₀={dt50:.1f}d",
        line=dict(color="#3498db", width=2.5)
    ))
    fig_deg.add_hline(y=c0_fit / 2, line_dash="dash", line_color="gray",
                      annotation_text=f"50% de C₀ → DT₅₀ = {dt50:.1f} días")
    fig_deg.update_layout(
        title="Curva de Degradación Cinética de Primer Orden (Scipy curve_fit)",
        xaxis_title="Días post-aplicación", yaxis_title="Concentración (ppm)",
        template="plotly_white", height=400
    )
    mo.vstack([
        fig_deg,
        mo.md(f"**Parámetros estimados:** C₀ = {c0_fit:.1f} ppm | k = {k_fit:.4f} d⁻¹ | DT₅₀ = **{dt50:.1f} días**")
    ])
    return


if __name__ == "__main__":
    app.run()
