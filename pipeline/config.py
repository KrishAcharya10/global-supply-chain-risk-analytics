from __future__ import annotations
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR
OUTPUT_DIR = BASE_DIR / "outputs"
CHARTS_DIR = OUTPUT_DIR / "charts"

# Model Hyperparameters & Settings
RANDOM_STATE = 42
TEST_SIZE = 0.2
N_ESTIMATORS = 250

# Data Cleaning Candidates
NUMERIC_COLUMNS = [
    "Distance_km",
    "Weight_MT",
    "Fuel_Price_Index",
    "Geopolitical_Risk_Score",
    "Weather_Severity",
    "Carrier_Reliability_Score",
    "Lead_Time_Days",
    "Expected_Lead_Time_Days",
    "Delay_Days",
    "Delay_Percentage",
    "Estimated_Cost_USD",
    "Cost_Per_KM",
    "Cost_Per_Tonne",
    "Carbon_Emission_kg",
    "Emission_Per_Tonne_KM",
    "Risk_Index",
    "Route_Disruption_Rate",
]

# Leakage Columns for Disruption Classification
CLASSIFICATION_LEAKAGE_COLS = {
    "Disruption_Occurred",
    "Lead_Time_Days",
    "Expected_Lead_Time_Days",
    "Delay_Days",
    "Delay_Percentage",
    "Delay_Status",
    "SLA_Met",
    "Route_Disruption_Rate",
    "Chokepoint_Route",
    "Shipment_ID",
    "Date",
    "Year_from_Date",
    "Month_from_Date",
    "Day_from_Date",
}

# Leakage Columns for Lead Time Regression
REGRESSION_LEAKAGE_COLS = {
    "Lead_Time_Days",
    "Disruption_Occurred",
    "Expected_Lead_Time_Days",
    "Delay_Days",
    "Delay_Percentage",
    "Delay_Status",
    "SLA_Met",
    "Route_Disruption_Rate",
    "Chokepoint_Route",
    "Shipment_ID",
    "Date",
    "Year_from_Date",
    "Month_from_Date",
    "Day_from_Date",
}
