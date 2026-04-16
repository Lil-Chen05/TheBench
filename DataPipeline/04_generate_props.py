#!/usr/bin/env python3
"""
04_generate_props.py — Generate ML-based player points props for The Bench MVP

INPUTS
------
Model files (from 02_model_fittingv2.py):
  DataPipeline/models/points_q10.pkl      — low quantile (α=0.375)
  DataPipeline/models/points_q50.pkl      — median (α=0.50) — used as the line
  DataPipeline/models/points_q90.pkl      — high quantile (α=0.675)
  DataPipeline/models/feature_cols.pkl    — ordered feature column list
  DataPipeline/models/model_config.pkl    — quantile alphas + training metadata

Feature data (from 01_data_preprocessingv2.py):
  DataPipeline/basketball_data_rolled_with_identity.csv
  (we need the identity columns — PlayerName, Abbr, OppAbbr, Date — to map
   each row back to Supabase player_id/game_id/team_id; the model-ready
   basketball_data_rolled.csv has them stripped.)

Supabase tables (read):
  seasons            — to resolve "2024-25" → season_id
  basketballteams    — to resolve CSV Abbr → team_id
  players            — to resolve (name, team_id) → player_id
  games              — to resolve (date, home_abbr, away_abbr) → game_id

Supabase table (write)  — player_props
---------------------------------------
Expected columns (one row per eligible player-game, upserted):
    season_id      int        (FK to seasons.id)
    game_id        int        (FK to games.id)
    player_id      int        (FK to players.id)
    team_id        int        (the player's team for this game)
    stat_type      text       ("points")
    line           numeric    (median q50 prediction, clipped at 0)
    low_pred       numeric    (q10 prediction, clipped at 0)
    high_pred      numeric    (q90 prediction, clipped at 0)
    model_version  text       (e.g., "lgbm_q10q50q90_v1")
    is_active      bool       (true)

  Unique key for idempotent upsert: (player_id, game_id, stat_type)

  NOTE: migration 006 declared `player_props` with a different shape
  (prop_type/over_line/under_line/over_odds/under_odds). This script targets
  the column list requested in the MVP task. If the live table still matches
  migration 006, a schema update is required before this script can run.

ELIGIBILITY RULES (MVP — points props only)
-------------------------------------------
A player is eligible if, within the 2024-25 season:
  - games_played >= 10   AND
  - avg(Mins)    >= 15

Eligibility is computed from the rolled dataset's raw Mins column before
features are restricted to feature_cols. Players below either threshold
are excluded from the generated props (deep-bench / limited-minutes guys).

Note: the rolled dataset drops each player's FIRST game of the season
(rolling features are NaN there), so a player with 11 raw games appears
as 10 in the rolled data. Thresholds are chosen with that in mind.

WHAT TO VERIFY AFTER RUNNING
----------------------------
1. Script prints "Eligible players: N (of ~700)" — expect ~250-400.
2. Script prints "Upserted N/N props ✓" and final reconciliation shows
   "Props in DB (this season, points)" matching the upserted count.
3. Spot-check in Supabase SQL editor:
     select player_id, game_id, line, low_pred, high_pred
     from player_props
     where stat_type = 'points'
     order by line desc
     limit 10;
   Top lines should be ~20-35 pts (elite USports scorers).
4. Re-run the script — final DB prop count should not change
   (idempotent upsert on (player_id, game_id, stat_type)).
5. Every row satisfies: low_pred <= line <= high_pred and line >= 0
   (the script prints a monotone-check line at the bottom).

USAGE
-----
  python DataPipeline/04_generate_props.py

Environment (same as 03_import_to_supabase.py):
  SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_KEY
(both can live in project-root .env.local; loaded automatically)
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd


# ── Paths ────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
INPUT_CSV = os.path.join(SCRIPT_DIR, "basketball_data_rolled_with_identity.csv")

SEASON_NAME = "2024-25"
SPORT_ID = 1
STAT_TYPE = "points"
MODEL_VERSION = "lgbm_q10q50q90_v1"

# Eligibility thresholds
MIN_GAMES_PLAYED = 10
MIN_AVG_MINUTES = 15.0

PAGE_SIZE = 1000
UPSERT_BATCH_SIZE = 200


# ================================================================
# SUPABASE CLIENT (parity with 03_import_to_supabase.py)
# ================================================================

def get_supabase_client():
    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: supabase-py not installed. Run: pip install supabase")
        sys.exit(1)

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        env_file = os.path.join(PROJECT_ROOT, ".env.local")
        if os.path.exists(env_file):
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip()
                    if k == "NEXT_PUBLIC_SUPABASE_URL" and not url:
                        url = v
                    elif k == "SUPABASE_SERVICE_KEY" and not key:
                        key = v

    if not url:
        print("ERROR: SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL not set")
        sys.exit(1)
    if not key:
        print("ERROR: SUPABASE_SERVICE_KEY not set")
        print("Get your service role key from Supabase Dashboard → Settings → API")
        sys.exit(1)

    print(f"  Supabase URL: {url[:40]}...")
    return create_client(url, key)


def fetch_all(supabase, table, columns="*", filters=None):
    """Paginated SELECT past PostgREST's 1000-row default limit."""
    all_rows = []
    offset = 0
    while True:
        q = supabase.table(table).select(columns)
        if filters:
            for col, val in filters:
                q = q.eq(col, val)
        res = q.range(offset, offset + PAGE_SIZE - 1).execute()
        rows = res.data or []
        all_rows.extend(rows)
        if len(rows) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return all_rows


# ================================================================
# STEP 1 — load models
# ================================================================

print("=" * 60)
print("STEP 1: Loading models and feature list")
print("=" * 60)

required_files = [
    "points_q10.pkl", "points_q50.pkl", "points_q90.pkl",
    "feature_cols.pkl", "model_config.pkl",
]
for fname in required_files:
    p = os.path.join(MODELS_DIR, fname)
    if not os.path.exists(p):
        print(f"ERROR: Missing model artifact: {p}")
        print("Run 02_model_fittingv2.py first.")
        sys.exit(1)

model_low = joblib.load(os.path.join(MODELS_DIR, "points_q10.pkl"))
model_med = joblib.load(os.path.join(MODELS_DIR, "points_q50.pkl"))
model_high = joblib.load(os.path.join(MODELS_DIR, "points_q90.pkl"))
feature_cols = joblib.load(os.path.join(MODELS_DIR, "feature_cols.pkl"))
model_config = joblib.load(os.path.join(MODELS_DIR, "model_config.pkl"))

print(f"  Loaded 3 quantile models + {len(feature_cols)} feature columns")
print(f"  Quantiles: {model_config.get('quantiles')}")


# ================================================================
# STEP 2 — load rolled dataset, filter to 2024-25
# ================================================================

print("\n" + "=" * 60)
print("STEP 2: Loading rolled feature dataset")
print("=" * 60)

if not os.path.exists(INPUT_CSV):
    print(f"ERROR: Feature CSV not found: {INPUT_CSV}")
    print("Run 01_data_preprocessingv2.py first.")
    sys.exit(1)

df = pd.read_csv(INPUT_CSV)
df["Date"] = pd.to_datetime(df["Date"])
df = df[df["Season"] == SEASON_NAME].copy()
print(f"  Rows in {SEASON_NAME}: {len(df):,}")

# Must have opponent info to map to a game row
df = df[df["Opponent"].notna() & df["OppAbbr"].notna()].copy()
print(f"  Rows with opponent info: {len(df):,}")

# Sanity: all feature cols must be present
missing = [c for c in feature_cols if c not in df.columns]
if missing:
    print(f"ERROR: Rolled CSV is missing {len(missing)} feature columns:")
    for c in missing[:10]:
        print(f"    - {c}")
    sys.exit(1)


# ================================================================
# STEP 3 — eligibility filter
# ================================================================

print("\n" + "=" * 60)
print("STEP 3: Applying eligibility filter")
print("=" * 60)
print(f"  Rules: games_played >= {MIN_GAMES_PLAYED}  AND  avg(Mins) >= {MIN_AVG_MINUTES}")

player_agg = df.groupby("PlayerName").agg(
    games=("Mins", "size"),
    avg_mins=("Mins", "mean"),
).reset_index()

eligible_mask = (
    (player_agg["games"] >= MIN_GAMES_PLAYED)
    & (player_agg["avg_mins"] >= MIN_AVG_MINUTES)
)
eligible_players = set(player_agg.loc[eligible_mask, "PlayerName"])

print(f"  Total players in {SEASON_NAME}: {len(player_agg)}")
print(f"  Eligible players            : {len(eligible_players)}")

df_eligible = df[df["PlayerName"].isin(eligible_players)].copy()
print(f"  Eligible player-game rows   : {len(df_eligible):,}")

if len(df_eligible) == 0:
    print("ERROR: No eligible players — aborting.")
    sys.exit(1)


# ================================================================
# STEP 4 — run quantile predictions
# ================================================================

print("\n" + "=" * 60)
print("STEP 4: Running quantile predictions")
print("=" * 60)

X = df_eligible[feature_cols]
pred_low = np.clip(model_low.predict(X), 0, None)
pred_med = np.clip(model_med.predict(X), 0, None)
pred_high = np.clip(model_high.predict(X), 0, None)

# Enforce monotone quantiles: low <= median <= high
pred_med = np.maximum(pred_med, pred_low)
pred_high = np.maximum(pred_high, pred_med)

df_eligible = df_eligible.assign(
    pred_low=pred_low, pred_med=pred_med, pred_high=pred_high,
)

print(f"  Predictions generated: {len(df_eligible):,}")
print(f"  Median line range    : {pred_med.min():.1f} – {pred_med.max():.1f} pts")
print(f"  Median line mean     : {pred_med.mean():.1f} pts")


# ================================================================
# STEP 5 — connect to Supabase, build lookups
# ================================================================

print("\n" + "=" * 60)
print("STEP 5: Building Supabase ID lookups")
print("=" * 60)

supabase = get_supabase_client()

# season_id
season_rows = (
    supabase.table("seasons")
    .select("id, name")
    .eq("sport_id", SPORT_ID)
    .eq("name", SEASON_NAME)
    .execute()
)
if not season_rows.data:
    print(f"ERROR: Season {SEASON_NAME} not found. Run 03_import_to_supabase.py first.")
    sys.exit(1)
season_id = season_rows.data[0]["id"]
print(f"  Season: {SEASON_NAME} → id={season_id}")

# Teams
teams_all = fetch_all(supabase, "basketballteams", "id, abbr")
abbr_to_team_id = {t["abbr"]: t["id"] for t in teams_all}
team_id_to_abbr = {v: k for k, v in abbr_to_team_id.items()}
print(f"  Teams: {len(abbr_to_team_id)}")

# Players → (name, team_id) → player_id
players_all = fetch_all(supabase, "players", "id, name, team_id")
player_lookup = {
    (p["name"], p["team_id"]): p["id"]
    for p in players_all if p.get("team_id") is not None
}
print(f"  Players: {len(player_lookup)}")

# Games in season → (date, home_abbr, away_abbr) → game_id
games_all = fetch_all(
    supabase, "games",
    "id, game_date, home_team_id, away_team_id",
    filters=[("season_id", season_id)],
)
game_lookup = {}
for g in games_all:
    h_abbr = team_id_to_abbr.get(g["home_team_id"])
    a_abbr = team_id_to_abbr.get(g["away_team_id"])
    if h_abbr and a_abbr:
        game_lookup[(g["game_date"], h_abbr, a_abbr)] = g["id"]
print(f"  Games (season): {len(game_lookup)}")


# ================================================================
# STEP 6 — assemble props + upsert
# ================================================================

print("\n" + "=" * 60)
print("STEP 6: Assembling & upserting player_props rows")
print("=" * 60)

props = []
skipped_no_team = 0
skipped_no_player = 0
skipped_no_game = 0
sample_no_player = []
sample_no_game = []

for row in df_eligible.itertuples(index=False):
    name = row.PlayerName
    team_abbr = row.Abbr
    opp_abbr = row.OppAbbr
    date_str = pd.Timestamp(row.Date).strftime("%Y-%m-%d")

    team_id = abbr_to_team_id.get(team_abbr)
    if not team_id:
        skipped_no_team += 1
        continue

    player_id = player_lookup.get((name, team_id))
    if not player_id:
        skipped_no_player += 1
        if len(sample_no_player) < 5:
            sample_no_player.append((name, team_abbr))
        continue

    # Try both orientations — we stored canonical home/away in games
    game_id = (
        game_lookup.get((date_str, team_abbr, opp_abbr))
        or game_lookup.get((date_str, opp_abbr, team_abbr))
    )
    if not game_id:
        skipped_no_game += 1
        if len(sample_no_game) < 5:
            sample_no_game.append((date_str, team_abbr, opp_abbr))
        continue

    props.append({
        "season_id": season_id,
        "game_id": game_id,
        "player_id": player_id,
        "team_id": team_id,
        "stat_type": STAT_TYPE,
        "line": round(float(row.pred_med), 2),
        "low_pred": round(float(row.pred_low), 2),
        "high_pred": round(float(row.pred_high), 2),
        "model_version": MODEL_VERSION,
        "is_active": True,
    })

print(f"  Props to upsert         : {len(props):,}")
print(f"  Skipped (no team match) : {skipped_no_team}")
print(f"  Skipped (no player)     : {skipped_no_player}")
print(f"  Skipped (no game)       : {skipped_no_game}")

if sample_no_player:
    print(f"  Sample missing players: {sample_no_player}")
if sample_no_game:
    print(f"  Sample missing games : {sample_no_game}")

if not props:
    print("ERROR: No props generated — aborting.")
    sys.exit(1)

# Upsert in batches — idempotent on (player_id, game_id, stat_type)
upserted = 0
for i in range(0, len(props), UPSERT_BATCH_SIZE):
    batch = props[i : i + UPSERT_BATCH_SIZE]
    supabase.table("player_props").upsert(
        batch, on_conflict="player_id,game_id,stat_type"
    ).execute()
    upserted += len(batch)
    print(f"    Upserted {upserted}/{len(props)} props", end="\r")
print(f"  Upserted {upserted}/{len(props)} props ✓")


# ================================================================
# STEP 7 — final reconciliation
# ================================================================

print("\n" + "=" * 60)
print("PROP GENERATION COMPLETE — SUMMARY")
print("=" * 60)

props_in_db = fetch_all(
    supabase, "player_props", "id, stat_type, season_id",
    filters=[("season_id", season_id), ("stat_type", STAT_TYPE)],
)

print(f"  Season                 : {SEASON_NAME} (id={season_id})")
print(f"  Eligible players       : {len(eligible_players)}")
print(f"  Eligible player-games  : {len(df_eligible):,}")
print(f"  Props written this run : {len(props):,}")
print(f"  Props in DB (season, {STAT_TYPE}): {len(props_in_db):,}")
print(f"  Model version          : {MODEL_VERSION}")

mono_ok = all(
    p["low_pred"] <= p["line"] <= p["high_pred"] and p["line"] >= 0
    for p in props
)
print(f"  Monotone + non-negative: {'✓' if mono_ok else '✗ VIOLATIONS'}")

print("\nNEXT STEP: wire the parlay builder to query player_props by game_date")
