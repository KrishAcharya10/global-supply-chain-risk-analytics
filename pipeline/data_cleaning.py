from __future__ import annotations
from pathlib import Path
from typing import Dict, Union
import pandas as pd
import numpy as np
from pipeline.config import NUMERIC_COLUMNS


def resolve_data_path(target_path: Union[str, Path]) -> Path:
    """Find CSV file in target path or return explicit CSV file path."""
    path = Path(target_path)
    if path.is_dir():
        csv_files = sorted(path.glob("*.csv"))
        if not csv_files:
            raise FileNotFoundError(f"No CSV files found in directory: {path}")
        return csv_files[0]

    if path.exists():
        return path

    raise FileNotFoundError(f"Data file not found: {path}")


def load_raw_dataset(path: Union[str, Path]) -> pd.DataFrame:
    """Load raw dataset from resolved path."""
    csv_file = resolve_data_path(path)
    df = pd.read_csv(csv_file)
    return df


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Perform robust data cleaning:
    - Trim text whitespace
    - Parse datetime columns
    - Remove duplicate rows
    - Coerce numeric types safely
    - Enforce value bounds (e.g. reliability score between 0 and 1)
    """
    cleaned = df.copy()

    # Trim whitespace in object/string columns
    for col in cleaned.select_dtypes(include="object").columns:
        cleaned[col] = cleaned[col].astype(str).str.strip()

    # Parse date column
    if "Date" in cleaned.columns:
        cleaned["Date"] = pd.to_datetime(cleaned["Date"], errors="coerce")

    # Remove duplicates
    cleaned = cleaned.drop_duplicates().reset_index(drop=True)

    # Cast candidates to numeric
    for col in NUMERIC_COLUMNS:
        if col in cleaned.columns:
            cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")

    # Enforce bound constraints
    if "Carrier_Reliability_Score" in cleaned.columns:
        cleaned["Carrier_Reliability_Score"] = cleaned["Carrier_Reliability_Score"].clip(0.0, 1.0)

    if "Geopolitical_Risk_Score" in cleaned.columns:
        cleaned["Geopolitical_Risk_Score"] = cleaned["Geopolitical_Risk_Score"].clip(0.0, 10.0)

    return cleaned


def generate_quality_report(df: pd.DataFrame) -> Dict:
    """Generate quality metrics for data audit reporting."""
    return {
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "duplicate_rows": int(df.duplicated().sum()),
        "missing_value_summary": df.isna().sum()[df.isna().sum() > 0].to_dict(),
        "column_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
    }
