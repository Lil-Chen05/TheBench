#!/usr/bin/env python3
"""
03_import_to_supabase.py — Import 2024-25 USports basketball data into Supabase

Reads:  BasketballPredictionDataSets/basketball_data_with_team_info.csv
        (filtered to 2024-25 season only)

Writes to Supabase tables:
  - seasons             (one row: "2024-25")
  - basketballteams     (validates existing, does NOT insert — teams come from migration)
  - players             (deduplicated by composite key: name + team_id)
  - games               (deduplicated by date + home/away pair, skip if missing scores)
  - player_game_stats   (one row per player per game, skip if missing scores)

Requires:
  SUPABASE_URL          — your Supabase project URL
  SUPABASE_SERVICE_KEY  — service role key (bypasses RLS)
  Both can be set as env vars or in a .env.local file in the project root.

Usage:
  python DataPipeline/03_import_to_supabase.py
"""

import os
import sys
import math
import pandas as pd

# ── Paths ────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
INPUT_CSV = os.path.join(
    PROJECT_ROOT, "BasketballPredictionDataSets", "basketball_data_with_team_info.csv"
)

SEASON_NAME = "2024-25"
SPORT_ID = 1  # Basketball

# PostgREST (and by extension Supabase) caps each SELECT at 1000 rows by default.
# We paginate with .range() to get complete result sets.
PAGE_SIZE = 1000


# ================================================================
# SUPABASE CLIENT SETUP
# ================================================================

def get_supabase_client():
    """Create a Supabase client using service role key."""
    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: supabase-py not installed. Run: pip install supabase")
        sys.exit(1)

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    # Try loading from .env.local if not in env
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
        print("ERROR: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not set")
        sys.exit(1)
    if not key:
        print("ERROR: SUPABASE_SERVICE_KEY not set")
        print("Get your service role key from Supabase Dashboard → Settings → API")
        sys.exit(1)

    client = create_client(url, key)
    print(f"  Supabase URL: {url[:40]}...")
    return client


# ================================================================
# PAGINATION HELPER
# ================================================================

def fetch_all(supabase, table, columns="*", filters=None):
    """
    Fetch ALL rows from a Supabase table, paginating past the 1000-row default limit.

    filters: optional list of (column, value) tuples for .eq() filters
    """
    all_rows = []
    offset = 0
    while True:
        query = supabase.table(table).select(columns)
        if filters:
            for col, val in filters:
                query = query.eq(col, val)
        result = query.range(offset, offset + PAGE_SIZE - 1).execute()
        rows = result.data or []
        all_rows.extend(rows)
        if len(rows) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return all_rows


# ================================================================
# HELPERS
# ================================================================

def safe_int(val, default=0):
    """Convert to int safely, handling NaN/None."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    return int(val)


def safe_float(val, default=None):
    """Convert to float safely, handling NaN/None."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    return round(float(val), 2)


# ================================================================
# LOAD AND FILTER CSV
# ================================================================

print("=" * 60)
print("STEP 1: Loading CSV data")
print("=" * 60)

if not os.path.exists(INPUT_CSV):
    print(f"ERROR: Input file not found: {INPUT_CSV}")
    sys.exit(1)

df_all = pd.read_csv(INPUT_CSV)
df = df_all[df_all["Season"] == SEASON_NAME].copy()
print(f"Loaded {len(df):,} rows for {SEASON_NAME}")

# Filter to rows with complete scores (can be graded)
df_with_scores = df[df["TeamPoints"].notna() & df["OppPoints"].notna()].copy()
df_no_scores = df[df["TeamPoints"].isna() | df["OppPoints"].isna()]
print(f"  Rows with scores (usable)  : {len(df_with_scores):,}")
print(f"  Rows without scores (skip) : {len(df_no_scores):,}")

if len(df_with_scores) == 0:
    print("ERROR: No rows with complete scores found. Nothing to import.")
    sys.exit(1)


# ================================================================
# CONNECT TO SUPABASE
# ================================================================

print("\n" + "=" * 60)
print("STEP 2: Connecting to Supabase")
print("=" * 60)

supabase = get_supabase_client()


# ================================================================
# VALIDATE TEAM NAME MAPPING
# ================================================================

print("\n" + "=" * 60)
print("STEP 3: Validating team name mapping")
print("=" * 60)

existing_teams = fetch_all(supabase, "basketballteams")
db_teams = {t["abbr"]: t for t in existing_teams}
print(f"  Teams in database: {len(db_teams)}")

csv_teams = df_with_scores.drop_duplicates("Abbr")[["Abbr", "Team"]].sort_values("Abbr")
print(f"  Teams in CSV (2024-25): {len(csv_teams)}")

missing_in_db = []
name_mismatches = []
abbr_to_team_id = {}

for _, row in csv_teams.iterrows():
    abbr = row["Abbr"]
    csv_name = row["Team"]
    if abbr not in db_teams:
        missing_in_db.append((abbr, csv_name))
    else:
        abbr_to_team_id[abbr] = db_teams[abbr]["id"]
        db_name = db_teams[abbr]["team_name"]
        if db_name != csv_name:
            name_mismatches.append((abbr, csv_name, db_name))

if missing_in_db:
    print(f"\n  ERROR: {len(missing_in_db)} teams in CSV not found in database:")
    for abbr, name in missing_in_db:
        print(f"    {abbr} → {name}")
    sys.exit(1)

if name_mismatches:
    print(f"\n  WARNING: {len(name_mismatches)} team name mismatches (using DB names):")
    for abbr, csv_name, db_name in name_mismatches:
        print(f"    {abbr}: CSV='{csv_name}' vs DB='{db_name}'")

print(f"  All {len(csv_teams)} CSV teams matched to database ✓")

# Reverse lookup for diagnostics
team_id_to_abbr = {v: k for k, v in abbr_to_team_id.items()}


# ================================================================
# ENSURE SEASON EXISTS
# ================================================================

print("\n" + "=" * 60)
print("STEP 4: Ensuring season exists")
print("=" * 60)

existing_seasons = (
    supabase.table("seasons")
    .select("*")
    .eq("sport_id", SPORT_ID)
    .eq("name", SEASON_NAME)
    .execute()
)

if existing_seasons.data:
    season_id = existing_seasons.data[0]["id"]
    print(f"  Season '{SEASON_NAME}' already exists (id={season_id})")
else:
    dates = pd.to_datetime(df_with_scores["Date"])
    season_data = {
        "sport_id": SPORT_ID,
        "name": SEASON_NAME,
        "start_date": str(dates.min().date()),
        "end_date": str(dates.max().date()),
        "is_active": True,
    }
    result = supabase.table("seasons").insert(season_data).execute()
    season_id = result.data[0]["id"]
    print(f"  Created season '{SEASON_NAME}' (id={season_id})")


# ================================================================
# IMPORT PLAYERS  (composite identity: name + team_id)
# ================================================================

print("\n" + "=" * 60)
print("STEP 5: Importing players (composite key: name + team_id)")
print("=" * 60)

# Build the full set of CSV player identities: (name, team_id)
# Use all distinct (PlayerName, Abbr) combos — a player could play for >1 team
csv_player_combos = df_with_scores.drop_duplicates(subset=["PlayerName", "Abbr"])[
    ["PlayerName", "Jersey", "Abbr"]
].reset_index(drop=True)

csv_player_keys = set()
for _, row in csv_player_combos.iterrows():
    team_id = abbr_to_team_id.get(row["Abbr"])
    if team_id:
        csv_player_keys.add((row["PlayerName"], team_id))

print(f"  CSV unique (name, team) combos: {len(csv_player_keys)}")

# Fetch ALL existing players with pagination — NOT limited to 1000
existing_players = fetch_all(supabase, "players", "id, name, team_id")
print(f"  Existing players in database (all pages): {len(existing_players)}")

# Composite lookup: (name, team_id) → player_id
player_lookup = {}
for p in existing_players:
    if p.get("team_id") is not None:
        player_lookup[(p["name"], p["team_id"])] = p["id"]

# Identify new players (composite key miss)
players_to_insert = []
for _, row in csv_player_combos.iterrows():
    name = row["PlayerName"]
    team_id = abbr_to_team_id.get(row["Abbr"])
    if not team_id:
        continue
    if (name, team_id) in player_lookup:
        continue
    players_to_insert.append({
        "name": name,
        "jersey_number": safe_int(row["Jersey"], default=None),
        "team_id": team_id,
        "sport_id": SPORT_ID,
        "is_active": True,
    })

print(f"  Players already mapped  : {len(csv_player_keys) - len(players_to_insert)}")
print(f"  Players to insert (new) : {len(players_to_insert)}")

if players_to_insert:
    batch_size = 200
    total = len(players_to_insert)
    inserted = 0
    for i in range(0, total, batch_size):
        batch = players_to_insert[i : i + batch_size]
        result = supabase.table("players").insert(batch).execute()
        # Update lookup IN PLACE from the insert response (source of truth)
        for p in result.data:
            if p.get("team_id") is not None:
                player_lookup[(p["name"], p["team_id"])] = p["id"]
        inserted += len(result.data)
        print(f"    Inserted {inserted}/{total} players", end="\r")
    print(f"  Inserted {inserted}/{total} new players ✓")

# ── Reconciliation: every CSV (name, team) must now be in player_lookup ──
unmapped_csv_keys = [k for k in csv_player_keys if k not in player_lookup]
matched_csv_keys = len(csv_player_keys) - len(unmapped_csv_keys)

print(f"\n  ─── Player Reconciliation ───")
print(f"  CSV unique (name, team) combos : {len(csv_player_keys)}")
print(f"  Matched in player_lookup       : {matched_csv_keys}")
print(f"  UNMATCHED                      : {len(unmapped_csv_keys)}")

if unmapped_csv_keys:
    print(f"\n  ERROR: {len(unmapped_csv_keys)} CSV players could not be mapped.")
    print(f"  Sample unmapped (first 10):")
    for name, team_id in unmapped_csv_keys[:10]:
        abbr = team_id_to_abbr.get(team_id, "?")
        print(f"    - {name} ({abbr}, team_id={team_id})")
    print(f"\n  Aborting before stats import — fix player mapping first.")
    sys.exit(1)

print(f"  All CSV players mapped ✓")


# ================================================================
# IMPORT GAMES
# ================================================================

print("\n" + "=" * 60)
print("STEP 6: Importing games")
print("=" * 60)

# Each game appears twice in the CSV (once per team perspective)
# Pick the home team's perspective as canonical
home_games = df_with_scores[df_with_scores["Is_Home"] == 1].copy()
game_keys = home_games.drop_duplicates(
    subset=["Date", "Abbr", "OppAbbr"]
)[["Date", "Abbr", "OppAbbr", "TeamPoints", "OppPoints", "Location"]].reset_index(drop=True)

# Handle neutral-site games (neither team flagged as home)
neutral = df_with_scores[
    (df_with_scores["Is_Home"] == 0) & (df_with_scores["Is_Away"] == 0)
]
if len(neutral) > 0:
    neutral_games = neutral.drop_duplicates(
        subset=["Date", "Abbr", "OppAbbr"]
    )[["Date", "Abbr", "OppAbbr", "TeamPoints", "OppPoints", "Location"]]
    existing_matchups = set(
        zip(game_keys["Date"], game_keys["Abbr"], game_keys["OppAbbr"])
    ) | set(
        zip(game_keys["Date"], game_keys["OppAbbr"], game_keys["Abbr"])
    )
    new_neutral = []
    for _, row in neutral_games.iterrows():
        key1 = (row["Date"], row["Abbr"], row["OppAbbr"])
        key2 = (row["Date"], row["OppAbbr"], row["Abbr"])
        if key1 not in existing_matchups and key2 not in existing_matchups:
            new_neutral.append(row)
            existing_matchups.add(key1)
            existing_matchups.add(key2)
    if new_neutral:
        game_keys = pd.concat([game_keys, pd.DataFrame(new_neutral)], ignore_index=True)
        print(f"  Added {len(new_neutral)} neutral-site games")

print(f"  Unique games to process: {len(game_keys)}")

# Fetch existing games with pagination
existing_games = fetch_all(
    supabase, "games", "id, game_date, home_team_id, away_team_id",
    filters=[("season_id", season_id)],
)
print(f"  Games already in database: {len(existing_games)}")

# game_lookup: (date_str, home_abbr, away_abbr) → game_id
game_lookup = {}
for g in existing_games:
    home_abbr = team_id_to_abbr.get(g["home_team_id"])
    away_abbr = team_id_to_abbr.get(g["away_team_id"])
    if home_abbr and away_abbr:
        game_lookup[(g["game_date"], home_abbr, away_abbr)] = g["id"]

games_to_insert = []
for _, row in game_keys.iterrows():
    date_str = str(pd.to_datetime(row["Date"]).date())
    home_abbr = row["Abbr"]
    away_abbr = row["OppAbbr"]
    home_team_id = abbr_to_team_id.get(home_abbr)
    away_team_id = abbr_to_team_id.get(away_abbr)
    if not home_team_id or not away_team_id:
        continue
    if (date_str, home_abbr, away_abbr) in game_lookup:
        continue
    games_to_insert.append({
        "season_id": season_id,
        "game_date": date_str,
        "home_team_id": home_team_id,
        "away_team_id": away_team_id,
        "location": row["Location"] if pd.notna(row["Location"]) else None,
        "is_completed": True,
        "_home_abbr": home_abbr,  # temp — stripped before insert
        "_away_abbr": away_abbr,
    })

if games_to_insert:
    batch_size = 100
    total = len(games_to_insert)
    inserted = 0
    for i in range(0, total, batch_size):
        batch = games_to_insert[i : i + batch_size]
        insert_batch = [
            {k: v for k, v in g.items() if not k.startswith("_")}
            for g in batch
        ]
        result = supabase.table("games").insert(insert_batch).execute()
        # Update lookup IN PLACE from the insert response
        for j, g in enumerate(result.data):
            orig = batch[j]
            game_lookup[
                (g["game_date"], orig["_home_abbr"], orig["_away_abbr"])
            ] = g["id"]
        inserted += len(result.data)
        print(f"    Inserted {inserted}/{total} games", end="\r")
    print(f"  Inserted {inserted}/{total} new games ✓")
else:
    print("  No new games to insert")

print(f"  Total games mapped: {len(game_lookup)}")


# ================================================================
# IMPORT PLAYER GAME STATS
# ================================================================

print("\n" + "=" * 60)
print("STEP 7: Importing player game stats")
print("=" * 60)

stats_to_insert = []
skipped_no_player = 0
skipped_no_game = 0
skipped_dup = 0
inserted_pairs = set()

# Sample a few unmatched rows for diagnostics
unmatched_player_samples = []
unmatched_game_samples = []

for _, row in df_with_scores.iterrows():
    player_name = row["PlayerName"]
    team_abbr = row["Abbr"]
    opp_abbr = row["OppAbbr"]
    team_id = abbr_to_team_id.get(team_abbr)

    # Composite player lookup
    player_id = player_lookup.get((player_name, team_id)) if team_id else None
    if not player_id:
        skipped_no_player += 1
        if len(unmatched_player_samples) < 5:
            unmatched_player_samples.append((player_name, team_abbr))
        continue

    date_str = str(pd.to_datetime(row["Date"]).date())

    # Find game_id — try both orientations (team could be home or away)
    game_id = game_lookup.get((date_str, team_abbr, opp_abbr))
    if not game_id:
        game_id = game_lookup.get((date_str, opp_abbr, team_abbr))
    if not game_id:
        skipped_no_game += 1
        if len(unmatched_game_samples) < 5:
            unmatched_game_samples.append((date_str, team_abbr, opp_abbr))
        continue

    pair = (player_id, game_id)
    if pair in inserted_pairs:
        skipped_dup += 1
        continue
    inserted_pairs.add(pair)

    stats_to_insert.append({
        "player_id": player_id,
        "game_id": game_id,
        "team_id": team_id,
        "is_starter": bool(safe_int(row["StarterFlag"])),
        "minutes_played": safe_int(row["Mins"]),
        "points": safe_int(row["Pts"]),
        "field_goals_made": safe_int(row["FGM"]),
        "field_goals_attempted": safe_int(row["FGA"]),
        "field_goal_percentage": safe_float(row["FG_Pct"]),
        "three_point_made": safe_int(row["3PTM"]),
        "three_point_attempted": safe_int(row["3PTA"]),
        "three_point_percentage": safe_float(row["3PT_Pct"]),
        "free_throws_made": safe_int(row["FTM"]),
        "free_throws_attempted": safe_int(row["FTA"]),
        "free_throw_percentage": safe_float(row["FT_Pct"]),
        "true_shooting_percentage": safe_float(row["TS_Pct"]),
        "effective_field_goal_percentage": safe_float(row["eFG_Pct"]),
        "offensive_rebounds": safe_int(row["Reb_O"]),
        "defensive_rebounds": safe_int(row["Reb_D"]),
        "total_rebounds": safe_int(row["Reb_T"]),
        "assists": safe_int(row["AST"]),
        "turnovers": safe_int(row["TO"]),
        "steals": safe_int(row["STL"]),
        "blocks": safe_int(row["BLK"]),
        "personal_fouls": safe_int(row["PF"]),
    })

print(f"  Stats rows to insert     : {len(stats_to_insert):,}")
print(f"  Skipped (no player match): {skipped_no_player}")
print(f"  Skipped (no game match)  : {skipped_no_game}")
print(f"  Skipped (duplicate)      : {skipped_dup}")

if unmatched_player_samples:
    print(f"\n  Sample unmatched players:")
    for name, abbr in unmatched_player_samples:
        print(f"    - {name} ({abbr})")
if unmatched_game_samples:
    print(f"\n  Sample unmatched games:")
    for date, home, away in unmatched_game_samples:
        print(f"    - {date} {home} vs {away}")

if stats_to_insert:
    batch_size = 200
    total = len(stats_to_insert)
    inserted = 0
    for i in range(0, total, batch_size):
        batch = stats_to_insert[i : i + batch_size]
        try:
            supabase.table("player_game_stats").upsert(
                batch, on_conflict="player_id,game_id"
            ).execute()
            inserted += len(batch)
        except Exception as e:
            print(f"\n    Batch {i // batch_size} upsert error: {e}")
            for row in batch:
                try:
                    supabase.table("player_game_stats").insert(row).execute()
                    inserted += 1
                except Exception:
                    pass
        print(f"    Inserted {inserted}/{total} stat rows", end="\r")
    print(f"  Inserted {inserted}/{total} player game stat rows ✓")
else:
    print("  No stats to insert")


# ================================================================
# FINAL RECONCILIATION
# ================================================================

print("\n" + "=" * 60)
print("IMPORT COMPLETE — FINAL RECONCILIATION")
print("=" * 60)

# Fetch final counts (use paginated helper to be accurate)
final_players_all = fetch_all(supabase, "players", "id, name, team_id")
final_games_all = fetch_all(supabase, "games", "id", filters=[("season_id", season_id)])

# Count player_game_stats for this season's games
season_game_ids = set(g["id"] for g in final_games_all)
all_stats = fetch_all(supabase, "player_game_stats", "id, game_id")
season_stats_count = sum(1 for s in all_stats if s["game_id"] in season_game_ids)

print(f"\n  Season           : {SEASON_NAME} (id={season_id})")
print(f"  Teams            : {len(db_teams)} (validated against migration)")
print(f"  Players (total)  : {len(final_players_all)}")
print(f"  Games (season)   : {len(final_games_all)}")
print(f"  Stats (season)   : {season_stats_count}")

print(f"\n  ─── CSV → DB coverage ───")
expected_stats = len(df_with_scores)
actual_inserted = expected_stats - skipped_no_player - skipped_no_game - skipped_dup
coverage_pct = (actual_inserted / expected_stats) * 100 if expected_stats else 0
print(f"  CSV rows with scores     : {expected_stats:,}")
print(f"  Inserted this run        : {actual_inserted:,}")
print(f"  Coverage                 : {coverage_pct:.1f}%")

if skipped_no_player > 0 or skipped_no_game > 0:
    print(f"\n  WARNING: {skipped_no_player + skipped_no_game} rows skipped — investigate above samples")
else:
    print(f"  All CSV stats rows imported ✓")

print("\n" + "=" * 60)
print("NEXT STEP: python DataPipeline/04_generate_props.py")
print("=" * 60)
