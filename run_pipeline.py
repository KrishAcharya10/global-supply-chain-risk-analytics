#!/usr/bin/env python
from __future__ import annotations
import sys
import time
from pathlib import Path
import json

from pipeline.config import BASE_DIR, OUTPUT_DIR
from pipeline.data_cleaning import load_raw_dataset, clean_dataset, generate_quality_report
from pipeline.feature_engineering import engineer_features
from pipeline.modeling import train_models
from pipeline.export_payload import build_dashboard_payload


def run():
    print("=" * 60)
    print("SUPPLY CHAIN RISK ANALYTICS PIPELINE (v2.0.0)")
    print("=" * 60)
    start_time = time.time()

    # Step 1: Load Raw Dataset
    print("\n[1/5] Loading Raw Dataset...")
    raw_df = load_raw_dataset(BASE_DIR)
    print(f"      Loaded {len(raw_df)} rows and {len(raw_df.columns)} columns.")

    # Step 2: Clean Dataset
    print("\n[2/5] Cleaning Dataset & Enforcing Constraints...")
    cleaned_df = clean_dataset(raw_df)
    quality_rep = generate_quality_report(cleaned_df)
    print(f"      Cleaned dataset has {len(cleaned_df)} rows.")

    # Step 3: Engineer Features
    print("\n[3/5] Engineering Derived Features & Risk Indices...")
    enriched_df = engineer_features(cleaned_df)
    print(f"      Feature engineering complete. Total columns: {len(enriched_df.columns)}.")

    # Save cleaned dataset
    cleaned_csv_path = OUTPUT_DIR / "cleaned_supply_chain.csv"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    enriched_df.to_csv(cleaned_csv_path, index=False)
    print(f"      Saved cleaned dataset to: {cleaned_csv_path}")

    # Step 4: Train Machine Learning Models
    print("\n[4/5] Training Disruption Classifier & Lead Time Regressor...")
    model_metrics = train_models(enriched_df)
    
    clf_metrics = model_metrics.get("classification", {})
    reg_metrics = model_metrics.get("regression", {})
    print(f"      Classifier -> ROC-AUC: {clf_metrics.get('roc_auc', 0):.4f} | F1: {clf_metrics.get('f1', 0):.4f} | Accuracy: {clf_metrics.get('accuracy', 0):.4f}")
    print(f"      Regressor  -> R2 Score: {reg_metrics.get('r2', 0):.4f} | MAE: {reg_metrics.get('mae', 0):.4f} | RMSE: {reg_metrics.get('rmse', 0):.4f}")

    # Step 5: Generate Frontend Dashboard Payload
    print("\n[5/5] Exporting Dynamic Frontend Dashboard Payload...")
    dashboard_payload = build_dashboard_payload(enriched_df, quality_rep, model_metrics)
    
    payload_path = OUTPUT_DIR / "dashboard_payload.json"
    with open(payload_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_payload, f, indent=2, default=str)

    quality_path = OUTPUT_DIR / "quality_report.json"
    with open(quality_path, "w", encoding="utf-8") as f:
        json.dump(quality_rep, f, indent=2, default=str)

    metrics_path = OUTPUT_DIR / "model_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(model_metrics, f, indent=2, default=str)

    elapsed = time.time() - start_time
    print(f"\n[OK] PIPELINE EXECUTION SUCCESSFUL in {elapsed:.2f} seconds!")
    print(f"   Outputs generated:")
    print(f"   - Cleaned Dataset: {cleaned_csv_path}")
    print(f"   - Dashboard Payload: {payload_path}")
    print(f"   - Quality Report: {quality_path}")
    print(f"   - Model Metrics: {metrics_path}")
    print("=" * 60)


if __name__ == "__main__":
    run()
