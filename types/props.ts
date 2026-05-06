/**
 * Types for the /api/props/* endpoints and the rewritten POST /api/parlays.
 * Shared between server route handlers and the client-side parlay builder.
 */

export type StatType = "points"; // MVP is points-only; widen later

// ── GET /api/props/dates ────────────────────────────────────────
export interface PropDatesResponse {
  dates: string[]; // ISO YYYY-MM-DD, ascending
}

// ── GET /api/props/games?date=YYYY-MM-DD ───────────────────────
export interface TeamRef {
  id: number;
  name: string;
  abbr: string;
}

export interface GameWithProps {
  id: number;
  game_date: string; // YYYY-MM-DD
  home_team: TeamRef;
  away_team: TeamRef;
  prop_count: number;
}

export interface PropsGamesResponse {
  date: string;
  games: GameWithProps[];
}

// ── GET /api/props/game/:gameId ────────────────────────────────
export interface PlayerPropRow {
  id: number;
  player_id: number;
  player_name: string;
  team_id: number;
  team_abbr: string;
  stat_type: StatType;
  line: number;
  low_pred: number;
  high_pred: number;
}

export interface PropsForGameResponse {
  game_id: number;
  props: PlayerPropRow[];
}

// ── POST /api/parlays ──────────────────────────────────────────
export interface PlaceParlayPickInput {
  player_prop_id: number;
  pick_type: "over" | "under";
}

export interface PlaceParlayRequest {
  simulation_date: string; // YYYY-MM-DD — must match all picks' game dates
  betAmount: number; // 10–1000
  picks: PlaceParlayPickInput[]; // 2–5 unique prop ids
}
