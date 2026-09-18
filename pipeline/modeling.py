from __future__ import annotations
from pathlib import Path
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from pipeline.config import (
    OUTPUT_DIR,
    CLASSIFICATION_LEAKAGE_COLS,
    REGRESSION_LEAKAGE_COLS,
    RANDOM_STATE,
    TEST_SIZE,
    N_ESTIMATORS,
)


def extract_feature_importances(pipeline: Pipeline, num_cols: List[str], cat_cols: List[str]) -> List[Dict[str, Any]]:
    """Extract feature names and importances from trained sklearn pipeline."""
    try:
        model = pipeline.named_steps["model"]
        prep = pipeline.named_steps["prep"]
        
        # Get feature names after one-hot encoding
        cat_encoder = prep.named_transformers_["cat"].named_steps["onehot"]
        encoded_cat_cols = cat_encoder.get_feature_names_out(cat_cols).tolist() if cat_cols else []
        all_feature_names = num_cols + encoded_cat_cols
        importances = model.feature_importances_

        feature_imp = [
            {"feature": name, "importance": float(imp)}
            for name, imp in zip(all_feature_names, importances)
        ]
        return sorted(feature_imp, key=lambda x: x["importance"], reverse=True)[:15]
    except Exception:
        return []


def train_disruption_classifier(df: pd.DataFrame) -> Dict[str, Any]:
    """Train Random Forest Classifier to predict Disruption_Occurred without data leakage."""
    if "Disruption_Occurred" not in df.columns:
        return {}

    target = "Disruption_Occurred"
    feature_cols = [c for c in df.columns if c not in CLASSIFICATION_LEAKAGE_COLS]

    X = df[feature_cols].copy()
    y = df[target].astype(int).copy()

    cat_cols = X.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]), num_cols),
            ("cat", Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
            ]), cat_cols),
        ],
        remainder="drop",
    )

    clf_pipeline = Pipeline([
        ("prep", preprocessor),
        ("model", RandomForestClassifier(
            n_estimators=N_ESTIMATORS,
            random_state=RANDOM_STATE,
            class_weight="balanced_subsample",
            n_jobs=-1,
        )),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    clf_pipeline.fit(X_train, y_train)
    y_pred = clf_pipeline.predict(X_test)
    y_prob = clf_pipeline.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred).tolist()
    top_features = extract_feature_importances(clf_pipeline, num_cols, cat_cols)

    # Save model artifact
    joblib.dump(clf_pipeline, OUTPUT_DIR / "disruption_classifier.joblib")

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "confusion_matrix": cm,
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
        "top_features": top_features,
    }
    return metrics


def train_lead_time_regressor(df: pd.DataFrame) -> Dict[str, Any]:
    """Train Random Forest Regressor to predict Lead_Time_Days without data leakage."""
    if "Lead_Time_Days" not in df.columns:
        return {}

    target = "Lead_Time_Days"
    feature_cols = [c for c in df.columns if c not in REGRESSION_LEAKAGE_COLS]

    X = df[feature_cols].copy()
    y = df[target].astype(float).copy()

    cat_cols = X.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]), num_cols),
            ("cat", Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
            ]), cat_cols),
        ],
        remainder="drop",
    )

    reg_pipeline = Pipeline([
        ("prep", preprocessor),
        ("model", RandomForestRegressor(
            n_estimators=N_ESTIMATORS,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        )),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    reg_pipeline.fit(X_train, y_train)
    y_pred = reg_pipeline.predict(X_test)

    top_features = extract_feature_importances(reg_pipeline, num_cols, cat_cols)

    # Save model artifact
    joblib.dump(reg_pipeline, OUTPUT_DIR / "lead_time_regressor.joblib")

    metrics = {
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
        "mae": float(mean_absolute_error(y_test, y_pred)),
        "r2": float(r2_score(y_test, y_pred)),
        "top_features": top_features,
    }
    return metrics


def train_models(df: pd.DataFrame) -> Dict[str, Any]:
    """Train classification and regression models and return metrics dict."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return {
        "classification": train_disruption_classifier(df),
        "regression": train_lead_time_regressor(df),
    }
