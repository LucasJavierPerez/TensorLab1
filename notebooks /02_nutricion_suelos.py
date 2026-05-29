import marimo

__generated_with = "0.23.1"
app = marimo.App(
    width="wide",
    app_title="II. Nutrición de Cultivos y Fertilidad de Suelos",
)


@app.cell
def _():
    import marimo as mo
    import numpy as np
    import pandas as pd
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    from sklearn.linear_model import LinearRegression
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from utils.synthetic_data import generar_datos_suelo

    return (
        KMeans,
        StandardScaler,
        generar_datos_suelo,
        go,
        make_subplots,
        mo,
        np,
        px,
    )


@app.cell
def _(mo):
    mo.md(r"""
    # II. Nutrición de Cultivos y Fertilidad de Suelos

    ## Fundamento Agronómico y Matemático

    ### Modelo de Respuesta de Mitscherlich
    Describe la relación entre dosis de fertilizante y rendimiento:

    $$Y = Y_{max} \cdot \left(1 - e^{-c(x + b)}\right)$$

    Donde $Y_{max}$ es el rendimiento máximo potencial, $c$ es el coeficiente de respuesta
    y $b$ el nutriente disponible en el suelo.

    ### Kriging Ordinario (Geoestadística)
    La varianza de predicción en un punto no muestreado $\mathbf{x_0}$:

    $$\hat{Z}(\mathbf{x_0}) = \sum_{i=1}^{n} \lambda_i Z(\mathbf{x_i})$$

    Con restricción $\sum \lambda_i = 1$ (insesgamiento). El variograma experimental:

    $$\hat{\gamma}(h) = \frac{1}{2|N(h)|} \sum_{N(h)} [Z(\mathbf{x_i}) - Z(\mathbf{x_j})]^2$$

    ### Zonificación por Clustering (K-Means)
    Se agrupan las muestras en zonas de manejo homogéneo minimizando:

    $$J = \sum_{k=1}^{K} \sum_{\mathbf{x} \in C_k} \|\mathbf{x} - \boldsymbol{\mu}_k\|^2$$
    """)
    return


@app.cell
def _(mo):
    n_zonas = mo.ui.slider(start=2, stop=6, step=1, value=3, label="Número de Zonas de Manejo (K-Means)")
    rinde_objetivo = mo.ui.slider(start=3000, stop=9000, step=250, value=6000, label="Rinde Objetivo (kg/ha)")
    precio_soja = mo.ui.number(start=300, stop=600, step=10, value=400, label="Precio Soja (USD/t)")
    precio_urea = mo.ui.number(start=400, stop=900, step=25, value=600, label="Precio Urea (USD/t)")
    mo.vstack([
        mo.md("## Parámetros"),
        mo.hstack([n_zonas, rinde_objetivo]),
        mo.hstack([precio_soja, precio_urea]),
    ])
    return n_zonas, precio_soja, precio_urea, rinde_objetivo


@app.cell
def _(KMeans, StandardScaler, generar_datos_suelo, mo, n_zonas):
    # --- Datos Sintéticos ---
    df_suelo = generar_datos_suelo(n_muestras=150)

    # Zonificación K-Means
    features_cluster = ["mo_pct", "p_bray_ppm", "ph", "k_meq_100g", "ce_ds_m"]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_suelo[features_cluster])
    kmeans = KMeans(n_clusters=n_zonas.value, random_state=42, n_init=10)
    df_suelo["zona"] = kmeans.fit_predict(X_scaled).astype(str)

    mo.md(f"**Datos cargados:** {len(df_suelo)} muestras | {n_zonas.value} zonas de manejo identificadas")
    return (df_suelo,)


@app.cell
def _(df_suelo, mo, n_zonas, px):
    # --- Mapa espacial de zonas ---
    paleta = px.colors.qualitative.Set2[:n_zonas.value]

    fig_mapa = px.scatter(
        df_suelo, x="coord_x", y="coord_y", color="zona",
        size="mo_pct", hover_data=["ph", "p_bray_ppm", "k_meq_100g", "rinde_hist_kg_ha"],
        title="Mapa de Zonificación de Suelo (K-Means)",
        labels={"coord_x": "Este (m)", "coord_y": "Norte (m)", "zona": "Zona de Manejo"},
        color_discrete_sequence=paleta,
        template="plotly_white", height=450
    )
    fig_mapa.update_traces(marker=dict(opacity=0.85, line=dict(width=0.5, color="white")))

    # --- Estadísticas por zona ---
    stats_zona = df_suelo.groupby("zona")[
        ["mo_pct", "ph", "p_bray_ppm", "k_meq_100g", "rinde_hist_kg_ha"]
    ].mean().round(2).reset_index()
    stats_zona.columns = ["Zona", "MO (%)", "pH", "P Bray (ppm)", "K (meq)", "Rinde hist. (kg/ha)"]

    mo.vstack([fig_mapa, mo.ui.table(stats_zona)])
    return


@app.cell
def _(go, make_subplots, np, precio_soja, precio_urea, rinde_objetivo):
    # --- Curva de respuesta de Mitscherlich para N ---
    dosis_n = np.linspace(0, 200, 100)
    ymax = rinde_objetivo.value * 1.15

    # Parámetros calibrados para soja en Pampa Húmeda
    c_coef = 0.015
    b_nativo = 40  # kg/ha N mineralizable

    rinde_resp = ymax * (1 - np.exp(-c_coef * (dosis_n + b_nativo)))

    # Costo de aplicación
    costo_n = dosis_n * 0.46 * (precio_urea.value / 1000)  # urea 46% N, precio en USD/kg
    ingreso = rinde_resp / 1000 * precio_soja.value
    margen = ingreso - costo_n

    dosis_optima = dosis_n[np.argmax(margen)]
    margen_max = margen.max()

    fig_curva = make_subplots(specs=[[{"secondary_y": True}]])
    fig_curva.add_trace(go.Scatter(
        x=dosis_n, y=rinde_resp, name="Rinde (kg/ha)",
        line=dict(color="#27ae60", width=2.5)
    ))
    fig_curva.add_trace(go.Scatter(
        x=dosis_n, y=margen, name="Margen bruto (USD/ha)",
        line=dict(color="#e67e22", width=2, dash="dash")
    ), secondary_y=True)
    fig_curva.add_vline(x=dosis_optima, line_dash="dot", line_color="red",
                        annotation_text=f"Dosis óptima: {dosis_optima:.0f} kg N/ha")
    fig_curva.update_layout(
        title=f"Curva de Respuesta Mitscherlich — Dosis óptima económica: {dosis_optima:.0f} kg N/ha | Margen: USD {margen_max:.0f}/ha",
        xaxis_title="Dosis de N (kg/ha)", template="plotly_white", height=420
    )
    fig_curva.update_yaxes(title_text="Rinde (kg/ha)", secondary_y=False)
    fig_curva.update_yaxes(title_text="Margen Bruto (USD/ha)", secondary_y=True)

    fig_curva
    return


@app.cell
def _(mo):
    # --- Variograma Experimental (simulado) ---
    mo.md("""
    ## Variograma Experimental de Materia Orgánica
    """)
    return


@app.cell
def _(df_suelo, go, mo, np):
    # Cálculo manual del variograma experimental
    n = len(df_suelo)
    distancias = []
    semivarianzas = []
    bins = np.arange(0, 500, 40)

    for i in range(n):
        for j in range(i + 1, n):
            d = np.sqrt((df_suelo["coord_x"].iloc[i] - df_suelo["coord_x"].iloc[j])**2 +
                        (df_suelo["coord_y"].iloc[i] - df_suelo["coord_y"].iloc[j])**2)
            sv = 0.5 * (df_suelo["mo_pct"].iloc[i] - df_suelo["mo_pct"].iloc[j])**2
            distancias.append(d)
            semivarianzas.append(sv)

    dist_arr = np.array(distancias)
    sv_arr = np.array(semivarianzas)

    bin_centers = []
    bin_sv = []
    bin_n = []
    for k in range(len(bins) - 1):
        mask = (dist_arr >= bins[k]) & (dist_arr < bins[k + 1])
        if mask.sum() > 5:
            bin_centers.append((bins[k] + bins[k + 1]) / 2)
            bin_sv.append(sv_arr[mask].mean())
            bin_n.append(mask.sum())

    # Ajuste modelo exponencial al variograma
    from scipy.optimize import curve_fit as _cf

    def variograma_exponencial(h, nugget, sill, rango):
        return nugget + (sill - nugget) * (1 - np.exp(-h / rango))

    try:
        popt_v, _ = _cf(
            variograma_exponencial, bin_centers, bin_sv,
            p0=[0.05, 0.3, 200], bounds=(0, [0.5, 1.0, 1000])
        )
        h_fit = np.linspace(0, max(bin_centers), 200)
        sv_fit = variograma_exponencial(h_fit, *popt_v)
        nugget_v, sill_v, rango_v = popt_v
    except Exception:
        h_fit, sv_fit = [], []
        nugget_v, sill_v, rango_v = 0, 0, 0

    fig_vario = go.Figure()
    fig_vario.add_trace(go.Scatter(
        x=bin_centers, y=bin_sv, mode="markers+text",
        text=[f"n={v}" for v in bin_n],
        textposition="top center",
        name="γ̂(h) experimental", marker=dict(color="#3498db", size=10)
    ))
    if len(h_fit) > 0:
        fig_vario.add_trace(go.Scatter(
            x=h_fit, y=sv_fit, mode="lines",
            name=f"Modelo Exp. — Nugget={nugget_v:.3f}, Sill={sill_v:.3f}, Rango={rango_v:.0f}m",
            line=dict(color="#e74c3c", width=2)
        ))
        fig_vario.add_hline(y=sill_v, line_dash="dot", line_color="gray",
                            annotation_text=f"Sill={sill_v:.3f}")

    fig_vario.update_layout(
        title="Variograma Experimental de MO (%) — Base para Kriging",
        xaxis_title="Distancia de separación (m)",
        yaxis_title="Semivarianza γ̂(h)",
        template="plotly_white", height=400
    )
    mo.vstack([
        fig_vario,
        mo.callout(
            mo.md(f"**Parámetros del variograma:** Nugget = {nugget_v:.3f} | Sill = {sill_v:.3f} | Rango = {rango_v:.0f} m — "
                  f"el rango indica que muestras separadas por más de {rango_v:.0f}m son espacialmente independientes."),
            kind="info"
        )
    ])
    return


if __name__ == "__main__":
    app.run()
