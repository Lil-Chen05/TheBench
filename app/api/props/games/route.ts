import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PropsGamesResponse, GameWithProps } from "@/types/props";

/**
 * GET /api/props/games?date=YYYY-MM-DD
 *
 * Returns the games on `date` that have at least one active `points` prop,
 * plus the per-game prop count and both teams' id/name/abbr. Used by the
 * game list on /dashboard/play after the user picks a date.
 *
 * Strategy: two small queries + a JS merge.
 *   1. SELECT games for the date with home/away team embeds.
 *   2. SELECT active points props for those game ids; count in JS.
 *   3. Merge, drop games with 0 props, return.
 *
 * We deliberately do NOT use PostgREST aggregate syntax here — the two-query
 * approach is simpler to reason about and the dataset is tiny.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const date = request.nextUrl.searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Missing or invalid `date` (expected YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // 1) Games on the date with both teams embedded.
    //    FK hints disambiguate the two team FKs on games.
    const { data: gamesRows, error: gamesErr } = await supabase
      .from("games")
      .select(
        `
        id,
        game_date,
        home_team:basketballteams!games_home_team_id_fkey(id, team_name, abbr),
        away_team:basketballteams!games_away_team_id_fkey(id, team_name, abbr)
      `,
      )
      .eq("game_date", date);

    if (gamesErr) {
      console.error("Error fetching games for date:", gamesErr);
      return NextResponse.json(
        { error: "Failed to fetch games" },
        { status: 500 },
      );
    }

    if (!gamesRows || gamesRows.length === 0) {
      const body: PropsGamesResponse = { date, games: [] };
      return NextResponse.json(body);
    }

    // 2) Prop counts per game_id (active + points only).
    const gameIds = gamesRows.map((g) => g.id);
    const { data: propRows, error: propsErr } = await supabase
      .from("player_props")
      .select("game_id")
      .eq("is_active", true)
      .eq("stat_type", "points")
      .in("game_id", gameIds);

    if (propsErr) {
      console.error("Error fetching prop counts:", propsErr);
      return NextResponse.json(
        { error: "Failed to fetch prop counts" },
        { status: 500 },
      );
    }

    const propCounts = new Map<number, number>();
    for (const row of propRows ?? []) {
      propCounts.set(row.game_id, (propCounts.get(row.game_id) ?? 0) + 1);
    }

    // 3) Merge, filter out games with 0 props, normalize team shape.
    const games: GameWithProps[] = [];
    for (const g of gamesRows) {
      const count = propCounts.get(g.id) ?? 0;
      if (count === 0) continue;

      // Supabase returns 1:1 embeds as object, but the generated type is array.
      const home = Array.isArray(g.home_team) ? g.home_team[0] : g.home_team;
      const away = Array.isArray(g.away_team) ? g.away_team[0] : g.away_team;
      if (!home || !away) continue;

      games.push({
        id: g.id,
        game_date: g.game_date,
        home_team: { id: home.id, name: home.team_name, abbr: home.abbr },
        away_team: { id: away.id, name: away.team_name, abbr: away.abbr },
        prop_count: count,
      });
    }

    // Stable sort by home team abbr for a predictable UI order.
    games.sort((a, b) => a.home_team.abbr.localeCompare(b.home_team.abbr));

    const body: PropsGamesResponse = { date, games };
    return NextResponse.json(body);
  } catch (err) {
    console.error("Unexpected error in GET /api/props/games:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
