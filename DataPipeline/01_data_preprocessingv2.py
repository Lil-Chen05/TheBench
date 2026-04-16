#!/usr/bin/env python3
"""
01_data_preprocessingv2.py — Standalone preprocessing for The Bench

Reads:  BasketballPredictionDataSets/basketball_data_with_team_info.csv
        (combined multi-season data with team-level rolling efficiency
         features already computed)

Writes: DataPipeline/basketball_data_rolled.csv
        (player-level rolling + EWM features added, raw stats dropped,
         ready for model training in 02_model_fittingv2.py)
"""

import os
import sys
import pandas as pd
import numpy as np
from tqdm import tqdm
import warnings

warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

INPUT_CSV = os.path.join(
    PROJECT_ROOT, "BasketballPredictionDataSets", "basketball_data_with_team_info.csv"
)
OUTPUT_CSV = os.path.join(SCRIPT_DIR, "basketball_data_rolled.csv")

# Also save a copy with identity columns preserved (needed by later scripts)
OUTPUT_WITH_IDENTITY_CSV = os.path.join(SCRIPT_DIR, "basketball_data_rolled_with_identity.csv")


# ================================================================
# LOAD DATA
# ================================================================

print("=" * 60)
print("STEP 1: Loading data")
print("=" * 60)

if not os.path.exists(INPUT_CSV):
    print(f"ERROR: Input file not found: {INPUT_CSV}")
    sys.exit(1)

df = pd.read_csv(INPUT_CSV)
print(f"Loaded {df.shape[0]:,} rows × {df.shape[1]} columns from:")
print(f"  {INPUT_CSV}")

# ── Basic info ───────────────────────────────────────────────────
print(f"\nSeasons: {sorted(df['Season'].unique())}")
df["Date"] = pd.to_datetime(df["Date"])
print(f"Date range: {df['Date'].min()} → {df['Date'].max()}")


# ================================================================
# DATA QUALITY FIXES
# ================================================================

print("\n" + "=" * 60)
print("STEP 2: Data quality fixes")
print("=" * 60)

# Convert StarterFlag to int (may be True/False strings or 0/1)
df["StarterFlag"] = df["StarterFlag"].astype(int)

# Fix negative minutes (data entry errors)
neg_mins = (df["Mins"] < 0).sum()
if neg_mins > 0:
    print(f"  Fixing {neg_mins} rows with negative Mins → clipped to 0")
    df["Mins"] = df["Mins"].clip(lower=0)

# Remove duplicate rows (same player, same game)
dupes_before = df.duplicated(subset=["Date", "PlayerName", "Abbr"]).sum()
if dupes_before > 0:
    print(f"  Removing {dupes_before} duplicate rows (same player+game)")
    df = df.drop_duplicates(
        subset=["Date", "PlayerName", "Abbr"], keep="first"
    ).reset_index(drop=True)

# Drop placeholder "*" player rows
star_rows = (df["PlayerName"] == "*").sum()
if star_rows > 0:
    print(f"  Removing {star_rows} placeholder '*' player rows")
    df = df[df["PlayerName"] != "*"].reset_index(drop=True)

# Dedup same-day same-player (keep higher minutes)
df = df.sort_values("Mins", ascending=False)
df = df.drop_duplicates(subset=["PlayerName", "Date"], keep="first")
df = df.sort_values(["PlayerName", "Date"]).reset_index(drop=True)

# Mark complete vs incomplete rows (missing Opponent = exhibition/incomplete)
df["IsComplete"] = df["Opponent"].notna()
print(f"  Complete rows (usable for training): {df['IsComplete'].sum():,}")
print(f"  Incomplete rows (rolling only):      {(~df['IsComplete']).sum():,}")

print(f"\nShape after cleanup: {df.shape[0]:,} rows × {df.shape[1]} columns")


# ================================================================
# FILL MISSING Opp_Roll_Def_Eff
# ================================================================

print("\n" + "=" * 60)
print("STEP 3: Filling missing Opp_Roll_Def_Eff")
print("=" * 60)

opp_nans_before = df["Opp_Roll_Def_Eff"].isna().sum()
if opp_nans_before > 0:
    # Fill with season average as fallback
    season_avg = df.groupby("Season")["Opp_Roll_Def_Eff"].transform("mean")
    df["Opp_Roll_Def_Eff"] = df["Opp_Roll_Def_Eff"].fillna(season_avg)
    # Final safety net
    df["Opp_Roll_Def_Eff"] = df["Opp_Roll_Def_Eff"].fillna(
        df["Opp_Roll_Def_Eff"].mean()
    )
    print(f"  Filled {opp_nans_before} NaN values")

print(f"  Opp_Roll_Def_Eff NaNs remaining: {df['Opp_Roll_Def_Eff'].isna().sum()}")


# ================================================================
# TEAM ROTATION PROXY (Roll_Team_Avg_Mins)
# ================================================================

print("\n" + "=" * 60)
print("STEP 4: Computing team rotation proxy (Roll_Team_Avg_Mins)")
print("=" * 60)

if "Roll_Team_Avg_Mins" not in df.columns:
    team_avg_mins = (
        df.groupby(["Abbr", "Season", "Date"])["Mins"]
        .mean()
        .rename("Team_Avg_Mins")
        .reset_index()
    )
    team_avg_mins = team_avg_mins.sort_values(["Abbr", "Season", "Date"])
    team_avg_mins["Roll_Team_Avg_Mins"] = team_avg_mins.groupby(
        ["Abbr", "Season"]
    )["Team_Avg_Mins"].transform(
        lambda x: x.shift(1).rolling(5, min_periods=1).mean()
    )
    df = df.merge(
        team_avg_mins[["Abbr", "Season", "Date", "Roll_Team_Avg_Mins"]],
        on=["Abbr", "Season", "Date"],
        how="left",
    )
    print("  Computed Roll_Team_Avg_Mins from scratch")
else:
    print("  Roll_Team_Avg_Mins already present in data")

# Fill any remaining NaNs in Roll_Team_Avg_Mins
rtam_nans = df["Roll_Team_Avg_Mins"].isna().sum()
if rtam_nans > 0:
    season_avg_mins = df.groupby("Season")["Roll_Team_Avg_Mins"].transform("mean")
    df["Roll_Team_Avg_Mins"] = df["Roll_Team_Avg_Mins"].fillna(season_avg_mins)
    print(f"  Filled {rtam_nans} NaN values")

print(f"  Roll_Team_Avg_Mins NaNs remaining: {df['Roll_Team_Avg_Mins'].isna().sum()}")


# ================================================================
# PLAYER-LEVEL ROLLING FEATURE ENGINEERING
# ================================================================

print("\n" + "=" * 60)
print("STEP 5: Computing player-level rolling features")
print("=" * 60)

player_roll_cols = [
    "Pts", "Mins", "FGA", "3PTM", "3PTA",
    "FTA", "AST", "Reb_T", "STL", "TO",
    "FG_Pct", "FT_Pct", "3PT_Pct", "TS_Pct",
]

windows = [3, 5, 10]
ewm_alphas = [0.1, 0.2, 0.3, 0.5]
agg_funcs = ["mean", "median"]


def make_rolling_features(cols_roll, windows, agg_funcs, df_input):
    """Rolling window features with shift(1) to prevent leakage."""
    df_output = df_input.copy()
    cols_created = []
    for col in cols_roll:
        if col not in df_input.columns:
            continue
        shifted = df_input[col].shift(1)
        for w in windows:
            for fun in agg_funcs:
                new_col = f"{col}_last{w}_{fun}"
                cols_created.append(new_col)
                df_output[new_col] = getattr(
                    shifted.rolling(w, min_periods=1), fun
                )()
    return cols_created, df_output


def make_ewm_features(cols_roll, ewm_alphas, df_input):
    """Exponentially weighted mean features with shift(1)."""
    df_output = df_input.copy()
    cols_created = []
    for col in cols_roll:
        if col not in df_input.columns:
            continue
        shifted = df_input[col].shift(1)
        for alpha in ewm_alphas:
            alpha_str = str(alpha).replace("0.", "").replace(".", "")
            new_col = f"{col}_ewm_{alpha_str}"
            cols_created.append(new_col)
            df_output[new_col] = shifted.ewm(alpha=alpha, min_periods=1).mean()
    return cols_created, df_output


def get_all_rolling_col_names(cols_roll, windows, agg_funcs, ewm_alphas):
    """Get expected column names without running the computation."""
    rolling_cols = [
        f"{col}_last{w}_{fun}"
        for col in cols_roll
        for w in windows
        for fun in agg_funcs
    ]
    ewm_cols = [
        f"{col}_ewm_{str(alpha).replace('0.', '').replace('.', '')}"
        for col in cols_roll
        for alpha in ewm_alphas
    ]
    return rolling_cols, ewm_cols


# ── Verify columns exist ────────────────────────────────────────
missing_cols = [c for c in player_roll_cols if c not in df.columns]
if missing_cols:
    print(f"ERROR: Missing columns: {missing_cols}")
    sys.exit(1)

# ── Expected feature count ───────────────────────────────────────
rolling_cols, ewm_cols = get_all_rolling_col_names(
    player_roll_cols, windows, agg_funcs, ewm_alphas
)
print(f"  Rolling features : {len(rolling_cols)}  "
      f"({len(player_roll_cols)} cols × {len(windows)} windows × {len(agg_funcs)} funcs)")
print(f"  EWM features     : {len(ewm_cols)}  "
      f"({len(player_roll_cols)} cols × {len(ewm_alphas)} alphas)")
print(f"  Total new features: {len(rolling_cols) + len(ewm_cols)}")

# ── Apply per player per season ──────────────────────────────────
df_org = df.copy()
df_org["Date"] = pd.to_datetime(df_org["Date"])
df_org = df_org.sort_values(["PlayerName", "Season", "Date"]).reset_index(drop=True)

name_list = df_org["PlayerName"].unique()
processed_chunks = []
skipped_players = 0
skipped_seasons = 0

for name in tqdm(name_list, desc="Processing players"):
    player_data = df_org[df_org["PlayerName"] == name].copy()

    if len(player_data) < 3:
        skipped_players += 1
        continue

    player_seasons = []

    for season in player_data["Season"].unique():
        season_data = player_data[player_data["Season"] == season].copy()

        if len(season_data) < 2:
            skipped_seasons += 1
            player_seasons.append(season_data)
            continue

        _, season_data = make_rolling_features(
            player_roll_cols, windows, agg_funcs, season_data
        )
        _, season_data = make_ewm_features(
            player_roll_cols, ewm_alphas, season_data
        )
        player_seasons.append(season_data)

    if player_seasons:
        processed_chunks.append(pd.concat(player_seasons, ignore_index=True))

df_rolled = pd.concat(processed_chunks, ignore_index=True)

# ── Drop first-game-of-season rows (all rolling cols are NaN) ───
core_rolling_cols = [f"Pts_last{w}_{f}" for w in windows for f in agg_funcs]
rows_before = len(df_rolled)
df_rolled = df_rolled.dropna(subset=core_rolling_cols).reset_index(drop=True)
rows_after = len(df_rolled)

print(f"\n  Players skipped (< 3 games total)  : {skipped_players}")
print(f"  Season chunks skipped (< 2 games)  : {skipped_seasons}")
print(f"  Rows before NaN drop : {rows_before:,}")
print(f"  Rows after NaN drop  : {rows_after:,}")
print(f"  Rows dropped         : {rows_before - rows_after:,}")

# ── Final NaN check on rolling features ──────────────────────────
all_feature_cols = rolling_cols + ewm_cols
existing_feature_cols = [c for c in all_feature_cols if c in df_rolled.columns]
nan_summary = df_rolled[existing_feature_cols].isnull().sum()
nan_cols = nan_summary[nan_summary > 0]
if len(nan_cols) > 0:
    print(f"\n  WARNING: {len(nan_cols)} rolling feature columns still have NaNs")
else:
    print("  Rolling feature NaNs: None ✓")


# ================================================================
# SAVE WITH IDENTITY (for import scripts)
# ================================================================

print("\n" + "=" * 60)
print("STEP 6: Saving output with identity columns")
print("=" * 60)

# Fix Roll_Team_Avg_Mins NaNs
rtam_nans = df_rolled["Roll_Team_Avg_Mins"].isna().sum()
if rtam_nans > 0:
    season_avg_mins = df_rolled.groupby("Season")["Roll_Team_Avg_Mins"].transform("mean")
    df_rolled["Roll_Team_Avg_Mins"] = df_rolled["Roll_Team_Avg_Mins"].fillna(
        season_avg_mins
    )

df_rolled.to_csv(OUTPUT_WITH_IDENTITY_CSV, index=False)
print(f"  Saved with identity: {OUTPUT_WITH_IDENTITY_CSV}")
print(f"  Shape: {df_rolled.shape[0]:,} rows × {df_rolled.shape[1]} columns")


# ================================================================
# DROP LEAKAGE & BOOKKEEPING COLUMNS (model-ready output)
# ================================================================

print("\n" + "=" * 60)
print("STEP 7: Dropping raw stat and identity columns for model input")
print("=" * 60)

raw_stat_cols = [
    "Mins", "3PT_Pct", "FG_Pct", "FT_Pct", "Reb_O", "Reb_D", "Reb_T",
    "PF", "AST", "TO", "BLK", "STL", "3PTM", "3PTA", "FGM", "FGA",
    "FTM", "FTA", "TS_Pct", "eFG_Pct", "TeamPoints", "OppPoints",
]

identity_cols = [
    "Location", "Team", "Opponent", "Abbr", "Jersey",
    "PlayerName", "OppAbbr", "IsComplete",
]

all_cols_to_drop = raw_stat_cols + identity_cols
# Only drop columns that actually exist
all_cols_to_drop = [c for c in all_cols_to_drop if c in df_rolled.columns]

cols_before = df_rolled.shape[1]
df_model = df_rolled.drop(columns=all_cols_to_drop)

print(f"  Columns dropped : {cols_before - df_model.shape[1]}")
print(f"  Columns remaining: {df_model.shape[1]}")
print(f"  Rows: {df_model.shape[0]:,}")

# ── Final NaN check ──────────────────────────────────────────────
nan_summary = df_model.isnull().sum()
nan_cols = nan_summary[nan_summary > 0]
if len(nan_cols) > 0:
    print(f"\n  WARNING: {len(nan_cols)} columns still have NaNs:")
    print(nan_cols.sort_values(ascending=False))
else:
    print("  Final NaN check: None ✓")

# ── Save ─────────────────────────────────────────────────────────
df_model.to_csv(OUTPUT_CSV, index=False)
print(f"\n  Saved model-ready output: {OUTPUT_CSV}")
print(f"  Shape: {df_model.shape[0]:,} rows × {df_model.shape[1]} columns")

# ── Final column list ────────────────────────────────────────────
print("\nFINAL COLUMNS:")
for i, col in enumerate(df_model.columns.tolist()):
    print(f"  {i:>3}. {col}")

print("\n" + "=" * 60)
print("PREPROCESSING COMPLETE")
print("=" * 60)
