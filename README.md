#  Global Supply Chain Risk Analytics Platform

An enterprise-grade, judge-friendly Supply Chain Risk Analytics SaaS platform built on a 5,000-shipment global logistics dataset. This repository combines a **refactored, leak-free Python data engineering pipeline** with a **modern Cyber-Dark React SaaS Frontend**.

---

## 📌 Project Overview

This analytics product transforms raw supply chain records into actionable risk intelligence. It explains how variables (geopolitical risk, carrier reliability, weather severity, transport mode, fuel prices) interact to cause shipping disruptions, delays, cost inflation, and carbon emissions.

---

## 📁 Repository Structure

```
SUPPLY CHAIN/
├── global_supply_chain_risk_2026_ENRICHED.csv  # Raw global shipment dataset (5,000 records)
├── run_pipeline.py                              # Main Python analytics pipeline runner
├── analysis_pipeline.py                         # Backwards-compatible entry point
├── pipeline/                                    # Refactored Modular Analytics Engine
│   ├── config.py                                # Paths, hyperparameters & leakage definitions
│   ├── data_cleaning.py                         # Null handling, bound validation & deduplication
│   ├── feature_engineering.py                   # Derived risk scores, priority indices & time features
│   ├── modeling.py                              # Sklearn Random Forest Classifier & Regressor
│   └── export_payload.py                        # Generates frontend dashboard JSON payload
├── outputs/                                     # Generated Pipeline Outputs
│   ├── cleaned_supply_chain.csv                 # Processed dataset
│   ├── dashboard_payload.json                   # Dynamic frontend payload
│   ├── model_metrics.json                       # ROC-AUC, R², MAE & feature importances
│   └── quality_report.json                      # Data audit summary
└── frontend/                                    # Cyber-Dark React SaaS Application
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                              # Main layout, tabs & filter state
        ├── components/
        │   ├── common/                          # Header, Sticky Filter Bar, KPI Cards, Insights
        │   ├── overview/                        # Executive Overview Page (60s AI Brief)
        │   ├── relationships/                   # Relationship Explorer (Scatter, Matrix, Flow)
        │   ├── routes/                          # Route Intelligence & Lane Comparison Mode
        │   ├── carriers/                        # Carrier Leaderboard & Tier Analytics
        │   ├── risk/                            # ML Risk Drivers & High-Risk Shipment Audit
        │   ├── sustainability/                  # Cost per KM/Tonne & Emissions Analytics
        │   └── simulator/                       # Real-Time What-If Risk Simulator
        └── data/
            └── payloadLoader.js                 # Payload importer
```

---

## 🛠 Task-by-Task Breakdown

### Task 1: Python Data Cleaning & Validation Engine (`pipeline/data_cleaning.py`)
- Strips whitespace and normalizes string attributes.
- Safely parses datetime fields into structured time components (Year, Month, Day, Weekday).
- Removes duplicate rows and coercively casts candidates to numeric types.
- Enforces strict value bounds (e.g., clipping `Carrier_Reliability_Score` between `0.0` and `1.0`).

### Task 2: Feature Engineering & Priority Indices (`pipeline/feature_engineering.py`)
- Calculates derived lead time delay metrics (`Delay_Days_Recalc`, `Delay_Pct_Recalc`).
- Categorizes geopolitical risk, carrier reliability, and shipment size into operational buckets (*Low/Medium/High*, *Poor/Good/Excellent*).
- Computes a composite **Priority Score** combining geopolitical risk and carrier reliability.

### Task 3: Machine Learning Model Training (`pipeline/modeling.py`)
- **Disruption Classifier (RandomForestClassifier)**: Predicts binary `Disruption_Occurred` while strictly excluding post-disruption target leakage columns (`Lead_Time_Days`, `Delay_Days`, `SLA_Met`).
  - *Accuracy*: **72.4%** | *ROC-AUC*: **81.6%** | *F1 Score*: **77.7%**
- **Lead Time Regressor (RandomForestRegressor)**: Predicts numerical `Lead_Time_Days` with zero target leakage.
  - *R² Score*: **99.9%** | *MAE*: **0.396 days** | *RMSE*: **0.681 days**
- Serializes trained pipelines as `.joblib` artifacts in `outputs/`.

### Task 4: JSON Dashboard Payload Generator (`pipeline/export_payload.py`)
- Aggregates KPIs, monthly trend lines, transport mode economics, weather severity breakdowns, origin-destination route metrics, and carrier leaderboards.
- Computes annotated Pearson correlation matrices ($r$) and samples bivariate scatter data for high-speed UI rendering.
- Exports a single optimized `dashboard_payload.json` file for the frontend.

### Task 5: Dynamic React SaaS Frontend (`frontend/`)
- Built with **React 18**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Recharts**, and **Lucide Icons**.
- **Cyber-Dark Aesthetics**: Glassmorphism containers (`backdrop-blur-md`), glowing border accents, and responsive navigation layout.
- **Sticky Filter Bar**: Real-time filtering across Transport Mode, Weather Condition, Risk Bucket, Carrier Tier, and Search Queries.

### Task 6: 7 Interactive Visual Views
1. **Executive Overview**: 60-second judge story brief, high-level KPI cards, dual-axis monthly lead time & disruption trend chart.
2. **Relationship Explorer**: Interactive bivariate scatter plot (selectable X & Y axes), Pearson correlation heatmap matrix, multi-stage risk flow network, and plain-English "Why this happened" insight cards.
3. **Route Intelligence**: Origin-destination shipping lane cards with side-by-side **Route Comparison Drawer**.
4. **Carrier Analytics**: Carrier reliability tier leaderboard (Poor, Good, Excellent) and delay rankings.
5. **Risk & Delay Analysis**: Top ML disruption drivers (Random Forest feature importances) and 50-item high-risk shipment search table.
6. **Cost & Sustainability**: Unit cost economics ($/KM, $/Tonne) and carbon emissions by transport mode.
7. **What-If Risk Simulator**: Interactive sliders for Carrier Reliability, Geopolitical Risk, Weather Severity, and Mode with instant real-time recalculation of disruption risk, lead time, expected delay, and cost exposure.

---

## ⚡ Quickstart Guide

### Prerequisites
- **Python 3.10+** (with `pandas`, `scikit-learn`, `numpy`, `joblib`)
- **Node.js v18+** & **npm**

---

### Step 1: Run the Python Data Analytics Pipeline

```powershell
# Navigate to project directory
cd "c:\Users\krish\Desktop\ALL PROJECT\DATA ANALYTICS\SUPPLY CHAIN"

# Run the pipeline
python run_pipeline.py
```

*Outputs generated in `outputs/`: `cleaned_supply_chain.csv`, `dashboard_payload.json`, `model_metrics.json`, `quality_report.json`.*

---

### Step 2: Start the React SaaS Frontend

```powershell
# Navigate to the frontend directory
cd "c:\Users\krish\Desktop\ALL PROJECT\DATA ANALYTICS\SUPPLY CHAIN\frontend"

# Install dependencies (if not already installed)
npm install

# Launch development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

### Step 3: Build Production Frontend Bundle

```powershell
cd "c:\Users\krish\Desktop\ALL PROJECT\DATA ANALYTICS\SUPPLY CHAIN\frontend"
npm run build
```

---

## 📊 Key Analytics Insights

- **Primary Disruption Drivers**: Geopolitical Risk Score (**31.4% weight**) and Carrier Reliability (**24.8% weight**) drive over 56% of total disruption outcome variance.
- **Mode Economics**: Air freight ($24.99/km) is 16x more expensive than ocean freight but delivers 8.2x faster transit speed.
- **Sustainability Target**: Air freight emits ~500 kg CO₂ per tonne-km compared to 22 kg CO₂ for ocean/rail freight. Transitioning 15% of non-urgent Air shipments saves ~420,000 kg CO₂ annually.
