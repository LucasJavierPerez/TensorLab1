import marimo

__generated_with = "0.23.1"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _(mo):
    mo.md(r"""
    # Módulo II: Nutrición, Alimentación y Eficiencia de Conversión
    """)
    return


@app.cell
def _():
    # Imports globales
    import numpy as np
    import pandas as pd
    import matplotlib.pyplot as plt
    import matplotlib.gridspec as gridspec
    import warnings
    warnings.filterwarnings("ignore")

    # Scipy
    from scipy.optimize import minimize, curve_fit
    from scipy.stats import ttest_ind, f_oneway

    # Scikit-learn
    from sklearn.linear_model import Ridge, LinearRegression
    from sklearn.ensemble import IsolationForest
    from sklearn.tree import DecisionTreeClassifier, plot_tree
    from sklearn.svm import SVR
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import r2_score

    # Statsmodels
    from statsmodels.tsa.arima.model import ARIMA

    # PuLP
    import pulp

    # XGBoost
    import xgboost as xgb

    # Semilla global
    RNG = np.random.default_rng(42)
    return (
        ARIMA,
        DecisionTreeClassifier,
        IsolationForest,
        LinearRegression,
        RNG,
        Ridge,
        SVR,
        StandardScaler,
        curve_fit,
        f_oneway,
        minimize,
        np,
        pd,
        plot_tree,
        plt,
        pulp,
        r2_score,
        ttest_ind,
        xgb,
    )


@app.cell
def _(mo):
    mo.md(r"""
    ## 1. Cálculo Automático del Consumo de Materia Seca (CMS)
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 200 vacas
    _n_vacas = 200
    _pv = RNG.normal(580, 50, _n_vacas)          # Peso Vivo (kg)
    _del_ = RNG.integers(5, 280, _n_vacas)        # Días en Leche
    _ecm = RNG.normal(28, 6, _n_vacas)            # Producción ECM (kg/día)
    _ecm = np.clip(_ecm, 8, 55)

    # Composición del mixer (% MS)
    df_vacas = pd.DataFrame({
        "ID_Vaca": range(1, _n_vacas + 1),
        "PV_kg": _pv,
        "DEL": _del_,
        "ECM_kgd": _ecm,
        "pct_silo_maiz": RNG.normal(35, 3, _n_vacas),
        "pct_heno": RNG.normal(15, 2, _n_vacas),
        "pct_concentrado": RNG.normal(30, 4, _n_vacas),
        "pct_grano": RNG.normal(20, 3, _n_vacas),
    })

    # CMS teórico NRC 2001: CMS = (0.372*ECM + 0.0968*PV^0.75) * (1 - exp(-0.192*(DEL/7 + 3.67)))
    _pv075 = df_vacas["PV_kg"] ** 0.75
    _factor_del = 1 - np.exp(-0.192 * (df_vacas["DEL"] / 7 + 3.67))
    df_vacas["CMS_teorico"] = (0.372 * df_vacas["ECM_kgd"] + 0.0968 * _pv075) * _factor_del

    # CMS real: teórico + ruido + efecto mixer
    df_vacas["CMS_real"] = df_vacas["CMS_teorico"] * RNG.normal(1.0, 0.07, _n_vacas)
    df_vacas["CMS_real"] = np.clip(df_vacas["CMS_real"], 8, 35)
    return (df_vacas,)


@app.cell
def _(Ridge, df_vacas, minimize, np, pd):
    # Optimización ruminal con scipy.optimize.minimize
    # Objetivo: minimizar desvío respecto al CMS teórico sujeto a restricciones de FDN
    def _objetivo_ruminal(x, cms_teo):
        """x[0] = ajuste escala, x[1] = offset; minimiza suma cuadrados"""
        _cms_pred = x[0] * cms_teo + x[1]
        return np.sum((_cms_pred - df_vacas["CMS_real"]) ** 2)

    _resultado = minimize(
        _objetivo_ruminal,
        x0=[1.0, 0.0],
        args=(df_vacas["CMS_teorico"].values,),
        method="Nelder-Mead",
    )
    _escala_opt, _offset_opt = _resultado.x

    # Ridge regression: ajustar desvío teórico vs real
    _features_ridge = df_vacas[["PV_kg", "DEL", "ECM_kgd",
                                "pct_silo_maiz", "pct_heno",
                                "pct_concentrado", "pct_grano"]].values
    _target_ridge = (df_vacas["CMS_real"] - df_vacas["CMS_teorico"]).values

    _ridge_model = Ridge(alpha=1.0)
    _ridge_model.fit(_features_ridge, _target_ridge)
    _coef_names = ["PV_kg", "DEL", "ECM_kgd", "pct_silo_maiz",
                  "pct_heno", "pct_concentrado", "pct_grano"]
    coef_df = pd.DataFrame({
        "Variable": _coef_names,
        "Coeficiente_Ridge": _ridge_model.coef_
    }).sort_values("Coeficiente_Ridge", key=abs, ascending=False)

    _desvio = df_vacas["CMS_real"] - df_vacas["CMS_teorico"]
    desvio_pct = (_desvio / df_vacas["CMS_teorico"]) * 100
    return coef_df, desvio_pct


@app.cell
def _(coef_df, desvio_pct, df_vacas, plt):
    _fig1, _axes1 = plt.subplots(1, 3, figsize=(16, 5))
    _fig1.suptitle("CMS: Teórico vs Real — NRC/NASEM + Ridge", fontsize=13, fontweight="bold")

    # Scatter teórico vs real
    _ax = _axes1[0]
    _ax.scatter(df_vacas["CMS_teorico"], df_vacas["CMS_real"],
               alpha=0.5, color="steelblue", s=20)
    _lim = [df_vacas["CMS_teorico"].min() - 1, df_vacas["CMS_teorico"].max() + 1]
    _ax.plot(_lim, _lim, "r--", lw=1.5, label="1:1")
    _ax.set_xlabel("CMS Teórico (kg MS/día)")
    _ax.set_ylabel("CMS Real (kg MS/día)")
    _ax.set_title("Teórico vs Real")
    _ax.legend()

    # Histograma de desvío %
    _ax2 = _axes1[1]
    _ax2.hist(desvio_pct, bins=25, color="coral", edgecolor="white")
    _ax2.axvline(0, color="black", lw=1.5, linestyle="--")
    _ax2.set_xlabel("Desvío (%)")
    _ax2.set_ylabel("Frecuencia")
    _ax2.set_title("Distribución del Desvío CMS")

    # Coeficientes Ridge
    _ax3 = _axes1[2]
    _colors = ["green" if _c > 0 else "red" for _c in coef_df["Coeficiente_Ridge"]]
    _ax3.barh(coef_df["Variable"], coef_df["Coeficiente_Ridge"], color=_colors)
    _ax3.axvline(0, color="black", lw=1)
    _ax3.set_title("Coeficientes Ridge\n(desvío teórico-real)")
    _ax3.set_xlabel("Coeficiente")

    plt.tight_layout()
    _fig1
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 2. Desvío en la Carga del Mixer (TMR)
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 500 registros de carga
    _n_cargas = 500
    operarios = ["Op_A", "Op_B", "Op_C", "Op_D", "Op_E"]
    _mixers = ["Mixer_1", "Mixer_2", "Mixer_3"]

    _id_operario = RNG.choice(operarios, _n_cargas)
    _id_mixer = RNG.choice(_mixers, _n_cargas)

    # Receta teórica con distribución realista
    _receta_teo = RNG.normal(1500, 200, _n_cargas)

    # Sesgo por operario (Op_C tiene sesgo sistemático +5%)
    _sesgo_op = {"Op_A": 0.0, "Op_B": 0.02, "Op_C": 0.05, "Op_D": -0.01, "Op_E": 0.03}
    _sesgo_arr = np.array([_sesgo_op[_op] for _op in _id_operario])
    _ruido = RNG.normal(0, 30, _n_cargas)
    _receta_real = _receta_teo * (1 + _sesgo_arr) + _ruido

    df_tmr = pd.DataFrame({
        "ID_Carga": range(1, _n_cargas + 1),
        "ID_Operario": _id_operario,
        "ID_Mixer": _id_mixer,
        "Receta_Teo_kg": _receta_teo,
        "Receta_Real_kg": _receta_real,
        "Desvio_kg": _receta_real - _receta_teo,
        "Desvio_pct": (_receta_real - _receta_teo) / _receta_teo * 100,
    })
    return df_tmr, operarios


@app.cell
def _(df_tmr, f_oneway, operarios, pd, ttest_ind):
    # ANOVA por operario
    _grupos = [df_tmr[df_tmr["ID_Operario"] == _op]["Desvio_pct"].values for _op in operarios]
    _stat_anova, _p_anova = f_oneway(*_grupos)

    # t-test Op_C vs resto
    _desv_opc = df_tmr[df_tmr["ID_Operario"] == "Op_C"]["Desvio_pct"].values
    _desv_resto = df_tmr[df_tmr["ID_Operario"] != "Op_C"]["Desvio_pct"].values
    _t_stat, _p_ttest = ttest_ind(_desv_opc, _desv_resto)

    # Tabla resumen por operario
    resumen_op = df_tmr.groupby("ID_Operario")["Desvio_pct"].agg(
        ["mean", "std", "count"]
    ).rename(columns={"mean": "Desvío_medio_%", "std": "SD_%", "count": "N"})
    resumen_op["p_vs_resto"] = [
        round(ttest_ind(
            df_tmr[df_tmr["ID_Operario"] == _op]["Desvio_pct"].values,
            df_tmr[df_tmr["ID_Operario"] != _op]["Desvio_pct"].values
        )[1], 4)
        for _op in resumen_op.index
    ]

    tabla_anova = pd.DataFrame({
        "Test": ["ANOVA (todos los operarios)", "t-test Op_C vs Resto"],
        "Estadístico": [round(_stat_anova, 3), round(_t_stat, 3)],
        "p-value": [round(_p_anova, 4), round(_p_ttest, 4)],
        "Significativo": [_p_anova < 0.05, _p_ttest < 0.05],
    })
    return (tabla_anova,)


@app.cell
def _(df_tmr, operarios, plt, tabla_anova):
    _fig2, _axes2 = plt.subplots(1, 2, figsize=(14, 6))
    _fig2.suptitle("Desvío en Carga del Mixer (TMR)", fontsize=13, fontweight="bold")

    # Boxplot por operario
    _ax21 = _axes2[0]
    _data_box = [df_tmr[df_tmr["ID_Operario"] == _op]["Desvio_pct"].values for _op in operarios]
    _bp = _ax21.boxplot(_data_box, labels=operarios, patch_artist=True,
                      medianprops=dict(color="black", lw=2))
    _colors_box = ["#4FC3F7", "#81C784", "#FF8A65", "#BA68C8", "#FFD54F"]
    for _patch, _color in zip(_bp["boxes"], _colors_box):
        _patch.set_facecolor(_color)
    _ax21.axhline(0, color="red", linestyle="--", lw=1.5, label="Sin desvío")
    _ax21.set_ylabel("Desvío (%)")
    _ax21.set_title("Distribución de Desvíos por Operario")
    _ax21.legend()

    # Tabla ANOVA
    _ax22 = _axes2[1]
    _ax22.axis("off")
    _tbl_data = [tabla_anova.columns.tolist()] + tabla_anova.values.tolist()
    _tbl = _ax22.table(cellText=tabla_anova.values, colLabels=tabla_anova.columns,
                     loc="center", cellLoc="center")
    _tbl.auto_set_font_size(False)
    _tbl.set_fontsize(10)
    _tbl.scale(1.2, 2.0)
    _ax22.set_title("Resultados ANOVA / t-test", fontweight="bold", pad=20)

    plt.tight_layout()
    _fig2
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 3. Eficiencia de Conversión Alimenticia (ECA)
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 50 lotes
    _n_lotes = 50
    _ecm_lote = RNG.normal(27, 5, _n_lotes)
    _ecm_lote = np.clip(_ecm_lote, 10, 45)
    _cms_lote = RNG.normal(22, 3, _n_lotes)
    _cms_lote = np.clip(_cms_lote, 12, 32)
    _precio_leche = RNG.normal(0.38, 0.03, _n_lotes)   # USD/kg
    _costo_insumos = RNG.normal(7.5, 1.0, _n_lotes)     # USD/vaca/día

    _eca = _ecm_lote / _cms_lote
    _iofc = _ecm_lote * _precio_leche - _costo_insumos     # IOFC USD/vaca/día

    df_lotes = pd.DataFrame({
        "ID_Lote": [f"L{_i:02d}" for _i in range(1, _n_lotes + 1)],
        "ECM_kgd": _ecm_lote,
        "CMS_kgd": _cms_lote,
        "Precio_Leche": _precio_leche,
        "Costo_Insumos": _costo_insumos,
        "ECA": _eca,
        "IOFC": _iofc,
    })

    # Top 5 y Bottom 5 por ECA
    top5_eca = df_lotes.nlargest(5, "ECA")[["ID_Lote", "ECA", "IOFC", "ECM_kgd", "CMS_kgd"]]
    bot5_eca = df_lotes.nsmallest(5, "ECA")[["ID_Lote", "ECA", "IOFC", "ECM_kgd", "CMS_kgd"]]
    return bot5_eca, df_lotes, top5_eca


@app.cell
def _(LinearRegression, df_lotes, np, r2_score):
    # Regresión Lineal ECA ~ IOFC
    _X_eca = df_lotes["ECA"].values.reshape(-1, 1)
    _y_iofc = df_lotes["IOFC"].values
    _lr_iofc = LinearRegression()
    _lr_iofc.fit(_X_eca, _y_iofc)
    _iofc_pred = _lr_iofc.predict(_X_eca)
    r2_iofc = r2_score(_y_iofc, _iofc_pred)
    x_line = np.linspace(df_lotes["ECA"].min(), df_lotes["ECA"].max(), 100).reshape(-1, 1)
    y_line = _lr_iofc.predict(x_line)
    return r2_iofc, x_line, y_line


@app.cell
def _(bot5_eca, df_lotes, plt, r2_iofc, top5_eca, x_line, y_line):
    _fig3, _axes3 = plt.subplots(1, 2, figsize=(14, 6))
    _fig3.suptitle("Eficiencia de Conversión Alimenticia (ECA) e IOFC", fontsize=13, fontweight="bold")

    # Scatter ECA vs IOFC
    _ax31 = _axes3[0]
    _scatter_col = df_lotes["ECA"]
    _sc = _ax31.scatter(df_lotes["ECA"], df_lotes["IOFC"],
                      c=_scatter_col, cmap="RdYlGn", s=60, alpha=0.8)
    _ax31.plot(x_line, y_line, "b--", lw=1.5, label=f"Regresión (R²={r2_iofc:.2f})")
    # Marcar top/bottom
    for _, _row in top5_eca.iterrows():
        _ax31.annotate(_row["ID_Lote"], (_row["ECA"], _row["IOFC"]),
                      fontsize=7, color="darkgreen")
    for _, _row in bot5_eca.iterrows():
        _ax31.annotate(_row["ID_Lote"], (_row["ECA"], _row["IOFC"]),
                      fontsize=7, color="darkred")
    plt.colorbar(_sc, ax=_ax31, label="ECA")
    _ax31.set_xlabel("ECA (kg ECM / kg MS)")
    _ax31.set_ylabel("IOFC (USD/vaca/día)")
    _ax31.set_title("ECA vs IOFC por Lote")
    _ax31.legend(fontsize=8)

    # Tabla top/bottom
    _ax32 = _axes3[1]
    _ax32.axis("off")
    _combined = top5_eca.copy()
    _combined["Grupo"] = "Top 5"
    _bot_copy = bot5_eca.copy()
    _bot_copy["Grupo"] = "Bottom 5"
    import pandas as _pd2
    _tabla_lotes = _pd2.concat([_combined, _bot_copy])
    _tabla_lotes = _tabla_lotes[["Grupo", "ID_Lote", "ECA", "IOFC"]].round(3)
    _tbl3 = _ax32.table(cellText=_tabla_lotes.values, colLabels=_tabla_lotes.columns,
                      loc="center", cellLoc="center")
    _tbl3.auto_set_font_size(False)
    _tbl3.set_fontsize(9)
    _tbl3.scale(1.2, 1.8)
    _ax32.set_title("Top / Bottom 5 Lotes por ECA", fontweight="bold", pad=20)

    plt.tight_layout()
    _fig3
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 4. Variabilidad en el Remanente de Comedero (Rechazo)
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 365 días
    _n_dias = 365
    _fechas = pd.date_range("2024-01-01", periods=_n_dias, freq="D")

    # kg ofrecidos con estacionalidad
    _tendencia = np.linspace(2000, 2200, _n_dias)
    _estacional = 100 * np.sin(2 * np.pi * np.arange(_n_dias) / 365)
    _kg_ofrecidos = _tendencia + _estacional + RNG.normal(0, 50, _n_dias)
    _kg_ofrecidos = np.clip(_kg_ofrecidos, 1500, 2800)

    # % rechazo objetivo 3-5%; real con variabilidad
    _pct_rechazo_base = 4.0
    _ruido_rechazo = RNG.normal(0, 1.5, _n_dias)
    _pct_rechazo = _pct_rechazo_base + _ruido_rechazo + 2 * np.sin(2 * np.pi * np.arange(_n_dias) / 30)
    _pct_rechazo = np.clip(_pct_rechazo, 0.5, 15)

    _kg_rechazados = _kg_ofrecidos * _pct_rechazo / 100
    _animales_corral = RNG.integers(80, 120, _n_dias)

    df_rechazo = pd.DataFrame({
        "Fecha": _fechas,
        "KgOfrecidos": _kg_ofrecidos,
        "KgRechazados": _kg_rechazados,
        "PctRechazo": _pct_rechazo,
        "Animales": _animales_corral,
    }).set_index("Fecha")
    return (df_rechazo,)


@app.cell
def _(ARIMA, df_rechazo):
    # ARIMA para predecir rechazo
    _serie_arima = df_rechazo["PctRechazo"].values
    _modelo_arima = ARIMA(_serie_arima, order=(2, 1, 2))
    _fit_arima = _modelo_arima.fit()
    n_forecast = 30
    _forecast_res = _fit_arima.get_forecast(steps=n_forecast)
    forecast_mean = _forecast_res.predicted_mean
    forecast_ci = _forecast_res.conf_int(alpha=0.05)
    return forecast_ci, forecast_mean, n_forecast


@app.cell
def _(df_rechazo, forecast_ci, forecast_mean, n_forecast, pd, plt):
    _fig4, _ax41 = plt.subplots(figsize=(15, 5))
    _fig4.suptitle("Rechazo de Comedero: Serie Temporal + Forecast ARIMA", fontsize=13, fontweight="bold")

    # Serie histórica
    _ax41.plot(df_rechazo.index, df_rechazo["PctRechazo"],
              color="steelblue", lw=0.8, alpha=0.7, label="Rechazo real (%)")
    _ax41.fill_between(df_rechazo.index, 3, 5, alpha=0.15, color="green", label="Banda objetivo (3-5%)")
    _ax41.axhline(3, color="green", lw=1, linestyle="--")
    _ax41.axhline(5, color="green", lw=1, linestyle="--")

    # Forecast
    _ultimo_idx = df_rechazo.index[-1]
    _fechas_fc = pd.date_range(_ultimo_idx, periods=n_forecast + 1, freq="D")[1:]
    _ax41.plot(_fechas_fc, forecast_mean, color="darkorange", lw=2, label="Forecast ARIMA")
    _ax41.fill_between(_fechas_fc,
                      forecast_ci[:, 0], forecast_ci[:, 1],
                      color="orange", alpha=0.3, label="IC 95%")

    _ax41.set_xlabel("Fecha")
    _ax41.set_ylabel("Rechazo (%)")
    _ax41.legend(fontsize=9)
    _ax41.set_xlim(df_rechazo.index[0], _fechas_fc[-1])

    plt.tight_layout()
    _fig4
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 5. Cinética de Degradación de la Fibra (FDN)
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 30 muestras con tiempos 30h, 120h, 240h
    n_muestras = 30
    tiempos_inc = np.array([0, 30, 120, 240])  # horas de incubación

    # Parámetros verdaderos por muestra
    _FDNp_true = RNG.uniform(40, 65, n_muestras)  # FDN potencialmente degradable (%)
    _FDNi_true = RNG.uniform(10, 25, n_muestras)  # FDN indigestible (%)
    _kd_true = RNG.uniform(0.02, 0.08, n_muestras)  # tasa de degradación (1/h)
    _kp_true = RNG.uniform(0.03, 0.06, n_muestras)  # tasa de pasaje (1/h)

    # Generar datos observados: FDNd = FDNp * (1 - exp(-kd*t)) + FDNi
    _datos_fdn = []
    for _i in range(n_muestras):
        for _t in tiempos_inc:
            _fdn_obs = (_FDNp_true[_i] * (1 - np.exp(-_kd_true[_i] * _t)) + _FDNi_true[_i]
                       + RNG.normal(0, 1.5))
            _datos_fdn.append({
                "ID_Muestra": _i + 1,
                "Tiempo_h": _t,
                "FDNd_obs": np.clip(_fdn_obs, 0, 100),
                "kp_est": _kp_true[_i],
            })

    df_fdn = pd.DataFrame(_datos_fdn)
    return df_fdn, n_muestras


@app.cell
def _(curve_fit, df_fdn, n_muestras, np, pd):
    # Ajuste curve_fit para cada muestra
    def modelo_fdn(t, FDNp, kd, FDNi):
        return FDNp * (1 - np.exp(-kd * t)) + FDNi

    _params_ajuste = []
    for _muestra_id in range(1, n_muestras + 1):
        _sub = df_fdn[df_fdn["ID_Muestra"] == _muestra_id].sort_values("Tiempo_h")
        _t_obs = _sub["Tiempo_h"].values.astype(float)
        _y_obs = _sub["FDNd_obs"].values
        try:
            _popt, _ = curve_fit(
                modelo_fdn, _t_obs, _y_obs,
                p0=[50, 0.04, 15],
                bounds=([0, 0.001, 0], [100, 0.5, 50]),
                maxfev=5000,
            )
            _params_ajuste.append({
                "ID_Muestra": _muestra_id,
                "FDNp_adj": round(_popt[0], 2),
                "kd_adj": round(_popt[1], 4),
                "FDNi_adj": round(_popt[2], 2),
            })
        except Exception:
            pass

    df_params_fdn = pd.DataFrame(_params_ajuste)
    t_curva = np.linspace(0, 250, 200)
    return df_params_fdn, modelo_fdn, t_curva


@app.cell
def _(df_params_fdn, modelo_fdn, plt, t_curva):
    _fig5, _axes5 = plt.subplots(1, 2, figsize=(14, 6))
    _fig5.suptitle("Cinética de Degradación de la Fibra (FDN)", fontsize=13, fontweight="bold")

    # Curvas de degradación (primeras 8 muestras)
    _ax51 = _axes5[0]
    _cmap5 = plt.cm.tab10
    for _idx5, _row5 in df_params_fdn.head(8).iterrows():
        _y_curva = modelo_fdn(t_curva, _row5["FDNp_adj"], _row5["kd_adj"], _row5["FDNi_adj"])
        _ax51.plot(t_curva, _y_curva,
                  label=f"M{int(_row5['ID_Muestra'])} kd={_row5['kd_adj']:.3f}",
                  color=_cmap5(_idx5 % 10), lw=1.5)
    _ax51.set_xlabel("Tiempo de incubación (h)")
    _ax51.set_ylabel("FDN degradada (%)")
    _ax51.set_title("Curvas Cinéticas Ajustadas")
    _ax51.legend(fontsize=7, ncol=2)

    # Histograma kd
    _ax52 = _axes5[1]
    _ax52.hist(df_params_fdn["kd_adj"], bins=15, color="teal", edgecolor="white")
    _ax52.axvline(df_params_fdn["kd_adj"].mean(), color="red", lw=2,
                 linestyle="--", label=f"Media kd={df_params_fdn['kd_adj'].mean():.4f}")
    _ax52.set_xlabel("kd (h⁻¹)")
    _ax52.set_ylabel("Frecuencia")
    _ax52.set_title("Distribución de Tasas de Degradación kd")
    _ax52.legend()

    plt.tight_layout()
    _fig5
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 6. Monitoreo del Tiempo de Rumia
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 180 días, 50 vacas
    _n_dias_rumia = 180
    _n_vacas_rumia = 50
    _fechas_rumia = pd.date_range("2024-01-01", periods=_n_dias_rumia, freq="D")

    # Rumia base normal (min/día)
    rumia_base = RNG.normal(490, 40, (_n_dias_rumia, _n_vacas_rumia))

    # Insertar anomalías (caídas de salud ~15 eventos)
    for _ in range(15):
        _dia_an = RNG.integers(0, _n_dias_rumia)
        _vaca_an = RNG.integers(0, _n_vacas_rumia)
        _duracion = RNG.integers(1, 4)
        for _d in range(_duracion):
            if _dia_an + _d < _n_dias_rumia:
                rumia_base[_dia_an + _d, _vaca_an] -= RNG.uniform(150, 250)

    rumia_base = np.clip(rumia_base, 100, 700)

    # Promedio diario del hato
    _rumia_media_diaria = rumia_base.mean(axis=1)

    df_rumia = pd.DataFrame({
        "Fecha": _fechas_rumia,
        "Rumia_Media_min": _rumia_media_diaria,
        "Rumia_SD": rumia_base.std(axis=1),
    }).set_index("Fecha")

    # Datos individuales para IsolationForest
    _rumia_flat = rumia_base.flatten().reshape(-1, 1)
    return (df_rumia,)


@app.cell
def _(IsolationForest, StandardScaler, df_rumia):
    # IsolationForest sobre promedios diarios con ventana móvil
    _scaler_rumia = StandardScaler()
    _X_rumia = df_rumia[["Rumia_Media_min"]].values
    _X_rumia_sc = _scaler_rumia.fit_transform(_X_rumia)

    _iso_forest = IsolationForest(contamination=0.08, random_state=42)
    _iso_forest.fit(_X_rumia_sc)
    _anomalias_pred = _iso_forest.predict(_X_rumia_sc)  # -1 = anomalía

    # Media móvil 7 días
    df_rumia["Media_movil_7d"] = df_rumia["Rumia_Media_min"].rolling(7, min_periods=1).mean()
    df_rumia["Anomalia"] = _anomalias_pred == -1

    n_anomalias = int(df_rumia["Anomalia"].sum())
    return (n_anomalias,)


@app.cell
def _(df_rumia, n_anomalias, plt):
    _fig6, _ax61 = plt.subplots(figsize=(15, 5))
    _fig6.suptitle("Monitoreo del Tiempo de Rumia — IsolationForest", fontsize=13, fontweight="bold")

    _ax61.plot(df_rumia.index, df_rumia["Rumia_Media_min"],
              color="steelblue", lw=1, alpha=0.6, label="Rumia media diaria")
    _ax61.plot(df_rumia.index, df_rumia["Media_movil_7d"],
              color="navy", lw=2, label="Media móvil 7d")
    _ax61.axhline(400, color="red", lw=1.5, linestyle="--", label="Umbral crítico (400 min)")

    # Marcar anomalías
    _anom_df = df_rumia[df_rumia["Anomalia"]]
    _ax61.scatter(_anom_df.index, _anom_df["Rumia_Media_min"],
                 color="red", zorder=5, s=60, label=f"Anomalías detectadas (n={n_anomalias})")

    _ax61.set_xlabel("Fecha")
    _ax61.set_ylabel("Minutos de rumia / día")
    _ax61.legend(fontsize=9)
    _ax61.fill_between(df_rumia.index, 0, 400, alpha=0.05, color="red")

    plt.tight_layout()
    _fig6
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 7. Optimización de la Cadena Forrajera
    """)
    return


@app.cell
def _(np, pd):
    # Mock data: 6 cultivos
    cultivos = ["Maíz Silaje", "Sorgo Silaje", "Alfalfa", "Raigrás", "Avena", "Maíz Grano Húmedo"]
    hectareas_max = np.array([200, 150, 100, 80, 120, 60])
    rendimiento_ms = np.array([12.5, 8.0, 9.5, 6.0, 4.5, 7.0])  # ton MS/ha
    costo_implant = np.array([850, 600, 700, 450, 350, 900])       # USD/ha
    aptitud_suelo = np.array([1.0, 0.9, 0.85, 0.7, 0.8, 0.95])    # índice 0-1
    total_ha_disponibles = 500

    df_cultivos = pd.DataFrame({
        "Cultivo": cultivos,
        "Ha_max": hectareas_max,
        "Rend_MS_tha": rendimiento_ms,
        "Costo_USD_ha": costo_implant,
        "Aptitud_Suelo": aptitud_suelo,
    })
    return (
        aptitud_suelo,
        costo_implant,
        cultivos,
        hectareas_max,
        rendimiento_ms,
        total_ha_disponibles,
    )


@app.cell
def _(
    aptitud_suelo,
    costo_implant,
    cultivos,
    hectareas_max,
    pulp,
    rendimiento_ms,
    total_ha_disponibles,
):
    # Programación Lineal con PuLP
    prob = pulp.LpProblem("Optimizacion_Cadena_Forrajera", pulp.LpMaximize)

    # Variables: hectáreas asignadas a cada cultivo
    x_vars = [
        pulp.LpVariable(f"ha_{c.replace(' ', '_')}", lowBound=0, upBound=hectareas_max[i])
        for i, c in enumerate(cultivos)
    ]

    # Función objetivo: maximizar producción MS neta (ajustada por aptitud) - penalización costo
    lambda_costo = 0.001  # ponderación costo
    prob += pulp.lpSum(
        rendimiento_ms[i] * aptitud_suelo[i] * x_vars[i]
        - lambda_costo * costo_implant[i] * x_vars[i]
        for i in range(len(cultivos))
    )

    # Restricciones
    # Total hectáreas disponibles
    prob += pulp.lpSum(x_vars) <= total_ha_disponibles, "Total_Ha"
    # Maíz Silaje debe ser al menos 30% del total
    prob += x_vars[0] >= 0.30 * total_ha_disponibles, "Min_Maiz"
    # Alfalfa mínimo 50 ha para proteína
    prob += x_vars[2] >= 50, "Min_Alfalfa"
    # Sorgo no puede superar 25% del total
    prob += x_vars[1] <= 0.25 * total_ha_disponibles, "Max_Sorgo"

    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    # Resultados
    ha_optimas = [pulp.value(v) for v in x_vars]
    ms_total_opt = sum(rendimiento_ms[i] * aptitud_suelo[i] * (ha_optimas[i] or 0)
                       for i in range(len(cultivos)))
    costo_total_opt = sum(costo_implant[i] * (ha_optimas[i] or 0)
                          for i in range(len(cultivos)))
    return costo_total_opt, ha_optimas, ms_total_opt


@app.cell
def _(costo_total_opt, cultivos, ha_optimas, ms_total_opt, np, plt):
    fig7, axes7 = plt.subplots(1, 2, figsize=(14, 6))
    fig7.suptitle("Optimización de la Cadena Forrajera (PuLP)", fontsize=13, fontweight="bold")

    ha_vals = [h if h is not None else 0 for h in ha_optimas]
    colores7 = plt.cm.Set3(np.linspace(0, 1, len(cultivos)))

    ax71 = axes7[0]
    bars7 = ax71.bar(cultivos, ha_vals, color=colores7, edgecolor="black")
    ax71.set_ylabel("Hectáreas asignadas")
    ax71.set_title("Plan Óptimo de Siembra")
    ax71.tick_params(axis="x", rotation=30)
    for bar7, val7 in zip(bars7, ha_vals):
        ax71.text(bar7.get_x() + bar7.get_width() / 2, bar7.get_height() + 1,
                  f"{val7:.0f} ha", ha="center", fontsize=8)

    # Producción MS por cultivo
    ax72 = axes7[1]
    from numpy import array as _arr
    import numpy as _np2
    rendimiento_ms_arr = _arr([12.5, 8.0, 9.5, 6.0, 4.5, 7.0])
    aptitud_arr = _arr([1.0, 0.9, 0.85, 0.7, 0.8, 0.95])
    ms_por_cultivo = rendimiento_ms_arr * aptitud_arr * _np2.array(ha_vals)
    ax72.barh(cultivos, ms_por_cultivo, color=colores7, edgecolor="black")
    ax72.set_xlabel("Producción MS (ton)")
    ax72.set_title(f"MS total: {ms_total_opt:.0f} ton\nCosto total: USD {costo_total_opt:,.0f}")

    plt.tight_layout()
    fig7
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 8. Predicción de la Tasa de Sustitución en Pastoreo
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 300 observaciones
    n_obs_past = 300
    kg_concentrado = RNG.uniform(2, 8, n_obs_past)
    oferta_forrajera = RNG.uniform(8, 20, n_obs_past)    # kg MS/vaca
    em_pastura = RNG.uniform(2.0, 2.8, n_obs_past)       # Mcal EM/kg MS
    prod_basal = RNG.normal(20, 4, n_obs_past)

    # Tasa de sustitución: relación no lineal simulada
    tasa_sust = (0.3 + 0.05 * kg_concentrado - 0.02 * oferta_forrajera
                 + 0.1 * em_pastura + RNG.normal(0, 0.1, n_obs_past))
    tasa_sust = np.clip(tasa_sust, 0.1, 0.9)

    df_pastoreo = pd.DataFrame({
        "kg_concentrado": kg_concentrado,
        "oferta_forrajera": oferta_forrajera,
        "em_pastura": em_pastura,
        "prod_basal": prod_basal,
        "tasa_sustitucion": tasa_sust,
    })

    X_past = df_pastoreo[["kg_concentrado", "oferta_forrajera", "em_pastura", "prod_basal"]].values
    y_past = df_pastoreo["tasa_sustitucion"].values
    return X_past, y_past


@app.cell
def _(SVR, StandardScaler, X_past, np, r2_score, xgb, y_past):
    # SVR
    scaler_past = StandardScaler()
    X_past_sc = scaler_past.fit_transform(X_past)

    svr_model = SVR(kernel="rbf", C=10, epsilon=0.05)
    svr_model.fit(X_past_sc, y_past)
    y_svr_pred = svr_model.predict(X_past_sc)
    r2_svr = r2_score(y_past, y_svr_pred)

    # XGBoost
    xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=4,
                                  learning_rate=0.1, random_state=42,
                                  verbosity=0)
    xgb_model.fit(X_past, y_past)
    y_xgb_pred = xgb_model.predict(X_past)
    r2_xgb = r2_score(y_past, y_xgb_pred)

    # Curva de sustitución: variar kg concentrado, fijar resto en media
    conc_range = np.linspace(2, 8, 100)
    X_curva_base = np.tile(X_past.mean(axis=0), (100, 1))
    X_curva_base[:, 0] = conc_range
    X_curva_sc = scaler_past.transform(X_curva_base)
    curva_svr = svr_model.predict(X_curva_sc)
    curva_xgb = xgb_model.predict(X_curva_base)
    return (
        conc_range,
        curva_svr,
        curva_xgb,
        r2_svr,
        r2_xgb,
        y_svr_pred,
        y_xgb_pred,
    )


@app.cell
def _(
    conc_range,
    curva_svr,
    curva_xgb,
    plt,
    r2_svr,
    r2_xgb,
    y_past,
    y_svr_pred,
    y_xgb_pred,
):
    fig8, axes8 = plt.subplots(1, 2, figsize=(14, 6))
    fig8.suptitle("Predicción Tasa de Sustitución en Pastoreo: SVR vs XGBoost",
                  fontsize=13, fontweight="bold")

    # Comparación predicciones
    ax81 = axes8[0]
    ax81.scatter(y_past, y_svr_pred, alpha=0.4, s=15, color="dodgerblue",
                 label=f"SVR (R²={r2_svr:.3f})")
    ax81.scatter(y_past, y_xgb_pred, alpha=0.4, s=15, color="darkorange",
                 label=f"XGBoost (R²={r2_xgb:.3f})")
    lim8 = [y_past.min() - 0.05, y_past.max() + 0.05]
    ax81.plot(lim8, lim8, "k--", lw=1.5)
    ax81.set_xlabel("Tasa de sustitución real")
    ax81.set_ylabel("Tasa de sustitución predicha")
    ax81.set_title("Comparación SVR vs XGBoost")
    ax81.legend()

    # Curva de sustitución
    ax82 = axes8[1]
    ax82.plot(conc_range, curva_svr, color="dodgerblue", lw=2, label="SVR")
    ax82.plot(conc_range, curva_xgb, color="darkorange", lw=2, label="XGBoost")
    ax82.set_xlabel("kg Concentrado ofrecido")
    ax82.set_ylabel("Tasa de Sustitución")
    ax82.set_title("Curva de Sustitución\n(demás variables en media)")
    ax82.legend()

    plt.tight_layout()
    fig8
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 9. Eficiencia del Uso del Nitrógeno Dietario
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 200 vacas
    n_vacas_n = 200
    nul = RNG.normal(14, 4, n_vacas_n)      # NUL mg/dl
    nul = np.clip(nul, 4, 28)
    prot_leche = RNG.normal(3.2, 0.3, n_vacas_n)   # % proteína leche
    consumo_pb = RNG.normal(2800, 400, n_vacas_n)   # g PB/día

    # Balance energético simulado
    balance_en = RNG.normal(0, 2, n_vacas_n)  # Mcal/día (pos = superávit)

    df_nitrogeno = pd.DataFrame({
        "NUL_mg_dl": nul,
        "Prot_Leche_pct": prot_leche,
        "Consumo_PB_gd": consumo_pb,
        "Balance_EN": balance_en,
    })

    # Cuadrantes NUL vs proteína leche
    # Cuadrante I: NUL alto, prot alta -> exceso N
    # Cuadrante II: NUL alto, prot baja -> desbalance E/P
    # Cuadrante III: NUL bajo, prot baja -> déficit N y E
    # Cuadrante IV: NUL bajo, prot alta -> eficiente
    nul_med = df_nitrogeno["NUL_mg_dl"].median()
    prot_med = df_nitrogeno["Prot_Leche_pct"].median()

    def asignar_cuadrante(row):
        if row["NUL_mg_dl"] >= nul_med and row["Prot_Leche_pct"] >= prot_med:
            return "I: Exceso N"
        elif row["NUL_mg_dl"] >= nul_med and row["Prot_Leche_pct"] < prot_med:
            return "II: Desbalance E/P"
        elif row["NUL_mg_dl"] < nul_med and row["Prot_Leche_pct"] < prot_med:
            return "III: Déficit N+E"
        else:
            return "IV: Eficiente"

    df_nitrogeno["Cuadrante"] = df_nitrogeno.apply(asignar_cuadrante, axis=1)
    return (df_nitrogeno,)


@app.cell
def _(DecisionTreeClassifier, df_nitrogeno, plot_tree, plt):
    # Decision Tree Classifier (depth=3)
    X_dt = df_nitrogeno[["NUL_mg_dl", "Prot_Leche_pct", "Consumo_PB_gd"]].values
    y_dt = df_nitrogeno["Cuadrante"].values

    dt_clf = DecisionTreeClassifier(max_depth=3, random_state=42)
    dt_clf.fit(X_dt, y_dt)
    clases_dt = dt_clf.classes_

    fig9, axes9 = plt.subplots(1, 2, figsize=(18, 7))
    fig9.suptitle("Eficiencia del Uso del Nitrógeno Dietario", fontsize=13, fontweight="bold")

    # Árbol de decisión
    ax91 = axes9[0]
    plot_tree(dt_clf, feature_names=["NUL", "Prot_Leche", "PB_gd"],
              class_names=clases_dt, filled=True, ax=ax91, fontsize=7,
              impurity=False, proportion=True)
    ax91.set_title("Árbol de Decisión (depth=3)\nCuadrantes N/Energía")

    # Scatter cuadrantes
    ax92 = axes9[1]
    colores_cuad = {
        "I: Exceso N": "red",
        "II: Desbalance E/P": "orange",
        "III: Déficit N+E": "gray",
        "IV: Eficiente": "green",
    }
    for cuad, color in colores_cuad.items():
        mask = df_nitrogeno["Cuadrante"] == cuad
        ax92.scatter(
            df_nitrogeno.loc[mask, "NUL_mg_dl"],
            df_nitrogeno.loc[mask, "Prot_Leche_pct"],
            c=color, label=cuad, alpha=0.6, s=25
        )
    from numpy import median as _med
    ax92.axvline(df_nitrogeno["NUL_mg_dl"].median(), color="black", lw=1.2, linestyle="--")
    ax92.axhline(df_nitrogeno["Prot_Leche_pct"].median(), color="black", lw=1.2, linestyle="--")
    ax92.set_xlabel("NUL (mg/dl)")
    ax92.set_ylabel("Proteína en leche (%)")
    ax92.set_title("Cuadrantes Balance Energía/Proteína")
    ax92.legend(fontsize=8)

    plt.tight_layout()
    fig9
    return


@app.cell
def _(mo):
    mo.md(r"""
    ## 10. Asignación Automatizada de Concentrado en Sala de Ordeñe
    """)
    return


@app.cell
def _(RNG, np, pd):
    # Mock data: 150 vacas
    n_vacas_conc = 150
    del_conc = RNG.integers(5, 300, n_vacas_conc)
    prod_7d = RNG.normal(27, 6, n_vacas_conc)
    prod_7d = np.clip(prod_7d, 8, 50)
    mcal_kg = RNG.normal(1.8, 0.1, n_vacas_conc)      # Mcal EM / kg concentrado
    prot_pct = RNG.normal(18, 2, n_vacas_conc)         # % proteína concentrado

    df_conc = pd.DataFrame({
        "ID_Vaca": range(1, n_vacas_conc + 1),
        "DEL": del_conc,
        "Prod_media_7d": prod_7d,
        "Mcal_kg": mcal_kg,
        "Prot_pct": prot_pct,
    })

    # Requerimiento marginal de EM según curva de lactancia NRC
    # EM_req (Mcal/día) = 0.08 * PV^0.75 + 0.092 * ECM + 0.0029 * PV
    # Simplificado para ejemplo: EM_req = f(DEL, prod)
    pv_est = 580 * np.ones(n_vacas_conc)  # peso estimado
    em_mantenim = 0.08 * (pv_est ** 0.75)
    em_lactancia = 0.749 * df_conc["Prod_media_7d"]  # 0.749 Mcal/kg leche ECM
    em_total_req = em_mantenim + em_lactancia

    # Asumir pastura + silo aportan 22 Mcal/día base
    em_base_dieta = 22.0
    em_deficit = np.maximum(em_total_req - em_base_dieta, 0)

    # Dosis concentrado = déficit EM / Mcal por kg
    dosis_kg = em_deficit / df_conc["Mcal_kg"]
    dosis_kg = np.clip(dosis_kg, 0, 8)  # límite 8 kg/ordeñe

    df_conc["EM_requerida_Mcal"] = em_total_req.round(2)
    df_conc["EM_deficit_Mcal"] = em_deficit.round(2)
    df_conc["Dosis_Conc_kg"] = dosis_kg.round(2)

    # Curva de requerimiento marginal teórica
    prod_range = np.linspace(5, 55, 200)
    em_req_curva = 0.08 * (580 ** 0.75) + 0.749 * prod_range
    dosis_curva = np.maximum(em_req_curva - em_base_dieta, 0) / 1.8
    dosis_curva = np.clip(dosis_curva, 0, 8)
    return df_conc, dosis_curva, prod_range


@app.cell
def _(df_conc, dosis_curva, plt, prod_range):
    fig10, axes10 = plt.subplots(1, 3, figsize=(17, 6))
    fig10.suptitle("Asignación Automatizada de Concentrado en Sala de Ordeñe",
                   fontsize=13, fontweight="bold")

    # Distribución de dosis
    ax101 = axes10[0]
    ax101.hist(df_conc["Dosis_Conc_kg"], bins=20, color="mediumseagreen", edgecolor="white")
    ax101.axvline(df_conc["Dosis_Conc_kg"].mean(), color="red", lw=2,
                  linestyle="--", label=f"Media: {df_conc['Dosis_Conc_kg'].mean():.2f} kg")
    ax101.set_xlabel("Dosis Concentrado (kg/ordeñe)")
    ax101.set_ylabel("Número de Vacas")
    ax101.set_title("Distribución de Dosis")
    ax101.legend()

    # Scatter DEL vs Dosis
    ax102 = axes10[1]
    sc10 = ax102.scatter(df_conc["DEL"], df_conc["Dosis_Conc_kg"],
                         c=df_conc["Prod_media_7d"], cmap="YlOrRd",
                         s=30, alpha=0.7)
    plt.colorbar(sc10, ax=ax102, label="Prod media 7d (kg)")
    ax102.set_xlabel("DEL (días en leche)")
    ax102.set_ylabel("Dosis Concentrado (kg)")
    ax102.set_title("DEL vs Dosis individual\n(color = producción)")

    # Curva de requerimiento marginal
    ax103 = axes10[2]
    ax103.plot(prod_range, dosis_curva, color="darkorange", lw=2.5,
               label="Curva requerimiento marginal")
    ax103.fill_between(prod_range, 0, dosis_curva, alpha=0.15, color="orange")
    ax103.scatter(df_conc["Prod_media_7d"], df_conc["Dosis_Conc_kg"],
                  s=15, alpha=0.4, color="steelblue", label="Vacas individuales")
    ax103.set_xlabel("Producción ECM (kg/día)")
    ax103.set_ylabel("Dosis Concentrado (kg/ordeñe)")
    ax103.set_title("Curva de Requerimiento Marginal")
    ax103.legend(fontsize=8)

    plt.tight_layout()
    fig10
    return


@app.cell
def _(df_conc, mo):
    # Tabla de asignación individual (top 10 por dosis)
    top_asignacion = df_conc.nlargest(10, "Dosis_Conc_kg")[
        ["ID_Vaca", "DEL", "Prod_media_7d", "EM_requerida_Mcal", "EM_deficit_Mcal", "Dosis_Conc_kg"]
    ].reset_index(drop=True)
    mo.ui.table(top_asignacion, label="Top 10 Vacas por Dosis de Concentrado")
    return


if __name__ == "__main__":
    app.run()
