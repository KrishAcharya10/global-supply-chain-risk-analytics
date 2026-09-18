from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Dict, List


def safe_div(numer: np.ndarray | pd.Series, denom: np.ndarray | pd.Series) -> np.ndarray:
    """Safe division returning 0 on zero division."""
    with np.errstate(divide="ignore", invalid="ignore"):
        result = np.where(denom == 0, 0, numer / denom)
    return result


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Perform feature engineering:
    - Extracted time parts
    - Standardized route label
    - Risk & reliability binning
    - Delay calculation and status categorization
    - Priority scoring
    - Aggregated route & carrier statistics
    """
    df = df.copy()

    # Datetime parts
    if "Date" in df.columns and pd.api.types.is_datetime64_any_dtype(df["Date"]):
        df["Year_from_Date"] = df["Date"].dt.year
        df["Month_from_Date"] = df["Date"].dt.month
        df["Day_from_Date"] = df["Date"].dt.day
        df["Weekday_from_Date"] = df["Date"].dt.day_name()
        df["Month_Name_from_Date"] = df["Date"].dt.strftime("%b")

    # Route Label standard
    if {"Origin_Port", "Destination_Port"}.issubset(df.columns):
        df["Route_Label"] = df["Origin_Port"].astype(str) + " -> " + df["Destination_Port"].astype(str)

    # Recalculate lead time delay
    if {"Lead_Time_Days", "Expected_Lead_Time_Days"}.issubset(df.columns):
        df["Delay_Days_Recalc"] = (df["Lead_Time_Days"] - df["Expected_Lead_Time_Days"]).clip(lower=0)
        df["Delay_Pct_Recalc"] = safe_div(df["Delay_Days_Recalc"] * 100, df["Expected_Lead_Time_Days"])

    # Geopolitical Risk Buckets
    if "Geopolitical_Risk_Score" in df.columns:
        df["Geo_Risk_Bucket"] = pd.cut(
            df["Geopolitical_Risk_Score"],
            bins=[-0.1, 3.5, 7.0, 10.0],
            labels=["Low", "Medium", "High"],
        )

    # Reliability Buckets
    if "Carrier_Reliability_Score" in df.columns:
        df["Reliability_Bucket"] = pd.cut(
            df["Carrier_Reliability_Score"],
            bins=[-0.01, 0.65, 0.85, 1.01],
            labels=["Poor", "Good", "Excellent"],
        )

    # Shipment Weight Binning
    if "Weight_MT" in df.columns:
        df["Shipment_Size_Bucket"] = pd.cut(
            df["Weight_MT"],
            bins=[-0.1, 150, 350, np.inf],
            labels=["Small", "Medium", "Large"],
        )

    # Composite Priority Score
    if {"Geopolitical_Risk_Score", "Carrier_Reliability_Score"}.issubset(df.columns):
        geo_risk = df["Geopolitical_Risk_Score"].fillna(0)
        rel_risk = (1.0 - df["Carrier_Reliability_Score"].fillna(0)) * 10.0
        df["Priority_Score"] = (0.6 * geo_risk + 0.4 * rel_risk).round(2)
        df["Priority_Label"] = pd.cut(
            df["Priority_Score"],
            bins=[-0.1, 4.0, 6.5, 10.0],
            labels=["Normal", "Important", "Critical"],
        )

    # Calculated Risk Index if not present
    if "Risk_Index" not in df.columns and {"Geopolitical_Risk_Score", "Carrier_Reliability_Score"}.issubset(df.columns):
        df["Risk_Index"] = (0.7 * df["Geopolitical_Risk_Score"] + 30.0 * (1 - df["Carrier_Reliability_Score"])).round(2)

    # Delay Status categorization
    if {"Lead_Time_Days", "Expected_Lead_Time_Days"}.issubset(df.columns):
        delay = df["Lead_Time_Days"] - df["Expected_Lead_Time_Days"]
        df["Delay_Status_Cat"] = pd.cut(
            delay,
            bins=[-np.inf, 0.5, 5.0, np.inf],
            labels=["On Time", "Minor Delay", "Major Delay"],
        )

    return df
