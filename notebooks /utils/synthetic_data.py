"""
Generadores de datos sintéticos con distribuciones biológicas realistas
para el Catálogo Técnico AgTech.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def generar_serie_meteorologica(dias: int = 365, lat: float = -33.0, seed: int = 42) -> pd.DataFrame:
    """
    Genera serie temporal climática con estacionalidad realista para el hemisferio sur.
    Simula una estación meteorológica tipo INTA.
    """
    rng = np.random.default_rng(seed)
    fechas = pd.date_range(start="2023-01-01", periods=dias, freq="D")
    dia_del_anio = np.arange(1, dias + 1)

    # Estacionalidad sinusoidal (verano austral en enero)
    temp_base = 16 - abs(lat) * 0.1
    amplitud = 8 + abs(lat) * 0.15
    fase = 2 * np.pi * (dia_del_anio - 15) / 365

    temp_max = temp_base + amplitud * np.cos(fase) + rng.normal(0, 2.5, dias)
    temp_min = temp_base - amplitud * 0.6 * np.cos(fase) + rng.normal(0, 1.8, dias)
    temp_max = np.clip(temp_max, temp_min + 3, 42)

    humedad_rel = 65 - 15 * np.cos(fase + 0.5) + rng.normal(0, 8, dias)
    humedad_rel = np.clip(humedad_rel, 20, 99)

    lluvia_base = 3.5 * (1 + 0.4 * np.sin(fase + np.pi))
    lluvia = rng.exponential(lluvia_base, dias) * rng.binomial(1, 0.35, dias)

    viento_kmh = np.abs(rng.normal(15, 6, dias)) + 3
    radiacion_mj = np.clip(
        20 * np.cos(fase) + 15 + rng.normal(0, 3, dias), 2, 35
    )

    return pd.DataFrame({
        "fecha": fechas,
        "temp_max_c": np.round(temp_max, 1),
        "temp_min_c": np.round(temp_min, 1),
        "temp_media_c": np.round((temp_max + temp_min) / 2, 1),
        "humedad_rel_pct": np.round(humedad_rel, 1),
        "lluvia_mm": np.round(lluvia, 1),
        "viento_kmh": np.round(viento_kmh, 1),
        "radiacion_mj_m2": np.round(radiacion_mj, 2),
    })


def generar_datos_suelo(n_muestras: int = 120, seed: int = 42) -> pd.DataFrame:
    """
    Genera análisis de suelo con correlaciones realistas entre nutrientes.
    Simula muestreo en grilla de 1 ha en lote agrícola pampeano.
    """
    rng = np.random.default_rng(seed)
    x = rng.uniform(0, 1000, n_muestras)
    y = rng.uniform(0, 1200, n_muestras)

    # Correlación espacial simulada con componente tendencial
    trend_x = 0.003 * (x - 500)
    trend_y = 0.002 * (y - 600)

    mo = np.clip(3.5 + trend_x + rng.normal(0, 0.6, n_muestras), 1.0, 6.5)
    ph = np.clip(6.2 - 0.2 * mo + rng.normal(0, 0.25, n_muestras), 4.5, 8.0)
    n_total = mo * 0.05 + rng.normal(0, 0.02, n_muestras)
    p_bray = np.clip(15 + trend_y + rng.normal(0, 5, n_muestras), 3, 50)
    k_meq = np.clip(0.8 + rng.normal(0, 0.2, n_muestras), 0.2, 2.5)
    ce_ds = np.clip(0.5 + rng.normal(0, 0.15, n_muestras), 0.1, 2.0)
    arcilla_pct = np.clip(25 + rng.normal(0, 5, n_muestras), 10, 45)
    rinde_hist = np.clip(
        4500 + 300 * (mo - 3.5) + 50 * (p_bray - 15) - 200 * np.abs(ph - 6.5) + rng.normal(0, 300, n_muestras),
        2000, 8000
    )

    return pd.DataFrame({
        "muestra_id": [f"M{i:04d}" for i in range(n_muestras)],
        "coord_x": np.round(x, 1),
        "coord_y": np.round(y, 1),
        "mo_pct": np.round(mo, 2),
        "ph": np.round(ph, 2),
        "n_total_pct": np.round(n_total, 3),
        "p_bray_ppm": np.round(p_bray, 1),
        "k_meq_100g": np.round(k_meq, 2),
        "ce_ds_m": np.round(ce_ds, 2),
        "arcilla_pct": np.round(arcilla_pct, 1),
        "rinde_hist_kg_ha": np.round(rinde_hist, 0),
    })


def generar_telemetria_canbus(horas: int = 8, freq_seg: int = 5, seed: int = 42) -> pd.DataFrame:
    """
    Simula flujo de datos CAN-BUS (ISO 11783) de una sembradora/pulverizadora.
    """
    rng = np.random.default_rng(seed)
    n = int(horas * 3600 / freq_seg)
    timestamps = [datetime(2024, 3, 15, 6, 0) + timedelta(seconds=i * freq_seg) for i in range(n)]

    # Simula pasadas con cabeceras
    pasada = np.repeat(np.arange(1, n // 200 + 2), 200)[:n]
    en_cabecera = (np.arange(n) % 200) < 15

    vel_trabajo = np.where(en_cabecera, rng.uniform(3, 6, n), rng.normal(9.5, 0.8, n))
    vel_trabajo = np.clip(vel_trabajo, 0, 15)

    rpm_motor = np.where(en_cabecera, rng.normal(1400, 80, n), rng.normal(2100, 60, n))
    combustible_lh = 0.02 * rpm_motor * (1 + 0.1 * vel_trabajo / 10) + rng.normal(0, 0.5, n)

    dosis_prescripta = 150.0  # L/ha o kg/ha
    eficiencia = np.where(en_cabecera, 0.0, 1 + rng.normal(0, 0.05, n))
    dosis_real = dosis_prescripta * eficiencia

    lat_base = -34.5
    lon_base = -60.2
    lat = lat_base + np.cumsum(rng.normal(0, 0.00001, n))
    lon = lon_base + np.cumsum(rng.normal(0, 0.00002, n))

    return pd.DataFrame({
        "timestamp": timestamps,
        "pasada": pasada,
        "en_cabecera": en_cabecera,
        "velocidad_kmh": np.round(vel_trabajo, 1),
        "rpm_motor": np.round(rpm_motor, 0).astype(int),
        "consumo_lh": np.round(np.abs(combustible_lh), 1),
        "dosis_prescripta": dosis_prescripta,
        "dosis_real": np.round(np.abs(dosis_real), 1),
        "latitud": np.round(lat, 6),
        "longitud": np.round(lon, 6),
        "presion_bomba_bar": np.round(rng.normal(3.2, 0.3, n), 2),
    })


def generar_precios_commodities(anios: int = 5, seed: int = 42) -> pd.DataFrame:
    """
    Genera precios históricos de soja, maíz y trigo con proceso GBM (Geometric Brownian Motion).
    Calibrado con volatilidades típicas de MATBA-Rofex.
    """
    rng = np.random.default_rng(seed)
    dias = anios * 252
    fechas = pd.bdate_range(start="2020-01-01", periods=dias)

    def gbm(s0, mu, sigma, n, rng):
        dt = 1 / 252
        retornos = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * rng.normal(0, 1, n))
        return s0 * np.cumprod(retornos)

    # Parámetros calibrados en USD/tonelada
    soja = gbm(400, 0.03, 0.22, dias, rng)
    maiz = gbm(200, 0.02, 0.20, dias, rng)
    trigo = gbm(250, 0.02, 0.18, dias, rng)

    return pd.DataFrame({
        "fecha": fechas,
        "soja_usd_t": np.round(soja, 2),
        "maiz_usd_t": np.round(maiz, 2),
        "trigo_usd_t": np.round(trigo, 2),
    })


def generar_datos_silos(n_sensores: int = 16, dias: int = 90, seed: int = 42) -> pd.DataFrame:
    """
    Simula lecturas de termocuplas en silo de granos.
    Incluye un punto caliente emergente para detección de anomalías.
    """
    rng = np.random.default_rng(seed)
    registros = []

    for dia in range(dias):
        for s in range(n_sensores):
            fila = s // 4
            col = s % 4
            # Temp base con gradiente vertical + estacional
            temp_base = 22 + dia * 0.05 + fila * 0.5
            # Punto caliente simulado en sensor 9 a partir del día 40
            if s == 9 and dia > 40:
                temp = temp_base + (dia - 40) * 0.3 + rng.normal(0, 0.3)
            else:
                temp = temp_base + rng.normal(0, 0.4)
            registros.append({
                "dia": dia,
                "sensor_id": s,
                "fila": fila,
                "columna": col,
                "temperatura_c": round(temp, 2),
            })

    return pd.DataFrame(registros)
