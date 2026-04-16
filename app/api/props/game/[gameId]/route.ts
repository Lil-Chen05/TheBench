import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  PropsForGameResponse,
  PlayerPropRow,
  StatType,
} from "@/types/props";

/**
 * GET /api/props/game/[gameId]
 *
 * Returns the active `points` props for a single game, joined to the player
 * (name) and team (abbr). Used by the PropList component once a user picks a
 * game on /dashboard/play.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId: gameIdStr } = await params;
    const gameId = Number(gameIdStr);
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return NextResponse.json(
        { error: "Invalid gameId" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("player_props")
      .select(
        `
        id,
        player_id,
        team_id,
        stat_type,
        line,
        low_pred,
        high_pred,
        player:players!inner(name),
        team:basketballteams!inner(abbr)
      `,
      )
      .eq("game_id", gameId)
      .eq("is_active", true)
      .eq("stat_type", "points");

    if (error) {
      console.error("Error fetching props for game:", error);
      return NextResponse.json(
        { error: "Failed to fetch props" },
        { status: 500 },
      );
    }

    const props: PlayerPropRow[] = [];
    for (const row of data ?? []) {
      const player = Array.isArray(row.player) ? row.player[0] : row.player;
      const team = Array.isArray(row.team) ? row.team[0] : row.team;
      if (!player || !team) continue;

      props.push({
        id: row.id,
        player_id: row.player_id,
        player_name: player.name,
        team_id: row.team_id,
        team_abbr: team.abbr,
        stat_type: row.stat_type as StatType,
        line: Number(row.line),
        low_pred: Number(row.low_pred),
        high_pred: Number(row.high_pred),
      });
    }

    // Sort by line desc so higher-scoring players show first — a reasonable
    // default for the UI. Client can re-sort as needed.
    props.sort((a, b) => b.line - a.line);

    const body: PropsForGameResponse = { game_id: gameId, props };
    return NextResponse.json(body);
  } catch (err) {
    console.error("Unexpected error in GET /api/props/game/[gameId]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
