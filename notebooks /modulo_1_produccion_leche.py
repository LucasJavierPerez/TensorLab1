import marimo

__generated_with = "0.23.1"
app = marimo.App(width="medium", auto_download=["html"])


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _titulo(mo):
    mo.md(r"""
    # Módulo I: Producción de Leche y Curvas de Lactancia

    Análisis completo de la producción láctea en un tambo mediante modelos estadísticos
    y de machine learning. Todos los datos son mock data generados con numpy/pandas.
    """)
    return


@app.cell
def _imports():
    import numpy as np
    import pandas as pd
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import warnings
    warnings.filterwarnings("ignore")

    # scipy
    from scipy.optimize import curve_fit
    from scipy.signal import butter, lfilter

    # scikit-learn
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, IsolationForest
    from sklearn.linear_model import LogisticRegression
    from sklearn.cross_decomposition import PLSRegression
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import roc_curve, auc, mean_squared_error, r2_score
    from sklearn.preprocessing import StandardScaler

    # statsmodels
    import statsmodels.api as sm
    from statsmodels.tsa.seasonal import seasonal_decompose

    # seaborn
    import seaborn as sns

    # semilla global
    SEED = 42
    np.random.seed(SEED)
    return (
        GradientBoostingRegressor,
        IsolationForest,
        LogisticRegression,
        PLSRegression,
        RandomForestRegressor,
        SEED,
        auc,
        butter,
        curve_fit,
        lfilter,
        np,
        pd,
        plt,
        roc_curve,
        seasonal_decompose,
        sm,
        sns,
        train_test_split,
    )


@app.cell(hide_code=True)
def _seccion1_titulo(mo):
    mo.md(r"""
    ---
    ## 1. Curva de Lactancia de Wood

    El modelo de Wood describe la producción diaria de leche (kg/día) a lo largo de
    la lactancia: **y = a · t^b · e^(−c·t)**, donde *t* es el día en leche (DEL).
    """)
    return


@app.cell(hide_code=True)
def _wood_mock_data(SEED, np, pd):
    """Mock data: 200 vacas con registros DEL 1-305."""
    np.random.seed(SEED)
    _N_VACAS_WOOD = 200
    _DEL = np.arange(1, 306)  # días en leche

    # Parámetros Wood por vaca (con variabilidad)
    _a_true = np.random.normal(10, 1.5, _N_VACAS_WOOD).clip(5, 18)
    _b_true = np.random.normal(0.22, 0.04, _N_VACAS_WOOD).clip(0.10, 0.40)
    _c_true = np.random.normal(0.003, 0.0005, _N_VACAS_WOOD).clip(0.001, 0.006)

    _filas = []
    for _i in range(_N_VACAS_WOOD):
        _prod = _a_true[_i] * _DEL**_b_true[_i] * np.exp(-_c_true[_i] * _DEL)
        _ruido = np.random.normal(0, 0.5, len(_DEL))
        _prod = (_prod + _ruido).clip(0)
        for _j, _d in enumerate(_DEL):
            _filas.append({"vaca_id": _i, "DEL": _d, "produccion": _prod[_j]})

    df_wood = pd.DataFrame(_filas)
    return (df_wood,)


@app.cell
def _(df_wood):
    df_wood
    return


@app.cell
def _wood_fit(curve_fit, df_wood, np):
    """Ajuste del modelo Wood con curve_fit para cada vaca."""
    def modelo_wood(t, a, b, c):
        return a * t**b * np.exp(-c * t)

    _resultados_wood = []
    for _vid in df_wood["vaca_id"].unique():
        _sub = df_wood[df_wood["vaca_id"] == _vid].sort_values("DEL")
        try:
            _popt, _ = curve_fit(
                modelo_wood, _sub["DEL"].values, _sub["produccion"].values,
                p0=[10, 0.22, 0.003], maxfev=5000,
                bounds=([0.1, 0.01, 0.0001], [30, 1.0, 0.05]),
            )
            _resultados_wood.append({"vaca_id": _vid, "a": _popt[0], "b": _popt[1], "c": _popt[2]})
        except Exception:
            pass

    df_params_wood = df_wood.__class__(_resultados_wood)
    return df_params_wood, modelo_wood


@app.cell
def _wood_plot(df_params_wood, df_wood, modelo_wood, np, plt):
    """Visualización: curva ajustada vs datos reales para 3 vacas ejemplo."""
    _vacas_ejemplo = [0, 10, 50]
    _DEL_line = np.linspace(1, 305, 300)

    _fig_wood, _axes_wood = plt.subplots(1, 3, figsize=(15, 4))
    _fig_wood.suptitle("Curva de Lactancia de Wood — Ajuste vs Datos Reales", fontsize=14, fontweight="bold")

    for _ax, _vid in zip(_axes_wood, _vacas_ejemplo):
        _sub = df_wood[df_wood["vaca_id"] == _vid]
        _params = df_params_wood[df_params_wood["vaca_id"] == _vid]
        if _params.empty:
            continue
        _a, _b, _c = _params.iloc[0][["a", "b", "c"]]
        _y_fit = modelo_wood(_DEL_line, _a, _b, _c)

        _ax.scatter(_sub["DEL"], _sub["produccion"], s=4, alpha=0.4, color="steelblue", label="Datos reales")
        _ax.plot(_DEL_line, _y_fit, color="crimson", linewidth=2, label=f"Wood: a={_a:.2f}, b={_b:.3f}, c={_c:.4f}")
        _ax.set_title(f"Vaca #{_vid}")
        _ax.set_xlabel("DEL (días en leche)")
        _ax.set_ylabel("Producción (kg/día)")
        _ax.legend(fontsize=7)
        _ax.grid(True, alpha=0.3)

    plt.tight_layout()
    _fig_wood
    return


@app.cell(hide_code=True)
def _seccion2_titulo(mo):
    mo.md(r"""
    ---
    ## 2. Predicción del Pico de Lactancia

    Se predicen **t_max** (día del pico) e **y_max** (producción en el pico) usando
    RandomForest y GradientBoosting con variables como número de partos, CMS y raza.
    """)
    return


@app.cell
def _pico_mock_data(SEED, np, pd):
    """Mock data: 300 vacas con features zootécnicas y t_max/y_max."""
    np.random.seed(SEED + 1)
    _N_PICO = 300

    _n_partos = np.random.randint(1, 6, _N_PICO)
    _cms_inicial = np.random.normal(18, 2, _N_PICO).clip(12, 26)  # kg MS/día
    _raza = np.random.choice([0, 1, 2], _N_PICO)  # 0=Holstein, 1=Jersey, 2=Cruza
    _peso_vivo = np.random.normal(550, 60, _N_PICO).clip(380, 750)

    # t_max influenciado por partos y CMS
    _t_max_true = (
        45
        - 3 * (_n_partos - 1)
        + 0.5 * (_cms_inicial - 18)
        + np.random.normal(0, 5, _N_PICO)
    ).clip(20, 80).astype(int)

    # y_max influenciado por peso vivo y CMS
    _y_max_true = (
        25
        + 0.03 * (_peso_vivo - 550)
        + 0.8 * (_cms_inicial - 18)
        + 2 * (_n_partos > 1).astype(float)
        + np.random.normal(0, 2, _N_PICO)
    ).clip(12, 50)

    df_pico = pd.DataFrame({
        "n_partos": _n_partos,
        "cms_inicial": _cms_inicial,
        "raza": _raza,
        "peso_vivo": _peso_vivo,
        "t_max": _t_max_true,
        "y_max": _y_max_true,
    })
    return (df_pico,)


@app.cell
def _pico_modelo(
    GradientBoostingRegressor,
    RandomForestRegressor,
    SEED,
    df_pico,
    train_test_split,
):
    """Entrenamiento RF y GB para predecir t_max e y_max."""
    FEATURES_PICO = ["n_partos", "cms_inicial", "raza", "peso_vivo"]
    _X_pico = df_pico[FEATURES_PICO].values
    _y_tmax = df_pico["t_max"].values
    _y_ymax = df_pico["y_max"].values

    _X_tr, _X_te, _yt_tr, yt_te = train_test_split(_X_pico, _y_tmax, test_size=0.2, random_state=SEED)
    _, _, _yy_tr, yy_te = train_test_split(_X_pico, _y_ymax, test_size=0.2, random_state=SEED)

    _rf_tmax = RandomForestRegressor(n_estimators=100, random_state=SEED)
    _rf_tmax.fit(_X_tr, _yt_tr)

    _gb_ymax = GradientBoostingRegressor(n_estimators=100, random_state=SEED)
    _gb_ymax.fit(_X_tr, _yy_tr)

    yt_pred = _rf_tmax.predict(_X_te)
    yy_pred = _gb_ymax.predict(_X_te)

    importancias_rf = _rf_tmax.feature_importances_
    return FEATURES_PICO, importancias_rf, yt_pred, yt_te, yy_pred, yy_te


@app.cell
def _pico_plot(
    FEATURES_PICO,
    importancias_rf,
    np,
    plt,
    yt_pred,
    yt_te,
    yy_pred,
    yy_te,
):
    """Visualización: feature importance + predicted vs actual."""
    _fig_pico, _axes_pico = plt.subplots(1, 3, figsize=(16, 5))
    _fig_pico.suptitle("Predicción del Pico de Lactancia", fontsize=14, fontweight="bold")

    # Feature importance
    _ax0 = _axes_pico[0]
    _orden = np.argsort(importancias_rf)
    _ax0.barh([FEATURES_PICO[_i] for _i in _orden], importancias_rf[_orden], color="steelblue")
    _ax0.set_title("Importancia de variables (RF → t_max)")
    _ax0.set_xlabel("Importancia")

    # t_max: pred vs actual
    _ax1 = _axes_pico[1]
    _ax1.scatter(yt_te, yt_pred, alpha=0.5, s=20, color="darkorange")
    _lims = [min(yt_te.min(), yt_pred.min()), max(yt_te.max(), yt_pred.max())]
    _ax1.plot(_lims, _lims, "k--", linewidth=1)
    _ax1.set_title("t_max: Predicho vs Real")
    _ax1.set_xlabel("Real (días)")
    _ax1.set_ylabel("Predicho (días)")

    # y_max: pred vs actual
    _ax2 = _axes_pico[2]
    _ax2.scatter(yy_te, yy_pred, alpha=0.5, s=20, color="seagreen")
    _lims2 = [min(yy_te.min(), yy_pred.min()), max(yy_te.max(), yy_pred.max())]
    _ax2.plot(_lims2, _lims2, "k--", linewidth=1)
    _ax2.set_title("y_max: Predicho vs Real")
    _ax2.set_xlabel("Real (kg/día)")
    _ax2.set_ylabel("Predicho (kg/día)")

    plt.tight_layout()
    _fig_pico
    return


@app.cell
def _seccion3_titulo(mo):
    mo.md(r"""
    ---
    ## 3. Persistencia de la Lactancia

    La persistencia mide qué tan sostenida es la producción post-pico. Se calcula la
    pendiente OLS (kg/día²) del período DEL 60–305 por lote nutricional.
    """)
    return


@app.cell
def _persistencia_mock_data(SEED, np, pd):
    """Mock data: 150 vacas en 3 lotes con registros DEL 60-305."""
    np.random.seed(SEED + 2)
    _N_PERS = 150
    _DEL_PERS = np.arange(60, 306)
    _LOTES = ["Alto", "Medio", "Bajo"]

    # Pendiente base por lote (kg/día²) — más negativa = menos persistente
    _pendiente_lote = {"Alto": -0.055, "Medio": -0.075, "Bajo": -0.110}

    _filas_pers = []
    for _i in range(_N_PERS):
        _lote = _LOTES[_i % 3]
        _prod_pico = np.random.normal(28, 4, 1)[0]
        _slope = _pendiente_lote[_lote] + np.random.normal(0, 0.008)
        _prod = _prod_pico + _slope * (_DEL_PERS - 60) + np.random.normal(0, 0.8, len(_DEL_PERS))
        _prod = _prod.clip(0)
        _dias_prenez = np.random.randint(150, 240)
        for _j, _d in enumerate(_DEL_PERS):
            _filas_pers.append({
                "vaca_id": _i, "lote": _lote, "DEL": _d,
                "produccion": _prod[_j], "dias_prenez": _dias_prenez,
            })

    df_pers = pd.DataFrame(_filas_pers)
    return (df_pers,)


@app.cell
def _persistencia_ols(df_pers, pd, sm):
    """OLS por lote para calcular pendiente post-pico."""
    _resultados_ols = []
    for _lote, _grupo in df_pers.groupby("lote"):
        _X_ols = sm.add_constant(_grupo["DEL"].values)
        _modelo_ols = sm.OLS(_grupo["produccion"].values, _X_ols).fit()
        _resultados_ols.append({
            "Lote": _lote,
            "Pendiente (kg/día²)": round(_modelo_ols.params[1], 4),
            "R²": round(_modelo_ols.rsquared, 3),
            "p-valor": round(_modelo_ols.pvalues[1], 4),
        })

    df_persistencia = pd.DataFrame(_resultados_ols)
    return (df_persistencia,)


@app.cell
def _persistencia_plot(df_pers, df_persistencia, plt):
    """Visualización: gráfico de caída por lote + tabla de pendientes."""
    _fig_pers, _axes_pers = plt.subplots(1, 2, figsize=(14, 5))
    _fig_pers.suptitle("Persistencia de la Lactancia por Lote Nutricional", fontsize=14, fontweight="bold")

    _colores_lote = {"Alto": "seagreen", "Medio": "steelblue", "Bajo": "crimson"}

    _ax_l = _axes_pers[0]
    for _lote, _grupo in df_pers.groupby("lote"):
        _medias = _grupo.groupby("DEL")["produccion"].mean()
        _ax_l.plot(_medias.index, _medias.values, label=f"Lote {_lote}", color=_colores_lote[_lote], linewidth=2)
    _ax_l.set_title("Producción media DEL 60–305 por lote")
    _ax_l.set_xlabel("DEL")
    _ax_l.set_ylabel("Producción media (kg/día)")
    _ax_l.legend()
    _ax_l.grid(True, alpha=0.3)

    _ax_r = _axes_pers[1]
    _ax_r.axis("off")
    _tbl_pers = _ax_r.table(
        cellText=df_persistencia.values.tolist(),
        colLabels=df_persistencia.columns.tolist(),
        cellLoc="center", loc="center",
    )
    _tbl_pers.auto_set_font_size(False)
    _tbl_pers.set_fontsize(11)
    _tbl_pers.scale(1.2, 1.8)
    _ax_r.set_title("Pendientes OLS por lote", pad=20)

    plt.tight_layout()
    _fig_pers
    return


@app.cell
def _seccion4_titulo(mo):
    mo.md(r"""
    ---
    ## 4. Alarma de Caída Repentina de Producción

    Se detectan anomalías en la serie temporal AM/PM con **IsolationForest** y
    **descomposición estacional** (statsmodels). Las anomalías se muestran en rojo.
    """)
    return


@app.cell
def _alarma_mock_data(SEED, np, pd):
    """Mock data: serie temporal 365 días con anomalías manuales."""
    np.random.seed(SEED + 3)
    _fechas = pd.date_range("2024-01-01", periods=365, freq="D")

    # Producción base con estacionalidad sinusoidal
    _trend = np.linspace(25, 23, 365)
    _estacionalidad = 2 * np.sin(2 * np.pi * np.arange(365) / 365)
    _ruido_base = np.random.normal(0, 0.5, 365)
    _prod_diaria = _trend + _estacionalidad + _ruido_base

    # Insertar anomalías en 12 días aleatorios
    dias_anomalia = np.random.choice(np.arange(30, 340), size=12, replace=False)
    for _d in dias_anomalia:
        _prod_diaria[_d] -= np.random.uniform(4, 8)  # caída repentina

    df_alarma = pd.DataFrame({"fecha": _fechas, "produccion": _prod_diaria})
    return df_alarma, dias_anomalia


@app.cell
def _alarma_deteccion(
    IsolationForest,
    SEED,
    df_alarma,
    np,
    seasonal_decompose,
):
    """Detección de anomalías con IsolationForest + descomposición estacional."""
    _serie = df_alarma["produccion"].values.reshape(-1, 1)

    # IsolationForest
    _iso = IsolationForest(contamination=0.05, random_state=SEED)
    _etiquetas_iso = _iso.fit_predict(_serie)
    _anomalias_iso = np.where(_etiquetas_iso == -1)[0]

    # Descomposición estacional
    resultado_descomp = seasonal_decompose(
        df_alarma.set_index("fecha")["produccion"],
        model="additive", period=30, extrapolate_trend="freq",
    )
    _residuo = resultado_descomp.resid.fillna(0).values
    _umbral_resid = _residuo.std() * 2.5
    _anomalias_resid = np.where(np.abs(_residuo) > _umbral_resid)[0]

    # Unión de anomalías detectadas
    anomalias_union = np.union1d(_anomalias_iso, _anomalias_resid)
    return anomalias_union, resultado_descomp


@app.cell
def _alarma_plot(
    anomalias_union,
    df_alarma,
    dias_anomalia,
    plt,
    resultado_descomp,
):
    """Visualización: serie temporal con anomalías marcadas en rojo."""
    _fig_alarma, _axes_al = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
    _fig_alarma.suptitle("Alarma de Caída Repentina de Producción", fontsize=14, fontweight="bold")

    _fechas_al = df_alarma["fecha"].values
    _prod_al = df_alarma["produccion"].values

    # Serie con anomalías
    _axes_al[0].plot(_fechas_al, _prod_al, color="steelblue", linewidth=1, label="Producción diaria")
    _axes_al[0].scatter(_fechas_al[anomalias_union], _prod_al[anomalias_union],
                       color="red", s=60, zorder=5, label="Anomalía detectada")
    _axes_al[0].scatter(_fechas_al[dias_anomalia], _prod_al[dias_anomalia],
                       color="orange", s=40, marker="x", linewidths=2, zorder=6, label="Anomalía real")
    _axes_al[0].set_ylabel("Producción (kg/día)")
    _axes_al[0].legend(fontsize=8)
    _axes_al[0].grid(True, alpha=0.3)
    _axes_al[0].set_title("Serie temporal con detección de anomalías")

    # Tendencia
    _axes_al[1].plot(_fechas_al, resultado_descomp.trend.values, color="seagreen", linewidth=1.5)
    _axes_al[1].set_ylabel("Tendencia")
    _axes_al[1].grid(True, alpha=0.3)
    _axes_al[1].set_title("Componente de tendencia")

    # Residuo
    _axes_al[2].bar(_fechas_al, resultado_descomp.resid.fillna(0).values,
                   color="grey", alpha=0.5, width=0.8)
    _axes_al[2].set_ylabel("Residuo")
    _axes_al[2].set_xlabel("Fecha")
    _axes_al[2].grid(True, alpha=0.3)
    _axes_al[2].set_title("Residuo de la descomposición")

    plt.tight_layout()
    _fig_alarma
    return


@app.cell
def _seccion5_titulo(mo):
    mo.md(r"""
    ---
    ## 5. Predicción de Sólidos Útiles (Grasa y Proteína)

    Se simulan espectros MIR (100 longitudes de onda) y se aplica **PLSRegression**
    para predecir % grasa y % proteína de la leche.
    """)
    return


@app.cell
def _pls_mock_data(SEED, np):
    """Mock data: 500 muestras con espectros MIR simulados."""
    np.random.seed(SEED + 4)
    _N_MIR = 500
    _N_WAVE = 100  # longitudes de onda

    # Espectros base (combinaciones lineales de 5 patrones + ruido)
    _patrones = np.random.randn(5, _N_WAVE)
    _coefs_grasa = np.random.randn(5)
    _coefs_prot = np.random.randn(5)

    _pesos = np.random.randn(_N_MIR, 5)
    espectros_mir = _pesos @ _patrones + np.random.randn(_N_MIR, _N_WAVE) * 0.2

    _grasa_real = (_pesos @ _coefs_grasa * 0.5 + 3.8 + np.random.randn(_N_MIR) * 0.15).clip(2.5, 6.0)
    _proteina_real = (_pesos @ _coefs_prot * 0.3 + 3.2 + np.random.randn(_N_MIR) * 0.10).clip(2.5, 4.5)

    Y_mir = np.column_stack([_grasa_real, _proteina_real])
    return Y_mir, espectros_mir


@app.cell
def _pls_modelo(
    PLSRegression,
    SEED,
    Y_mir,
    espectros_mir,
    np,
    train_test_split,
):
    """Ajuste PLSRegression con varianza explicada vs componentes."""
    _X_tr_mir, _X_te_mir, _Y_tr_mir, Y_te_mir = train_test_split(
        espectros_mir, Y_mir, test_size=0.2, random_state=SEED
    )

    _MAX_COMP = 15
    var_exp_list = []
    for _n_comp in range(1, _MAX_COMP + 1):
        _pls_tmp = PLSRegression(n_components=_n_comp)
        _pls_tmp.fit(_X_tr_mir, _Y_tr_mir)
        _Y_pred_tmp = _pls_tmp.predict(_X_te_mir)
        _r2_g = 1 - np.sum((Y_te_mir[:, 0] - _Y_pred_tmp[:, 0])**2) / np.sum((Y_te_mir[:, 0] - Y_te_mir[:, 0].mean())**2)
        _r2_p = 1 - np.sum((Y_te_mir[:, 1] - _Y_pred_tmp[:, 1])**2) / np.sum((Y_te_mir[:, 1] - Y_te_mir[:, 1].mean())**2)
        var_exp_list.append({"n_comp": _n_comp, "R2_grasa": _r2_g, "R2_proteina": _r2_p})

    # Modelo final con 8 componentes
    _pls_final = PLSRegression(n_components=8)
    _pls_final.fit(_X_tr_mir, _Y_tr_mir)
    Y_pred_final = _pls_final.predict(_X_te_mir)
    return Y_pred_final, Y_te_mir, var_exp_list


@app.cell
def _pls_plot(Y_pred_final, Y_te_mir, pd, plt, var_exp_list):
    """Visualización: R² vs componentes + predicted vs actual."""
    _df_var_mir = pd.DataFrame(var_exp_list)

    _fig_pls, _axes_pls = plt.subplots(1, 3, figsize=(16, 5))
    _fig_pls.suptitle("PLS — Predicción de Grasa y Proteína por Espectroscopía MIR", fontsize=13, fontweight="bold")

    _axes_pls[0].plot(_df_var_mir["n_comp"], _df_var_mir["R2_grasa"], "o-", color="gold", label="R² Grasa")
    _axes_pls[0].plot(_df_var_mir["n_comp"], _df_var_mir["R2_proteina"], "s-", color="violet", label="R² Proteína")
    _axes_pls[0].set_title("R² vs N° Componentes PLS")
    _axes_pls[0].set_xlabel("Componentes")
    _axes_pls[0].set_ylabel("R²")
    _axes_pls[0].legend()
    _axes_pls[0].grid(True, alpha=0.3)

    _axes_pls[1].scatter(Y_te_mir[:, 0], Y_pred_final[:, 0], alpha=0.5, s=20, color="gold")
    _lims_g = [min(Y_te_mir[:, 0].min(), Y_pred_final[:, 0].min()), max(Y_te_mir[:, 0].max(), Y_pred_final[:, 0].max())]
    _axes_pls[1].plot(_lims_g, _lims_g, "k--", linewidth=1)
    _axes_pls[1].set_title("Grasa: Predicho vs Real")
    _axes_pls[1].set_xlabel("Real (%)")
    _axes_pls[1].set_ylabel("Predicho (%)")

    _axes_pls[2].scatter(Y_te_mir[:, 1], Y_pred_final[:, 1], alpha=0.5, s=20, color="violet")
    _lims_p = [min(Y_te_mir[:, 1].min(), Y_pred_final[:, 1].min()), max(Y_te_mir[:, 1].max(), Y_pred_final[:, 1].max())]
    _axes_pls[2].plot(_lims_p, _lims_p, "k--", linewidth=1)
    _axes_pls[2].set_title("Proteína: Predicho vs Real")
    _axes_pls[2].set_xlabel("Real (%)")
    _axes_pls[2].set_ylabel("Predicho (%)")

    plt.tight_layout()
    _fig_pls
    return


@app.cell
def _seccion6_titulo(mo):
    mo.md(r"""
    ---
    ## 6. Relación Grasa/Proteína — Riesgo de Cetosis

    Un ratio Grasa/Proteína > 1.4 en la primera fase de lactancia indica riesgo de
    cetosis. Se entrena un clasificador y se grafica la curva ROC.
    """)
    return


@app.cell
def _cetosis_mock_data(SEED, np, pd):
    """Mock data: 400 vacas DEL 5-60 con % grasa, proteína y label cetosis."""
    np.random.seed(SEED + 5)
    _N_CET = 400

    _grasa_cet = np.random.normal(3.8, 0.6, _N_CET).clip(2.0, 7.0)
    _prot_cet = np.random.normal(3.1, 0.3, _N_CET).clip(2.2, 4.5)
    _ratio_gp = _grasa_cet / _prot_cet
    _del_cet = np.random.randint(5, 61, _N_CET)

    # Etiqueta: cetosis si ratio > 1.4 con algo de ruido
    _prob_cetosis = 1 / (1 + np.exp(-(_ratio_gp - 1.4) * 5))
    _cetosis_label = np.random.binomial(1, _prob_cetosis)

    df_cetosis = pd.DataFrame({
        "grasa": _grasa_cet,
        "proteina": _prot_cet,
        "ratio_gp": _ratio_gp,
        "del": _del_cet,
        "cetosis": _cetosis_label,
    })
    return (df_cetosis,)


@app.cell
def _cetosis_modelo(
    LogisticRegression,
    SEED,
    auc,
    df_cetosis,
    roc_curve,
    train_test_split,
):
    """Entrenamiento clasificador y cálculo de curva ROC."""
    _FEATS_CET = ["grasa", "proteina", "ratio_gp", "del"]
    _X_cet = df_cetosis[_FEATS_CET].values
    _y_cet = df_cetosis["cetosis"].values

    _X_tr_cet, _X_te_cet, _y_tr_cet, y_te_cet = train_test_split(_X_cet, _y_cet, test_size=0.25, random_state=SEED)

    _clf_cet = LogisticRegression(max_iter=500, random_state=SEED)
    _clf_cet.fit(_X_tr_cet, _y_tr_cet)

    _y_prob_cet = _clf_cet.predict_proba(_X_te_cet)[:, 1]
    fpr_cet, tpr_cet, _ = roc_curve(y_te_cet, _y_prob_cet)
    auc_cet = auc(fpr_cet, tpr_cet)
    return auc_cet, fpr_cet, tpr_cet


@app.cell
def _cetosis_plot(auc_cet, df_cetosis, fpr_cet, plt, tpr_cet):
    """Visualización: curva ROC + scatter ratio G/P."""
    import matplotlib.patches as _mp
    import matplotlib.lines as _ml

    _fig_cet, _axes_cet = plt.subplots(1, 2, figsize=(13, 5))
    _fig_cet.suptitle("Riesgo de Cetosis — Ratio Grasa/Proteína", fontsize=14, fontweight="bold")

    # Curva ROC
    _axes_cet[0].plot(fpr_cet, tpr_cet, color="darkorange", lw=2, label=f"ROC (AUC = {auc_cet:.3f})")
    _axes_cet[0].plot([0, 1], [0, 1], "k--", lw=1)
    _axes_cet[0].set_xlim([0, 1])
    _axes_cet[0].set_ylim([0, 1.02])
    _axes_cet[0].set_xlabel("Tasa Falsos Positivos")
    _axes_cet[0].set_ylabel("Tasa Verdaderos Positivos")
    _axes_cet[0].set_title("Curva ROC")
    _axes_cet[0].legend(loc="lower right")
    _axes_cet[0].grid(True, alpha=0.3)

    # Scatter ratio G/P
    _colores_cet = df_cetosis["cetosis"].map({0: "steelblue", 1: "crimson"})
    _axes_cet[1].scatter(df_cetosis["del"], df_cetosis["ratio_gp"],
                        c=_colores_cet, alpha=0.5, s=20)
    _axes_cet[1].axhline(1.4, color="black", linestyle="--", linewidth=1.5, label="Umbral 1.4")
    _axes_cet[1].set_xlabel("DEL")
    _axes_cet[1].set_ylabel("Ratio Grasa/Proteína")
    _axes_cet[1].set_title("Ratio G/P por DEL")
    _patch_sano = _mp.Patch(color="steelblue", label="Sin cetosis")
    _patch_cet2 = _mp.Patch(color="crimson", label="Cetosis")
    _linea_umbral = _ml.Line2D([0], [0], color="black", linestyle="--", label="Umbral 1.4")
    _axes_cet[1].legend(handles=[_patch_sano, _patch_cet2, _linea_umbral], fontsize=8)
    _axes_cet[1].grid(True, alpha=0.3)

    plt.tight_layout()
    _fig_cet
    return


@app.cell
def _seccion7_titulo(mo):
    mo.md(r"""
    ---
    ## 7. Conductividad Eléctrica por Cuarto Mamario

    Se filtra la señal de conductividad (mS/cm) con un filtro pasa-bajos Butterworth
    y se detecta mastitis cuando el ratio del cuarto afectado supera el umbral.
    """)
    return


@app.cell
def _conductividad_mock_data(SEED, np, pd):
    """Mock data: señales de conductividad para 4 cuartos, mastitis en DP."""
    np.random.seed(SEED + 6)
    _N_DIAS_COND = 60
    _t_cond = np.arange(_N_DIAS_COND)

    # Conductividad base (mS/cm) ~ 5 para cuartos sanos
    _cond_base = {
        "Izquierdo-Anterior": 5.0 + np.random.normal(0, 0.15, _N_DIAS_COND),
        "Izquierdo-Posterior": 5.1 + np.random.normal(0, 0.15, _N_DIAS_COND),
        "Derecho-Anterior":   4.9 + np.random.normal(0, 0.15, _N_DIAS_COND),
        "Derecho-Posterior":  5.0 + np.random.normal(0, 0.15, _N_DIAS_COND),
    }

    # Simular mastitis en cuarto DP a partir del día 30
    inicio_mastitis = 30
    _cond_base["Derecho-Posterior"][inicio_mastitis:] += (
        np.linspace(0, 2.5, _N_DIAS_COND - inicio_mastitis)
        + np.random.normal(0, 0.2, _N_DIAS_COND - inicio_mastitis)
    )

    df_cond = pd.DataFrame(_cond_base)
    df_cond["dia"] = _t_cond
    return df_cond, inicio_mastitis


@app.cell
def _conductividad_filtro(butter, df_cond, lfilter, np):
    """Filtro pasa-bajos Butterworth + cálculo de ratio de desvío."""
    def butter_lowpass(cutoff, fs, order=4):
        _nyq = 0.5 * fs
        _normal_cutoff = cutoff / _nyq
        _b, _a = butter(order, _normal_cutoff, btype="low", analog=False)
        return _b, _a

    _fs_cond = 1.0   # 1 muestra/día
    _cutoff_cond = 0.1  # frecuencia de corte
    _b_filt, _a_filt = butter_lowpass(_cutoff_cond, _fs_cond)

    cuartos = ["Izquierdo-Anterior", "Izquierdo-Posterior", "Derecho-Anterior", "Derecho-Posterior"]
    senales_filtradas = {}
    for _cuarto in cuartos:
        senales_filtradas[_cuarto] = lfilter(_b_filt, _a_filt, df_cond[_cuarto].values)

    # Ratio: cuarto DP vs media de los otros 3
    _otros = ["Izquierdo-Anterior", "Izquierdo-Posterior", "Derecho-Anterior"]
    _media_otros = np.mean([senales_filtradas[_c] for _c in _otros], axis=0)
    ratio_dp = senales_filtradas["Derecho-Posterior"] / (_media_otros + 1e-6)
    umbral_ratio = 1.10
    alertas_cond = np.where(ratio_dp > umbral_ratio)[0]
    return alertas_cond, cuartos, ratio_dp, senales_filtradas, umbral_ratio


@app.cell
def _conductividad_plot(
    alertas_cond,
    cuartos,
    df_cond,
    inicio_mastitis,
    plt,
    ratio_dp,
    senales_filtradas,
    umbral_ratio,
):
    """Visualización: señales filtradas + ratio con alertas."""
    _fig_cond, _axes_cond = plt.subplots(2, 1, figsize=(13, 9))
    _fig_cond.suptitle("Conductividad Eléctrica por Cuarto Mamario — Detección de Mastitis",
                       fontsize=13, fontweight="bold")

    _colores_cuartos = {
        "Izquierdo-Anterior": "steelblue",
        "Izquierdo-Posterior": "dodgerblue",
        "Derecho-Anterior": "seagreen",
        "Derecho-Posterior": "crimson",
    }

    _dias_cond = df_cond["dia"].values

    for _cuarto in cuartos:
        _lw = 2.5 if _cuarto == "Derecho-Posterior" else 1.5
        _axes_cond[0].plot(_dias_cond, senales_filtradas[_cuarto],
                          label=_cuarto, color=_colores_cuartos[_cuarto], linewidth=_lw)
    _axes_cond[0].axvline(inicio_mastitis, color="black", linestyle="--", linewidth=1.2,
                          label=f"Inicio mastitis (día {inicio_mastitis})")
    _axes_cond[0].set_ylabel("Conductividad filtrada (mS/cm)")
    _axes_cond[0].set_title("Señales de conductividad filtradas")
    _axes_cond[0].legend(fontsize=8)
    _axes_cond[0].grid(True, alpha=0.3)

    _axes_cond[1].plot(_dias_cond, ratio_dp, color="darkorange", linewidth=2, label="Ratio DP/media")
    _axes_cond[1].axhline(umbral_ratio, color="red", linestyle="--", linewidth=1.5, label=f"Umbral {umbral_ratio}")
    if len(alertas_cond) > 0:
        _axes_cond[1].scatter(_dias_cond[alertas_cond], ratio_dp[alertas_cond],
                             color="red", s=60, zorder=5, label="ALERTA")
    _axes_cond[1].set_xlabel("Día")
    _axes_cond[1].set_ylabel("Ratio conductividad")
    _axes_cond[1].set_title("Ratio cuarto Derecho-Posterior vs promedio")
    _axes_cond[1].legend(fontsize=8)
    _axes_cond[1].grid(True, alpha=0.3)

    plt.tight_layout()
    _fig_cond
    return


@app.cell
def _seccion8_titulo(mo):
    mo.md(r"""
    ---
    ## 8. Leche Corregida por Energía (ECM)

    **ECM = Leche × (0.1226 × %Grasa + 0.0776 × %Proteína + 0.249)**

    Permite comparar vacas con diferente composición de leche en términos energéticos.
    """)
    return


@app.cell
def _ecm_mock_data(SEED, np, pd):
    """Mock data: 500 registros con producción kg, % grasa, % proteína."""
    np.random.seed(SEED + 7)
    _N_ECM = 500

    _prod_ecm = np.random.normal(28, 6, _N_ECM).clip(10, 55)
    _grasa_ecm = np.random.normal(3.8, 0.5, _N_ECM).clip(2.5, 6.5)
    _prot_ecm = np.random.normal(3.2, 0.3, _N_ECM).clip(2.3, 4.5)
    _vaca_ids_ecm = np.arange(_N_ECM)

    df_ecm = pd.DataFrame({
        "vaca_id": _vaca_ids_ecm,
        "produccion_kg": _prod_ecm,
        "grasa_pct": _grasa_ecm,
        "proteina_pct": _prot_ecm,
    })

    # Fórmula ECM vectorizada
    df_ecm["ECM"] = df_ecm["produccion_kg"] * (
        0.1226 * df_ecm["grasa_pct"]
        + 0.0776 * df_ecm["proteina_pct"]
        + 0.249
    )
    return (df_ecm,)


@app.cell
def _ecm_plot(df_ecm, plt, sns):
    """Visualización: distribución ECM vs leche + top 10 vacas."""
    _fig_ecm, _axes_ecm = plt.subplots(1, 3, figsize=(17, 5))
    _fig_ecm.suptitle("Leche Corregida por Energía (ECM)", fontsize=14, fontweight="bold")

    # Distribuciones superpuestas
    sns.histplot(df_ecm["produccion_kg"], ax=_axes_ecm[0], color="steelblue",
                 kde=True, bins=30, alpha=0.6, label="Leche real")
    sns.histplot(df_ecm["ECM"], ax=_axes_ecm[0], color="darkorange",
                 kde=True, bins=30, alpha=0.6, label="ECM")
    _axes_ecm[0].set_title("Distribución: Leche real vs ECM")
    _axes_ecm[0].set_xlabel("kg/día")
    _axes_ecm[0].legend()
    _axes_ecm[0].grid(True, alpha=0.3)

    # Scatter
    _axes_ecm[1].scatter(df_ecm["produccion_kg"], df_ecm["ECM"], alpha=0.3, s=15, color="mediumpurple")
    _min_v = min(df_ecm["produccion_kg"].min(), df_ecm["ECM"].min())
    _max_v = max(df_ecm["produccion_kg"].max(), df_ecm["ECM"].max())
    _axes_ecm[1].plot([_min_v, _max_v], [_min_v, _max_v], "k--", linewidth=1, label="y = x")
    _axes_ecm[1].set_title("ECM vs Producción Real")
    _axes_ecm[1].set_xlabel("Producción real (kg/día)")
    _axes_ecm[1].set_ylabel("ECM (kg/día)")
    _axes_ecm[1].legend()
    _axes_ecm[1].grid(True, alpha=0.3)

    # Top 10
    _top10 = df_ecm.nlargest(10, "ECM")[["vaca_id", "produccion_kg", "grasa_pct", "proteina_pct", "ECM"]].reset_index(drop=True)
    _axes_ecm[2].axis("off")
    _tbl_ecm = _axes_ecm[2].table(
        cellText=_top10.round(2).values.tolist(),
        colLabels=["ID", "Prod (kg)", "Grasa %", "Prot %", "ECM"],
        cellLoc="center", loc="center",
    )
    _tbl_ecm.auto_set_font_size(False)
    _tbl_ecm.set_fontsize(9)
    _tbl_ecm.scale(1.2, 1.5)
    _axes_ecm[2].set_title("Top 10 vacas por ECM", pad=20)

    plt.tight_layout()
    _fig_ecm
    return


@app.cell
def _seccion9_titulo(mo):
    mo.md(r"""
    ---
    ## 9. Impacto del Retraso del Ordeñe

    Se analiza cómo el intervalo entre ordeñes (horas) afecta la producción mediante
    regresión OLS con variable dummy para turno AM/PM.
    """)
    return


@app.cell
def _ordene_mock_data(SEED, np, pd):
    """Mock data: 1000 registros con timestamp, intervalo y producción."""
    np.random.seed(SEED + 8)
    _N_ORDENE = 1000

    _turno = np.random.choice(["AM", "PM"], _N_ORDENE)
    _intervalo_h = np.where(
        _turno == "AM",
        np.random.normal(12, 1.5, _N_ORDENE).clip(6, 18),
        np.random.normal(12, 1.8, _N_ORDENE).clip(6, 20),
    )

    # Producción: base 14 kg + 0.4 kg por hour extra, PM produce un poco menos
    _prod_ordene = (
        14
        + 0.4 * (_intervalo_h - 12)
        + np.where(_turno == "PM", -0.4, 0)
        + np.random.normal(0, 1.5, _N_ORDENE)
    ).clip(4)

    df_ordene = pd.DataFrame({
        "turno": _turno,
        "intervalo_h": _intervalo_h,
        "produccion": _prod_ordene,
        "dummy_pm": (_turno == "PM").astype(int),
    })
    return (df_ordene,)


@app.cell
def _ordene_ols(df_ordene, sm):
    """OLS con variable dummy para turno AM/PM."""
    _X_ols_ord = sm.add_constant(df_ordene[["intervalo_h", "dummy_pm"]].values)
    modelo_ordene = sm.OLS(df_ordene["produccion"].values, _X_ols_ord).fit()

    coeficientes_ordene = {
        "Variable": ["Intercepto", "Intervalo (h)", "Turno PM (dummy)"],
        "Coeficiente": modelo_ordene.params.round(4).tolist(),
        "p-valor": modelo_ordene.pvalues.round(4).tolist(),
        "IC 95% inf": modelo_ordene.conf_int()[:, 0].round(4).tolist(),
        "IC 95% sup": modelo_ordene.conf_int()[:, 1].round(4).tolist(),
    }
    return coeficientes_ordene, modelo_ordene


@app.cell
def _ordene_plot(coeficientes_ordene, df_ordene, modelo_ordene, np, pd, plt):
    """Visualización: tabla de coeficientes + scatter intervalo vs producción."""
    _df_coef_ord = pd.DataFrame(coeficientes_ordene)

    _fig_ordene, _axes_ord = plt.subplots(1, 2, figsize=(14, 6))
    _fig_ordene.suptitle("Impacto del Retraso del Ordeñe en la Producción", fontsize=14, fontweight="bold")

    # Tabla de coeficientes
    _axes_ord[0].axis("off")
    _tbl_ord = _axes_ord[0].table(
        cellText=_df_coef_ord.values.tolist(),
        colLabels=_df_coef_ord.columns.tolist(),
        cellLoc="center", loc="center",
    )
    _tbl_ord.auto_set_font_size(False)
    _tbl_ord.set_fontsize(9)
    _tbl_ord.scale(1.3, 2.0)
    _axes_ord[0].set_title(f"Coeficientes OLS (R²={modelo_ordene.rsquared:.3f})", pad=20)

    # Scatter con líneas de regresión por turno
    _colores_ord = {"AM": "steelblue", "PM": "darkorange"}
    for _turno_val in ["AM", "PM"]:
        _mask = df_ordene["turno"] == _turno_val
        _axes_ord[1].scatter(
            df_ordene.loc[_mask, "intervalo_h"], df_ordene.loc[_mask, "produccion"],
            alpha=0.3, s=15, color=_colores_ord[_turno_val], label=_turno_val,
        )

    _x_line = np.linspace(df_ordene["intervalo_h"].min(), df_ordene["intervalo_h"].max(), 100)
    _p = modelo_ordene.params
    for _turno_val, _dummy_val in [("AM", 0), ("PM", 1)]:
        _y_line = _p[0] + _p[1] * _x_line + _p[2] * _dummy_val
        _axes_ord[1].plot(_x_line, _y_line, color=_colores_ord[_turno_val], linewidth=2.5, linestyle="--")

    _axes_ord[1].set_title("Intervalo vs Producción por turno")
    _axes_ord[1].set_xlabel("Intervalo entre ordeñes (h)")
    _axes_ord[1].set_ylabel("Producción (kg)")
    _axes_ord[1].legend()
    _axes_ord[1].grid(True, alpha=0.3)

    plt.tight_layout()
    _fig_ordene
    return


@app.cell
def _seccion10_titulo(mo):
    mo.md(r"""
    ---
    ## 10. Proyección de Entrega de Leche a Planta

    Se usa **Prophet** para proyectar la producción agregada del tambo 90 días hacia
    adelante, capturando tendencia y estacionalidad anual.
    """)
    return


@app.cell
def _prophet_mock_data(SEED, np, pd):
    """Mock data: 2 años de producción agregada diaria con estacionalidad."""
    np.random.seed(SEED + 9)
    _fechas_prophet = pd.date_range("2022-01-01", periods=730, freq="D")
    _t_prop = np.arange(730)

    # Tendencia descendente leve + estacionalidad anual + ruido
    _trend_prop = 3500 - 0.3 * _t_prop
    _estac_prop = 200 * np.sin(2 * np.pi * _t_prop / 365 - np.pi / 2)
    _ruido_prop = np.random.normal(0, 50, 730)
    _prod_prop = (_trend_prop + _estac_prop + _ruido_prop).clip(2500)

    df_prophet_input = pd.DataFrame({"ds": _fechas_prophet, "y": _prod_prop})
    return (df_prophet_input,)


@app.cell
def _prophet_modelo(df_prophet_input, np, pd):
    """Ajuste del modelo Prophet y forecast 90 días (con fallback si prophet no está instalado)."""
    try:
        from prophet import Prophet as _Prophet
        _model = _Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.90,
        )
        _model.fit(df_prophet_input)
        _future = _model.make_future_dataframe(periods=90)
        df_forecast_prophet = _model.predict(_future)
        prophet_ok = True
    except ImportError:
        # Fallback: extrapolación simple sin Prophet
        _last_date = df_prophet_input["ds"].max()
        _future_dates = pd.date_range(_last_date + pd.Timedelta("1D"), periods=90)
        _all_dates = pd.concat(
            [df_prophet_input["ds"], pd.Series(_future_dates)], ignore_index=True
        )
        _n_all = len(_all_dates)
        _t_all = np.arange(_n_all)
        _yhat = 3500 - 0.3 * _t_all + 200 * np.sin(2 * np.pi * _t_all / 365 - np.pi / 2)
        _yhat_lower = _yhat - 150
        _yhat_upper = _yhat + 150
        df_forecast_prophet = pd.DataFrame({
            "ds": _all_dates,
            "yhat": _yhat,
            "yhat_lower": _yhat_lower,
            "yhat_upper": _yhat_upper,
        })
        prophet_ok = False
    return df_forecast_prophet, prophet_ok


@app.cell
def _prophet_plot(df_forecast_prophet, df_prophet_input, plt, prophet_ok):
    """Visualización: forecast Prophet con intervalos de confianza."""
    _fig_prophet, _ax_prophet = plt.subplots(figsize=(14, 6))

    _titulo_prophet = "Proyección de Entrega de Leche a Planta — Prophet (90 días)"
    if not prophet_ok:
        _titulo_prophet += "  [FALLBACK — instalar prophet para usar el modelo real]"
    _fig_prophet.suptitle(_titulo_prophet, fontsize=12, fontweight="bold")

    # Datos históricos
    _ax_prophet.scatter(df_prophet_input["ds"], df_prophet_input["y"],
                       s=5, alpha=0.5, color="steelblue", label="Producción histórica")

    # Forecast
    _df_fc = df_forecast_prophet
    _ax_prophet.plot(_df_fc["ds"], _df_fc["yhat"], color="crimson", linewidth=2, label="Predicción (yhat)")
    _ax_prophet.fill_between(_df_fc["ds"], _df_fc["yhat_lower"], _df_fc["yhat_upper"],
                             alpha=0.25, color="crimson", label="IC 90%")

    # Línea de separación histórico/forecast
    _fecha_corte = df_prophet_input["ds"].max()
    _ax_prophet.axvline(_fecha_corte, color="black", linestyle="--", linewidth=1.5, label="Inicio forecast")

    _ax_prophet.set_xlabel("Fecha")
    _ax_prophet.set_ylabel("Producción (litros/día)")
    _ax_prophet.legend(fontsize=9)
    _ax_prophet.grid(True, alpha=0.3)

    plt.tight_layout()
    _fig_prophet
    return


@app.cell
def _resumen(mo):
    mo.md(r"""
    ---
    ## Resumen del Módulo I

    | # | Sección | Método principal |
    |---|---------|-----------------|
    | 1 | Curva de Lactancia de Wood | `scipy.optimize.curve_fit` |
    | 2 | Predicción del Pico | `RandomForest` + `GradientBoosting` |
    | 3 | Persistencia de la Lactancia | OLS (`statsmodels`) |
    | 4 | Alarma de Caída Repentina | `IsolationForest` + descomposición estacional |
    | 5 | Predicción de Sólidos Útiles (MIR) | `PLSRegression` |
    | 6 | Riesgo de Cetosis | Regresión logística + curva ROC |
    | 7 | Conductividad por Cuarto | Filtro Butterworth + ratio de desvío |
    | 8 | Leche Corregida por Energía (ECM) | Fórmula vectorizada pandas/numpy |
    | 9 | Impacto del Retraso del Ordeñe | OLS con dummies de turno |
    | 10 | Proyección a Planta | Prophet (forecast 90 días) |

    > Todos los datos son **mock data** generados con `numpy`/`pandas`. No se requieren datos externos.
    """)
    return


if __name__ == "__main__":
    app.run()
