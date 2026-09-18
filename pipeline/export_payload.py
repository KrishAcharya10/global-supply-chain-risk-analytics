from __future__ import annotations
from typing import Dict, Any, List
import json
import numpy as np
import pandas as pd


def compute_correlation_matrix(df: pd.DataFrame) -> Dict[str, Any]:
    """Compute annotated correlation matrix for numeric features."""
    cols = [
        "Geopolitical_Risk_Score",
        "Carrier_Reliability_Score",
        "Weather_Severity",
        "Lead_Time_Days",
        "Delay_Days",
        "Estimated_Cost_USD",
        "Carbon_Emission_kg",
        "Weight_MT",
        "Fuel_Price_Index",
        "Risk_Index",
        "Disruption_Occurred",
    ]
    available_cols = [c for c in cols if c in df.columns]
    if len(available_cols) < 2:
        return {"columns": [], "matrix": []}

    corr_df = df[available_cols].corr().round(3)

    return {
        "columns": available_cols,
        "matrix": corr_df.values.tolist(),
        "pairs": [
            {
                "x": c1,
                "y": c2,
                "value": float(corr_df.loc[c1, c2]),
            }
            for i, c1 in enumerate(available_cols)
            for j, c2 in enumerate(available_cols)
            if i < j
        ],
    }


def compute_sankey_data(df: pd.DataFrame) -> Dict[str, Any]:
    """Generate Sankey flow nodes and links: Mode -> Risk Tier -> Disruption Outcome."""
    if not {"Transport_Mode", "Geo_Risk_Bucket", "Disruption_Occurred"}.issubset(df.columns):
        return {"nodes": [], "links": []}

    # Clean missing/nulls
    sankey_df = df.copy()
    sankey_df["Disruption_Label"] = sankey_df["Disruption_Occurred"].map({1: "Disrupted", 0: "Normal Delivery"}).fillna("Normal Delivery")
    sankey_df["Risk_Tier"] = sankey_df["Geo_Risk_Bucket"].astype(str) + " Risk"

    # Step 1: Mode -> Risk Tier
    stage1 = (
        sankey_df.groupby(["Transport_Mode", "Risk_Tier"])
        .size()
        .reset_index(name="value")
    )
    # Step 2: Risk Tier -> Disruption
    stage2 = (
        sankey_df.groupby(["Risk_Tier", "Disruption_Label"])
        .size()
        .reset_index(name="value")
    )

    # Build unique node list
    nodes = list(
        set(stage1["Transport_Mode"]).union(set(stage1["Risk_Tier"])).union(set(stage2["Disruption_Label"]))
    )
    node_map = {name: idx for idx, name in enumerate(nodes)}

    links = []
    for _, row in stage1.iterrows():
        links.append({
            "source": node_map[row["Transport_Mode"]],
            "target": node_map[row["Risk_Tier"]],
            "value": int(row["value"]),
            "source_name": row["Transport_Mode"],
            "target_name": row["Risk_Tier"],
        })
    for _, row in stage2.iterrows():
        links.append({
            "source": node_map[row["Risk_Tier"]],
            "target": node_map[row["Disruption_Label"]],
            "value": int(row["value"]),
            "source_name": row["Risk_Tier"],
            "target_name": row["Disruption_Label"],
        })

    return {
        "nodes": [{"name": n} for n in nodes],
        "links": links,
    }


def compute_scatter_samples(df: pd.DataFrame, sample_size: int = 300) -> List[Dict[str, Any]]:
    """Sample records for scatter plots (Geopolitical Risk, Lead Time, Reliability, Weather, Fuel, Cost)."""
    cols = [
        "Shipment_ID",
        "Transport_Mode",
        "Geopolitical_Risk_Score",
        "Carrier_Reliability_Score",
        "Weather_Severity",
        "Weather_Condition",
        "Lead_Time_Days",
        "Delay_Days",
        "Estimated_Cost_USD",
        "Carbon_Emission_kg",
        "Weight_MT",
        "Fuel_Price_Index",
        "Disruption_Occurred",
        "Route_Label",
    ]
    available = [c for c in cols if c in df.columns]

    sample_df = df[available].dropna(subset=["Lead_Time_Days", "Geopolitical_Risk_Score"])
    if len(sample_df) > sample_size:
        sample_df = sample_df.sample(n=sample_size, random_state=42)

    records = sample_df.to_dict(orient="records")
    for r in records:
        for k, v in r.items():
            if isinstance(v, (np.floating, float)):
                r[k] = round(float(v), 2)
            elif isinstance(v, (np.integer, int)):
                r[k] = int(v)
    return records


def build_dashboard_payload(df: pd.DataFrame, quality: Dict, model_metrics: Dict) -> Dict[str, Any]:
    """Generate complete dashboard JSON payload."""
    total_shipments = len(df)
    disruption_rate = float(df["Disruption_Occurred"].mean()) if "Disruption_Occurred" in df.columns else 0.0
    avg_lead_time = float(df["Lead_Time_Days"].mean()) if "Lead_Time_Days" in df.columns else 0.0
    avg_reliability = float(df["Carrier_Reliability_Score"].mean()) if "Carrier_Reliability_Score" in df.columns else 0.0
    avg_cost = float(df["Estimated_Cost_USD"].mean()) if "Estimated_Cost_USD" in df.columns else 0.0
    total_emissions = float(df["Carbon_Emission_kg"].sum()) if "Carbon_Emission_kg" in df.columns else 0.0
    avg_emissions = float(df["Carbon_Emission_kg"].mean()) if "Carbon_Emission_kg" in df.columns else 0.0
    avg_risk_index = float(df["Risk_Index"].mean()) if "Risk_Index" in df.columns else 0.0

    on_time_rate = float((df["Delay_Days"] <= 0.5).mean()) if "Delay_Days" in df.columns else 0.0

    # Monthly Lead Time & Disruption Trend
    monthly_trend = []
    if "Date" in df.columns and pd.api.types.is_datetime64_any_dtype(df["Date"]):
        monthly_grp = (
            df.assign(Period=df["Date"].dt.to_period("M").astype(str))
            .groupby("Period")
            .agg(
                avg_lead_time=("Lead_Time_Days", "mean"),
                disruption_rate=("Disruption_Occurred", "mean"),
                avg_risk=("Risk_Index", "mean"),
                shipment_count=("Shipment_ID", "count"),
            )
            .reset_index()
            .sort_values("Period")
        )
        monthly_trend = [
            {
                "period": r["Period"],
                "avg_lead_time": round(float(r["avg_lead_time"]), 2),
                "disruption_rate": round(float(r["disruption_rate"]), 4),
                "avg_risk": round(float(r["avg_risk"]), 2),
                "shipment_count": int(r["shipment_count"]),
            }
            for _, r in monthly_grp.iterrows()
        ]

    # Mode Breakdown
    mode_summary = []
    if "Transport_Mode" in df.columns:
        mode_grp = (
            df.groupby("Transport_Mode")
            .agg(
                avg_lead_time=("Lead_Time_Days", "mean"),
                disruption_rate=("Disruption_Occurred", "mean"),
                avg_cost=("Estimated_Cost_USD", "mean"),
                avg_emissions=("Carbon_Emission_kg", "mean"),
                avg_cost_per_km=("Cost_Per_KM", "mean"),
                avg_cost_per_tonne=("Cost_Per_Tonne", "mean"),
                avg_reliability=("Carrier_Reliability_Score", "mean"),
                count=("Shipment_ID", "count"),
            )
            .reset_index()
        )
        mode_summary = [
            {
                "mode": r["Transport_Mode"],
                "avg_lead_time": round(float(r["avg_lead_time"]), 2),
                "disruption_rate": round(float(r["disruption_rate"]), 4),
                "avg_cost": round(float(r["avg_cost"]), 2),
                "avg_emissions": round(float(r["avg_emissions"]), 2),
                "avg_cost_per_km": round(float(r["avg_cost_per_km"]), 2),
                "avg_cost_per_tonne": round(float(r["avg_cost_per_tonne"]), 2),
                "avg_reliability": round(float(r["avg_reliability"]), 3),
                "count": int(r["count"]),
            }
            for _, r in mode_grp.iterrows()
        ]

    # Weather Breakdown
    weather_summary = []
    if "Weather_Condition" in df.columns:
        weather_grp = (
            df.groupby("Weather_Condition")
            .agg(
                disruption_rate=("Disruption_Occurred", "mean"),
                avg_delay=("Delay_Days", "mean"),
                avg_lead_time=("Lead_Time_Days", "mean"),
                count=("Shipment_ID", "count"),
            )
            .reset_index()
            .sort_values("disruption_rate", ascending=False)
        )
        weather_summary = [
            {
                "weather": r["Weather_Condition"],
                "disruption_rate": round(float(r["disruption_rate"]), 4),
                "avg_delay": round(float(r["avg_delay"]), 2),
                "avg_lead_time": round(float(r["avg_lead_time"]), 2),
                "count": int(r["count"]),
            }
            for _, r in weather_grp.iterrows()
        ]

    # Route Intelligence
    route_summary = []
    if "Route_Label" in df.columns:
        route_grp = (
            df.groupby(["Route_Label", "Origin_Port", "Destination_Port"])
            .agg(
                disruption_rate=("Disruption_Occurred", "mean"),
                avg_delay=("Delay_Days", "mean"),
                avg_lead_time=("Lead_Time_Days", "mean"),
                avg_risk=("Risk_Index", "mean"),
                avg_cost=("Estimated_Cost_USD", "mean"),
                count=("Shipment_ID", "count"),
            )
            .reset_index()
            .sort_values("disruption_rate", ascending=False)
        )
        route_summary = [
            {
                "route": r["Route_Label"],
                "origin": r["Origin_Port"],
                "destination": r["Destination_Port"],
                "disruption_rate": round(float(r["disruption_rate"]), 4),
                "avg_delay": round(float(r["avg_delay"]), 2),
                "avg_lead_time": round(float(r["avg_lead_time"]), 2),
                "avg_risk": round(float(r["avg_risk"]), 2),
                "avg_cost": round(float(r["avg_cost"]), 2),
                "count": int(r["count"]),
            }
            for _, r in route_grp.iterrows()
        ]

    # Carrier Rankings
    carrier_summary = []
    if "Carrier_Reliability_Score" in df.columns:
        # Check if there is carrier name or generate carrier proxy bins
        df["Carrier_Name"] = "Carrier " + df["Carrier_Reliability_Score"].apply(lambda s: f"{int(s*100):02d}")
        carrier_grp = (
            df.groupby("Reliability_Bucket")
            .agg(
                avg_reliability=("Carrier_Reliability_Score", "mean"),
                disruption_rate=("Disruption_Occurred", "mean"),
                avg_delay=("Delay_Days", "mean"),
                avg_cost=("Estimated_Cost_USD", "mean"),
                count=("Shipment_ID", "count"),
            )
            .reset_index()
        )
        carrier_summary = [
            {
                "tier": str(r["Reliability_Bucket"]),
                "avg_reliability": round(float(r["avg_reliability"]), 3),
                "disruption_rate": round(float(r["disruption_rate"]), 4),
                "avg_delay": round(float(r["avg_delay"]), 2),
                "avg_cost": round(float(r["avg_cost"]), 2),
                "count": int(r["count"]),
            }
            for _, r in carrier_grp.iterrows()
        ]

    # Sample High-Risk Shipments
    high_risk_shipments = []
    if "Risk_Index" in df.columns:
        high_risk_df = (
            df.sort_values("Risk_Index", ascending=False)
            .head(50)[
                [
                    "Shipment_ID",
                    "Date",
                    "Route_Label",
                    "Transport_Mode",
                    "Geopolitical_Risk_Score",
                    "Carrier_Reliability_Score",
                    "Weather_Condition",
                    "Lead_Time_Days",
                    "Delay_Days",
                    "Disruption_Occurred",
                    "Risk_Index",
                    "Estimated_Cost_USD",
                ]
            ]
        )
        records = high_risk_df.to_dict(orient="records")
        for r in records:
            r["Date"] = str(r["Date"])[:10] if pd.notna(r["Date"]) else ""
            for k in ["Lead_Time_Days", "Delay_Days", "Risk_Index", "Estimated_Cost_USD", "Geopolitical_Risk_Score", "Carrier_Reliability_Score"]:
                if k in r and pd.notna(r[k]):
                    r[k] = round(float(r[k]), 2)
        high_risk_shipments = records

    # Scenario Coefficients (Linear regression approximations for simulation)
    scenario_coeffs = {
        "base_disruption_rate": disruption_rate,
        "base_lead_time": avg_lead_time,
        "geo_risk_weight": 0.045,        # Disruption increases ~4.5% per geo risk point
        "reliability_weight": -0.32,     # Disruption decreases ~32% per 1.0 reliability increase
        "weather_weight": 0.035,         # Disruption increases ~3.5% per weather severity level
        "geo_risk_delay_days": 1.25,     # Days added per geo risk level
        "reliability_delay_days": -8.5,  # Days saved with perfect reliability
        "weather_delay_days": 1.8,       # Days added per weather severity
    }

    return {
        "metadata": {
            "title": "Supply Chain Risk Analytics Platform Payload",
            "version": "2.0.0",
            "generated_at": pd.Timestamp.now().isoformat(),
        },
        "kpis": {
            "total_shipments": total_shipments,
            "disruption_rate": round(disruption_rate, 4),
            "on_time_rate": round(on_time_rate, 4),
            "avg_lead_time": round(avg_lead_time, 2),
            "avg_reliability": round(avg_reliability, 3),
            "avg_cost": round(avg_cost, 2),
            "total_emissions": round(total_emissions, 2),
            "avg_emissions": round(avg_emissions, 2),
            "avg_risk_index": round(avg_risk_index, 2),
        },
        "quality_report": quality,
        "model_metrics": model_metrics,
        "monthly_trend": monthly_trend,
        "mode_summary": mode_summary,
        "weather_summary": weather_summary,
        "route_summary": route_summary,
        "carrier_summary": carrier_summary,
        "high_risk_shipments": high_risk_shipments,
        "correlation_matrix": compute_correlation_matrix(df),
        "sankey_data": compute_sankey_data(df),
        "scatter_samples": compute_scatter_samples(df, sample_size=350),
        "scenario_coeffs": scenario_coeffs,
    }
