import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCurrentSimulationDate,
  setCurrentSimulationDate,
  getNextActivePropDate,
} from "./simulation";

/**
 * Grading engine for the advance-day flow.
 *
 * `advanceDay` is the single entry point. It:
 *   1. Reads the current simulation date.
 *   2. Grades every pending parlay on that date.
 *   3. Advances the simulation date to the next date with active props.
 *
 * Each parlay is processed inside its own try/catch so one failure never
 * blocks the rest. The double-credit guard is an atomic UPDATE with a
 * `WHERE status = 'pending'` predicate — if another call already moved
 * the parlay out of pending, the UPDATE affects zero rows and we skip
 * the balance write.
 *
 * The caller must provide a **service-role** Supabase client. RLS blocks
 * writes on parlays/simulation_state for normal user sessions.
 */

// ── Public result type ───────────────────────────────────────────────

export interface AdvanceResult {
  from_date: string;
  to_date: string | null;
  graded: number;
  won: number;
  lost: number;
  voided: number;
  errored: number;
}

// ── Stat-type → player_game_stats column mapping ─────────────────────

const STAT_COLUMN: Record<string, string> = {
  points: "points",
  rebounds: "total_rebounds",
  assists: "assists",
  steals: "steals",
  blocks: "blocks",
  minutes: "minutes_played",
};

// ── Internal row shapes returned by Supabase queries ─────────────────

interface ParlayRow {
  id: string;
  user_id: string;
  bet_amount: number;
  potential_payout: number;
}

interface PickRow {
  id: string;
  parlay_id: string;
  player_prop_id: number | null;
  pick_type: "over" | "under";
  predicted_value: number;
  prop_type: string;
}

interface PropLookup {
  id: number;
  player_id: number;
  game_id: number;
  stat_type: string;
}

// ── Entry point ──────────────────────────────────────────────────────

export async function advanceDay(
  supabase: SupabaseClient,
): Promise<AdvanceResult> {
  const fromDate = await getCurrentSimulationDate(supabase);

  const counts = { graded: 0, won: 0, lost: 0, voided: 0, errored: 0 };

  // ── 1. Fetch pending parlays for today ────────────────────────────

  const { data: parlays, error: parlayErr } = await supabase
    .from("parlays")
    .select("id, user_id, bet_amount, potential_payout")
    .eq("simulation_date", fromDate)
    .eq("status", "pending");

  if (parlayErr) {
    throw new Error(`Failed to fetch pending parlays: ${parlayErr.message}`);
  }

  if (!parlays || parlays.length === 0) {
    // Nothing to grade — still advance the date.
    const toDate = await advanceDate(supabase, fromDate);
    return { from_date: fromDate, to_date: toDate, ...counts };
  }

  // ── 2. Fetch all picks for these parlays ──────────────────────────

  const parlayIds = parlays.map((p: ParlayRow) => p.id);
  const { data: allPicks, error: picksErr } = await supabase
    .from("parlay_picks")
    .select("id, parlay_id, player_prop_id, pick_type, predicted_value, prop_type")
    .in("parlay_id", parlayIds);

  if (picksErr) {
    throw new Error(`Failed to fetch parlay picks: ${picksErr.message}`);
  }

  // Group picks by parlay_id
  const picksByParlay = new Map<string, PickRow[]>();
  for (const pick of (allPicks ?? []) as PickRow[]) {
    const list = picksByParlay.get(pick.parlay_id) ?? [];
    list.push(pick);
    picksByParlay.set(pick.parlay_id, list);
  }

  // ── 3. Fetch the props referenced by picks (for player_id, game_id)

  const propIds = [
    ...new Set(
      ((allPicks ?? []) as PickRow[])
        .map((p) => p.player_prop_id)
        .filter((id): id is number => id != null),
    ),
  ];

  const propMap = new Map<number, PropLookup>();
  if (propIds.length > 0) {
    const { data: props, error: propErr } = await supabase
      .from("player_props")
      .select("id, player_id, game_id, stat_type")
      .in("id", propIds);

    if (propErr) {
      throw new Error(`Failed to fetch player_props: ${propErr.message}`);
    }
    for (const p of (props ?? []) as PropLookup[]) {
      propMap.set(p.id, p);
    }
  }

  // ── 4. Fetch all player_game_stats for the games involved ─────────
  //    Pre-load in bulk to avoid N+1 queries inside the grading loop.

  const gameIds = [...new Set([...propMap.values()].map((p) => p.game_id))];
  const statsMap = new Map<string, Record<string, number>>();

  if (gameIds.length > 0) {
    const { data: statsRows, error: statsErr } = await supabase
      .from("player_game_stats")
      .select(
        "player_id, game_id, points, total_rebounds, assists, steals, blocks, minutes_played",
      )
      .in("game_id", gameIds);

    if (statsErr) {
      throw new Error(
        `Failed to fetch player_game_stats: ${statsErr.message}`,
      );
    }
    for (const row of statsRows ?? []) {
      const key = `${row.player_id}:${row.game_id}`;
      statsMap.set(key, row as Record<string, number>);
    }
  }

  // ── 5. Grade each parlay ──────────────────────────────────────────

  for (const parlay of parlays as ParlayRow[]) {
    try {
      const picks = picksByParlay.get(parlay.id) ?? [];
      await gradeParlay(supabase, parlay, picks, propMap, statsMap);

      counts.graded++;

      // Re-read to see what status was written.
      const { data: updated } = await supabase
        .from("parlays")
        .select("status")
        .eq("id", parlay.id)
        .single();

      const status = updated?.status as string | undefined;
      if (status === "won") counts.won++;
      else if (status === "lost") counts.lost++;
      else if (status === "voided") counts.voided++;
    } catch (err) {
      counts.errored++;
      console.error(
        `Error grading parlay ${parlay.id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // ── 6. Advance the simulation date ────────────────────────────────

  const toDate = await advanceDate(supabase, fromDate);

  return { from_date: fromDate, to_date: toDate, ...counts };
}

// ── Per-parlay grading ───────────────────────────────────────────────

async function gradeParlay(
  supabase: SupabaseClient,
  parlay: ParlayRow,
  picks: PickRow[],
  propMap: Map<number, PropLookup>,
  statsMap: Map<string, Record<string, number>>,
): Promise<void> {
  // Determine outcome for each pick.
  let shouldVoid = false;
  const pickUpdates: {
    id: string;
    actual_result: number | null;
    is_winner: boolean | null;
  }[] = [];

  for (const pick of picks) {
    if (pick.player_prop_id == null) {
      // Pick is not wired to a prop — void the whole parlay.
      shouldVoid = true;
      pickUpdates.push({ id: pick.id, actual_result: null, is_winner: null });
      continue;
    }

    const prop = propMap.get(pick.player_prop_id);
    if (!prop) {
      shouldVoid = true;
      pickUpdates.push({ id: pick.id, actual_result: null, is_winner: null });
      continue;
    }

    const statsKey = `${prop.player_id}:${prop.game_id}`;
    const stats = statsMap.get(statsKey);
    if (!stats) {
      // No stats row → can't grade this pick → void parlay.
      shouldVoid = true;
      pickUpdates.push({ id: pick.id, actual_result: null, is_winner: null });
      continue;
    }

    const column = STAT_COLUMN[prop.stat_type];
    if (!column) {
      // Unknown stat_type — treat as ungradable.
      shouldVoid = true;
      pickUpdates.push({ id: pick.id, actual_result: null, is_winner: null });
      continue;
    }

    const actual = Number(stats[column] ?? 0);
    // Push rule: actual == line is a loss for both sides (MVP simplification).
    const isWinner =
      pick.pick_type === "over" ? actual > pick.predicted_value : actual < pick.predicted_value;

    pickUpdates.push({ id: pick.id, actual_result: actual, is_winner: isWinner });
  }

  // ── Write pick results ────────────────────────────────────────────

  for (const pu of pickUpdates) {
    await supabase
      .from("parlay_picks")
      .update({ actual_result: pu.actual_result, is_winner: pu.is_winner })
      .eq("id", pu.id);
  }

  // ── Determine parlay-level outcome ────────────────────────────────

  if (shouldVoid) {
    // Atomic gate: only flip if still pending (double-credit guard).
    const { count } = await supabase
      .from("parlays")
      .update({ status: "voided" }, { count: "exact" })
      .eq("id", parlay.id)
      .eq("status", "pending");

    if ((count ?? 0) > 0) {
      // Refund bet_amount.
      await supabase.rpc("update_user_balance", {
        user_id: parlay.user_id,
        amount_change: parlay.bet_amount,
      });
    }
    return;
  }

  const allWon = pickUpdates.every((pu) => pu.is_winner === true);
  const newStatus = allWon ? "won" : "lost";

  // Atomic gate: only flip if still pending.
  const { count } = await supabase
    .from("parlays")
    .update({ status: newStatus }, { count: "exact" })
    .eq("id", parlay.id)
    .eq("status", "pending");

  if ((count ?? 0) > 0 && allWon) {
    // Credit winnings.
    await supabase.rpc("update_user_balance", {
      user_id: parlay.user_id,
      amount_change: parlay.potential_payout,
    });
  }
}

// ── Date advancement helper ──────────────────────────────────────────

async function advanceDate(
  supabase: SupabaseClient,
  current: string,
): Promise<string | null> {
  const next = await getNextActivePropDate(supabase, current);
  if (next) {
    await setCurrentSimulationDate(supabase, next);
  }
  return next;
}
