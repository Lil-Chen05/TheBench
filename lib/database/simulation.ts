import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Read/write helpers for the global `simulation_state` row introduced in
 * migration 012.
 *
 * These helpers take a Supabase client as a parameter rather than building
 * one internally so that the grading engine (Chunk B) can thread a single
 * client through the whole advance-day flow. The read helpers work with
 * any authenticated client — migration 012 grants SELECT to the
 * `authenticated` role. The write helper requires a client with
 * service-role privileges: the table has no write policy, so anon/user
 * sessions are silently blocked by RLS and the UPDATE will affect zero
 * rows. Callers are responsible for providing the right client.
 *
 * Column is `sim_date` (not `current_date`) to avoid colliding with the
 * PostgreSQL reserved keyword CURRENT_DATE. See migration 012 for the
 * full rationale.
 */

/** YYYY-MM-DD — the only date users may build parlays against. */
export type SimulationDate = string;

/**
 * Fetch the current global simulation date.
 *
 * Throws if the settings row is missing. Migration 012 seeds the row on
 * apply, so this should only happen if the seed SELECT produced NULL
 * (i.e. `player_props` was empty at migration time) — in that case the
 * caller should surface a clearer "no simulation state configured" error.
 */
export async function getCurrentSimulationDate(
  supabase: SupabaseClient,
): Promise<SimulationDate> {
  const { data, error } = await supabase
    .from("simulation_state")
    .select("sim_date")
    .eq("id", true)
    .single();

  if (error) {
    throw new Error(`Failed to read simulation_state: ${error.message}`);
  }
  if (!data?.sim_date) {
    throw new Error(
      "simulation_state row is missing — did migration 012 seed correctly?",
    );
  }
  return data.sim_date as SimulationDate;
}

/**
 * Overwrite the current global simulation date.
 *
 * Requires a service-role Supabase client. Regular user sessions will hit
 * RLS and update zero rows — we explicitly check the affected row count
 * to fail loudly instead of silently no-op'ing.
 */
export async function setCurrentSimulationDate(
  supabase: SupabaseClient,
  date: SimulationDate,
): Promise<void> {
  const { error, count } = await supabase
    .from("simulation_state")
    .update({ sim_date: date }, { count: "exact" })
    .eq("id", true);

  if (error) {
    throw new Error(
      `Failed to update simulation_state.sim_date: ${error.message}`,
    );
  }
  if (count === 0) {
    throw new Error(
      "setCurrentSimulationDate updated 0 rows — is this a service-role client?",
    );
  }
}

/**
 * Find the next date strictly after `after` that has at least one active
 * `player_props` row whose game is scheduled for that date. Returns
 * `null` when no such date exists — the caller decides whether that
 * means "end of season" or "stay put on the current date".
 *
 * Implementation: two sequential queries instead of a PostgREST embed
 * filter. player_props has no date column, so we fetch the distinct
 * game_ids of currently-active props, then look up the minimum
 * game_date strictly greater than `after` among those games. This is
 * more verbose than a clever !inner embed, but has unambiguous
 * semantics and no surprises around which table a filter binds to.
 */
export async function getNextActivePropDate(
  supabase: SupabaseClient,
  after: SimulationDate,
): Promise<SimulationDate | null> {
  // 1. Active prop game_ids
  const { data: propRows, error: propErr } = await supabase
    .from("player_props")
    .select("game_id")
    .eq("is_active", true);

  if (propErr) {
    throw new Error(
      `Failed to list active prop game_ids: ${propErr.message}`,
    );
  }

  const gameIds = Array.from(
    new Set(((propRows ?? []) as { game_id: number }[]).map((r) => r.game_id)),
  );
  if (gameIds.length === 0) return null;

  // 2. Earliest game_date strictly > `after` among those games.
  const { data: gameRows, error: gameErr } = await supabase
    .from("games")
    .select("game_date")
    .in("id", gameIds)
    .gt("game_date", after)
    .order("game_date", { ascending: true })
    .limit(1);

  if (gameErr) {
    throw new Error(
      `Failed to query next active game_date: ${gameErr.message}`,
    );
  }

  const nextDate = (gameRows?.[0] as { game_date?: string } | undefined)
    ?.game_date;
  return nextDate ?? null;
}
