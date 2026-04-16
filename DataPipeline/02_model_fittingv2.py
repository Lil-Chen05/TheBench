#!/usr/bin/env python3
"""
02_model_fittingv2.py — Standalone model training for The Bench

Reads:  DataPipeline/basketball_data_rolled.csv
        (player-level rolling + EWM features, output of 01_data_preprocessingv2.py)

Writes: DataPipeline/models/points_q10.pkl   (low quantile model — alpha=0.375)
        DataPipeline/models/points_q50.pkl   (median model — alpha=0.50)
        DataPipeline/models/points_q90.pkl   (high quantile model — alpha=0.675)
        DataPipeline/models/feature_cols.pkl  (ordered feature column list)

The quantile alphas (0.375 / 0.50 / 0.675) were tuned via Optuna + house-edge
analysis in a prior Colab exploration. The hyperparameters below are the best
results from that search — we retrain with those fixed params here.
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_absolute_error
import warnings

warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV = os.path.join(SCRIPT_DIR, "basketball_data_rolled.csv")
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)


# ================================================================
# LOAD DATA
# ================================================================

print("=" * 60)
print("STEP 1: Loading data")
print("=" * 60)

if not os.path.exists(INPUT_CSV):
    print(f"ERROR: Input file not found: {INPUT_CSV}")
    print("Run 01_data_preprocessingv2.py first.")
    sys.exit(1)

df = pd.read_csv(INPUT_CSV)
df["Date"] = pd.to_datetime(df["Date"])

print(f"Loaded {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"Seasons: {sorted(df['Season'].unique())}")
print(f"NaN count: {df.isnull().sum().sum()}")


# ================================================================
# TRAIN / VALIDATION / TEST SPLIT (TIME-BASED)
# ================================================================

print("\n" + "=" * 60)
print("STEP 2: Time-based train/val/test split")
print("=" * 60)

train_seasons = [
    "2014-15", "2015-16", "2016-17", "2018-19",
    "2019-20", "2020-21", "2021-22",
]
val_season = ["2022-23"]
test1_season = ["2023-24"]
test2_season = ["2024-25"]

train = df[df["Season"].isin(train_seasons)].copy()
val = df[df["Season"].isin(val_season)].copy()
test1 = df[df["Season"].isin(test1_season)].copy()
test2 = df[df["Season"].isin(test2_season)].copy()

# Define features and target
drop_cols = ["Pts", "Season", "Date"]
feature_cols = [c for c in df.columns if c not in drop_cols]

X_train, y_train = train[feature_cols], train["Pts"]
X_val, y_val = val[feature_cols], val["Pts"]
X_test1, y_test1 = test1[feature_cols], test1["Pts"]
X_test2, y_test2 = test2[feature_cols], test2["Pts"]

print(f"  Train    : {X_train.shape[0]:>6,} rows  {X_train.shape[1]} features")
print(f"  Validate : {X_val.shape[0]:>6,} rows  {X_val.shape[1]} features")
print(f"  Test 1   : {X_test1.shape[0]:>6,} rows  {X_test1.shape[1]} features")
print(f"  Test 2   : {X_test2.shape[0]:>6,} rows  {X_test2.shape[1]} features")
print(f"  Total    : {X_train.shape[0] + X_val.shape[0] + X_test1.shape[0] + X_test2.shape[0]:>6,} rows")

# Verify no date overlap
train_dates = set(train["Date"])
val_dates = set(val["Date"])
test1_dates = set(test1["Date"])
test2_dates = set(test2["Date"])

print(f"\nDate overlap checks (all should be 0):")
print(f"  Train ∩ Val   : {len(train_dates & val_dates)}")
print(f"  Train ∩ Test1 : {len(train_dates & test1_dates)}")
print(f"  Val   ∩ Test1 : {len(val_dates & test1_dates)}")
print(f"  Test1 ∩ Test2 : {len(test1_dates & test2_dates)}")

# Target distribution
print(f"\nTarget (Pts) distribution:")
for name, y in [("Train", y_train), ("Val", y_val),
                ("Test1", y_test1), ("Test2", y_test2)]:
    print(f"  {name:7} — mean: {y.mean():.2f}  std: {y.std():.2f}  "
          f"median: {y.median():.1f}  zeros: {(y == 0).mean() * 100:.1f}%")


# ================================================================
# TRAIN FINAL MODELS (tuned hyperparams from prior Optuna search)
# ================================================================

print("\n" + "=" * 60)
print("STEP 3: Training final quantile models")
print("=" * 60)

# Best hyperparameters from Optuna (50 trials per quantile)
best_params = {
    "low": {
        "learning_rate": 0.04464811881257917,
        "num_leaves": 31,
        "min_child_samples": 48,
        "feature_fraction": 0.5173230999161147,
        "bagging_fraction": 0.9855574155971412,
        "bagging_freq": 10,
        "lambda_l1": 6.191444319604984,
        "lambda_l2": 9.780724554369465,
    },
    "median": {
        "learning_rate": 0.049352586820665775,
        "num_leaves": 31,
        "min_child_samples": 20,
        "feature_fraction": 0.5017876589323725,
        "bagging_fraction": 0.728308382749095,
        "bagging_freq": 5,
        "lambda_l1": 9.679967744758939,
        "lambda_l2": 0.3248758454576567,
    },
    "high": {
        "learning_rate": 0.0442518957632563,
        "num_leaves": 31,
        "min_child_samples": 50,
        "feature_fraction": 0.5085930751344795,
        "bagging_fraction": 0.9869601043141659,
        "bagging_freq": 10,
        "lambda_l1": 8.55839209640483,
        "lambda_l2": 6.957700515599782,
    },
}

# Quantile alphas tuned for house-edge profitability
quantiles = {
    "low": 0.375,
    "median": 0.50,
    "high": 0.675,
}

final_models = {}

for name, alpha in quantiles.items():
    print(f"\n  Training {name} model (alpha={alpha})...")
    params = {
        "objective": "quantile",
        "alpha": alpha,
        "boosting_type": "gbdt",
        "n_estimators": 3000,
        "verbose": -1,
        "n_jobs": -1,
        "random_state": 42,
        **best_params[name],
    }
    model = lgb.LGBMRegressor(**params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[
            lgb.early_stopping(stopping_rounds=50, verbose=False),
            lgb.log_evaluation(period=200),
        ],
    )
    final_models[name] = model
    print(f"  Best iteration: {model.best_iteration_}")


# ================================================================
# EVALUATE ON VALIDATION SET
# ================================================================

print("\n" + "=" * 60)
print("STEP 4: Validation evaluation")
print("=" * 60)


def pinball_loss(y_true, y_pred, alpha):
    """Quantile loss (pinball loss)."""
    errors = y_true - y_pred
    return np.mean(np.where(errors >= 0, alpha * errors, (alpha - 1) * errors))


def evaluate_split(y_true, X_features, preds):
    """Print evaluation metrics for a data split."""
    mae = mean_absolute_error(y_true, preds["median"])
    rmse = np.sqrt(np.mean((y_true - preds["median"]) ** 2))
    ci_width = preds["high"] - preds["low"]
    coverage = np.mean(
        (y_true >= preds["low"]) & (y_true <= preds["high"])
    )
    p_over = np.mean(y_true.values > preds["high"])
    p_under = np.mean(y_true.values < preds["low"])

    print(f"\n  Point Prediction (median model):")
    print(f"    MAE  : {mae:.3f} pts")
    print(f"    RMSE : {rmse:.3f} pts")

    print(f"\n  CI Statistics:")
    print(f"    Inside CI (coverage) : {coverage * 100:.1f}%")
    print(f"    P(actual > high)     : {p_over * 100:.1f}%")
    print(f"    P(actual < low)      : {p_under * 100:.1f}%")
    print(f"    Avg CI width         : {ci_width.mean():.2f} pts")
    print(f"    Median CI width      : {np.median(ci_width):.2f} pts")

    # Coverage by scoring bucket
    print(f"\n  Coverage by scoring bucket:")
    for lo, hi in [(0, 5), (5, 10), (10, 20), (20, 51)]:
        mask = (y_true >= lo) & (y_true < hi)
        if mask.sum() == 0:
            continue
        bkt_cov = np.mean(
            (y_true[mask] >= preds["low"][mask])
            & (y_true[mask] <= preds["high"][mask])
        )
        print(f"    {lo:>2}–{hi:<3} pts → coverage: {bkt_cov * 100:.1f}%  "
              f"n={mask.sum():,}")

    # Star player breakdown (if Pts_last10_mean available)
    if "Pts_last10_mean" in X_features.columns:
        print(f"\n  Star Player Breakdown:")
        for tier_name, tier_mask in {
            "Above Avg (10-15)": (X_features["Pts_last10_mean"] >= 10)
            & (X_features["Pts_last10_mean"] < 15),
            "Star      (15-20)": (X_features["Pts_last10_mean"] >= 15)
            & (X_features["Pts_last10_mean"] < 20),
            "Elite     (20+)  ": (X_features["Pts_last10_mean"] >= 20),
        }.items():
            n = tier_mask.sum()
            if n == 0:
                continue
            actual = y_true[tier_mask].values
            cov = np.mean(
                (actual >= preds["low"][tier_mask])
                & (actual <= preds["high"][tier_mask])
            )
            width = (preds["high"][tier_mask] - preds["low"][tier_mask]).mean()
            tier_mae = mean_absolute_error(actual, preds["median"][tier_mask])
            print(f"    {tier_name} : coverage={cov * 100:.1f}%  "
                  f"width={width:.1f}pts  MAE={tier_mae:.2f}pts  n={n:,}")

    # Pinball losses
    print(f"\n  Pinball losses:")
    for q_name, alpha in quantiles.items():
        loss = pinball_loss(y_true.values, preds[q_name], alpha)
        print(f"    {q_name:7} (α={alpha}): {loss:.4f}")

    return {"mae": mae, "rmse": rmse, "coverage": coverage}


def make_predictions(models, X):
    """Generate clipped predictions from all 3 models."""
    preds = {name: model.predict(X) for name, model in models.items()}
    preds["low"] = np.clip(preds["low"], a_min=0, a_max=None)
    preds["median"] = np.clip(preds["median"], a_min=0, a_max=None)
    return preds


# Validation
val_preds = make_predictions(final_models, X_val)
val_metrics = evaluate_split(y_val, X_val, val_preds)


# ================================================================
# EVALUATE ON TEST SETS
# ================================================================

print("\n" + "=" * 60)
print("STEP 5: Test set evaluation")
print("=" * 60)

# Test 1 (2023-24)
print(f"\n{'─' * 60}")
print(f"  Test 1: 2023-24 season")
print(f"{'─' * 60}")
test1_preds = make_predictions(final_models, X_test1)
test1_metrics = evaluate_split(y_test1, X_test1, test1_preds)

# Test 2 (2024-25) — the season we'll use for the MVP
print(f"\n{'─' * 60}")
print(f"  Test 2: 2024-25 season (MVP target)")
print(f"{'─' * 60}")
test2_preds = make_predictions(final_models, X_test2)
test2_metrics = evaluate_split(y_test2, X_test2, test2_preds)

# Cross-split comparison
print(f"\n{'─' * 60}")
print(f"  Cross-split comparison")
print(f"{'─' * 60}")
print(f"  {'Metric':20} {'Val':>10} {'Test1':>10} {'Test2':>10}")
print(f"  {'─' * 20}  {'─' * 10}  {'─' * 10}  {'─' * 10}")
print(f"  {'MAE':20} {val_metrics['mae']:>10.3f} "
      f"{test1_metrics['mae']:>10.3f} {test2_metrics['mae']:>10.3f}")
print(f"  {'Coverage':20} {val_metrics['coverage'] * 100:>9.1f}% "
      f"{test1_metrics['coverage'] * 100:>9.1f}% "
      f"{test2_metrics['coverage'] * 100:>9.1f}%")


# ================================================================
# SAVE MODELS
# ================================================================

print("\n" + "=" * 60)
print("STEP 6: Saving models")
print("=" * 60)

model_files = {
    "low": os.path.join(MODELS_DIR, "points_q10.pkl"),
    "median": os.path.join(MODELS_DIR, "points_q50.pkl"),
    "high": os.path.join(MODELS_DIR, "points_q90.pkl"),
}

for name, path in model_files.items():
    joblib.dump(final_models[name], path)
    print(f"  Saved {name} model → {path}")

# Save feature column list (needed by prediction script)
feature_cols_path = os.path.join(MODELS_DIR, "feature_cols.pkl")
joblib.dump(feature_cols, feature_cols_path)
print(f"  Saved feature columns ({len(feature_cols)} cols) → {feature_cols_path}")

# Save quantile config for reference
config = {
    "quantiles": quantiles,
    "best_params": best_params,
    "train_seasons": train_seasons,
    "val_season": val_season,
    "test1_season": test1_season,
    "test2_season": test2_season,
    "n_features": len(feature_cols),
    "target": "Pts",
}
config_path = os.path.join(MODELS_DIR, "model_config.pkl")
joblib.dump(config, config_path)
print(f"  Saved model config → {config_path}")

# ── Sample predictions for sanity check ─────────────────────────
print(f"\nSample predictions (first 10 Test2 rows):")
sample = pd.DataFrame({
    "Actual": y_test2.values[:10],
    "Low": test2_preds["low"][:10].round(1),
    "Median": test2_preds["median"][:10].round(1),
    "High": test2_preds["high"][:10].round(1),
    "Width": (test2_preds["high"][:10] - test2_preds["low"][:10]).round(1),
    "In_CI": (
        (y_test2.values[:10] >= test2_preds["low"][:10])
        & (y_test2.values[:10] <= test2_preds["high"][:10])
    ),
})
print(sample.to_string(index=False))

print("\n" + "=" * 60)
print("MODEL TRAINING COMPLETE")
print("=" * 60)
print(f"\nOutputs in {MODELS_DIR}/:")
print(f"  points_q10.pkl    — low quantile model (α={quantiles['low']})")
print(f"  points_q50.pkl    — median model (α={quantiles['median']})")
print(f"  points_q90.pkl    — high quantile model (α={quantiles['high']})")
print(f"  feature_cols.pkl  — {len(feature_cols)} feature column names")
print(f"  model_config.pkl  — quantile + hyperparameter config")
