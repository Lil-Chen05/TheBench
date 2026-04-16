import { createClient } from "@/lib/supabase/server";
import { getUserBalance, deductCreditsFromUser, addCreditsToUser } from "./profiles";

export interface ParlayPick {
  id: string;
  parlay_id: string;
  player_name: string;
  team_name: string;
  prop_type: string;
  predicted_value: number;
  pick_type: 'over' | 'under';
  odds: number;
  created_at: string;
  // Grading fields — populated by lib/database/grading.ts on advance-day.
  player_prop_id: number | null;
  actual_result: number | null;
  is_winner: boolean | null;
  // Derived from the player_props → players / basketballteams embed in
  // getUserParlays. Null when the embedded rows are missing (prop was
  // deleted after the pick was placed — FK is ON DELETE SET NULL).
  prop?: {
    stat_type: string | null;
    player: { name: string } | null;
    team: { abbr: string } | null;
  } | null;
}

export interface Parlay {
  id: string;
  user_id: string;
  sport: string;
  total_odds: number;
  bet_amount: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'voided';
  simulation_date: string | null;
  placed_at: string;
  created_at: string;
  picks?: ParlayPick[];
}

// Fixed multiplier payouts based on pick count
const PAYOUT_MULTIPLIERS: Record<number, number> = {
  2: 3,
  3: 5,
  4: 10,
  5: 20,
};

export function getPayoutMultiplier(pickCount: number): number {
  return PAYOUT_MULTIPLIERS[pickCount] ?? 1;
}

export interface CreateParlayPick {
  player_prop_id: number;
  pick_type: 'over' | 'under';
}

export interface CreateParlayData {
  userId: string;
  sport: string;
  picks: CreateParlayPick[];
  betAmount: number;
  simulationDate: string; // YYYY-MM-DD — required; all picks must be on this date
}

export interface CreateParlayResult {
  success: boolean;
  parlay?: Parlay;
  error?: string;
}

// Placeholder for parlay_picks.odds (legacy NOT NULL column). The fixed-
// multiplier payout model doesn't use per-pick odds; we store 1.0 so the
// column constraint is satisfied without implying any real odds value.
const LEGACY_PICK_ODDS_PLACEHOLDER = 1.0;

/**
 * Create a parlay from a list of `player_prop_id` picks.
 *
 * Validation order matters — we want to fail cheap before deducting credits:
 *   1. Shape checks (count, bet amount, unique prop ids, sim date format)
 *   2. DB fetch: all referenced props must exist, be active, and share
 *      the provided simulation_date (via their game's game_date)
 *   3. Balance check
 *   4. Deduct → insert parlay → insert picks (rollback on any failure)
 *
 * TODO(hardening): This manually compensates for the lack of a real DB
 * transaction — deduction, parlay insert, and picks insert can each fail
 * independently, and we do best-effort rollbacks between them. A future
 * pass should move this whole flow into a single Postgres function (RPC)
 * so it runs in one atomic transaction.
 */
export async function createParlay(data: CreateParlayData): Promise<CreateParlayResult> {
  const supabase = await createClient();

  // Tracks whether we've actually moved credits out of the user's balance.
  // Only flipped true after a successful deductCreditsFromUser; the outer
  // catch uses it to decide whether a refund is warranted (without this,
  // an exception thrown BEFORE deduction would incorrectly credit the user).
  let balanceDeducted = false;

  try {
    // ── Shape validation (cheap, before any DB writes) ─────────────
    if (data.picks.length < 2 || data.picks.length > 5) {
      return { success: false, error: 'Parlay must have between 2 and 5 picks' };
    }

    if (data.betAmount < 10 || data.betAmount > 1000) {
      return { success: false, error: 'Bet amount must be between $10 and $1000' };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.simulationDate)) {
      return { success: false, error: 'Invalid simulation_date (expected YYYY-MM-DD)' };
    }

    const propIds = data.picks.map((p) => p.player_prop_id);
    if (new Set(propIds).size !== propIds.length) {
      return { success: false, error: 'Duplicate picks on the same prop are not allowed' };
    }

    for (const p of data.picks) {
      if (!Number.isInteger(p.player_prop_id) || p.player_prop_id <= 0) {
        return { success: false, error: 'Invalid player_prop_id' };
      }
      if (p.pick_type !== 'over' && p.pick_type !== 'under') {
        return { success: false, error: 'pick_type must be "over" or "under"' };
      }
    }

    // ── Fetch + validate props ────────────────────────────────────
    const { data: propRows, error: propsErr } = await supabase
      .from('player_props')
      .select(`
        id,
        stat_type,
        line,
        is_active,
        player:players!inner(name),
        team:basketballteams!inner(team_name),
        game:games!inner(game_date)
      `)
      .in('id', propIds);

    if (propsErr) {
      console.error('Error fetching props for parlay:', propsErr);
      return { success: false, error: 'Failed to validate picks' };
    }

    if (!propRows || propRows.length !== propIds.length) {
      return { success: false, error: 'One or more picks reference props that do not exist' };
    }

    // Index the fetched rows so we can denormalize onto parlay_picks in input order.
    const propById = new Map<number, typeof propRows[number]>();
    for (const row of propRows) propById.set(row.id, row);

    for (const pick of data.picks) {
      const row = propById.get(pick.player_prop_id);
      if (!row) {
        return { success: false, error: 'Pick references a missing prop' };
      }
      if (!row.is_active) {
        return { success: false, error: 'One or more picks are no longer active' };
      }
      const game = Array.isArray(row.game) ? row.game[0] : row.game;
      if (!game || game.game_date !== data.simulationDate) {
        return {
          success: false,
          error: 'All picks must be from games on the selected simulation date',
        };
      }
    }

    // ── Balance check + payout ───────────────────────────────────
    const currentBalance = await getUserBalance(data.userId);
    if (currentBalance < data.betAmount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const multiplier = getPayoutMultiplier(data.picks.length);
    const potentialPayout = data.betAmount * multiplier;

    // ── Deduct → insert parlay → insert picks (with rollbacks) ──
    const deducted = await deductCreditsFromUser(data.userId, data.betAmount);
    if (!deducted) {
      return { success: false, error: 'Failed to deduct balance' };
    }
    balanceDeducted = true;

    const { data: parlay, error: parlayError } = await supabase
      .from('parlays')
      .insert({
        user_id: data.userId,
        sport: data.sport,
        total_odds: multiplier, // populated with the fixed multiplier for legacy consumers
        bet_amount: data.betAmount,
        potential_payout: potentialPayout,
        simulation_date: data.simulationDate,
      })
      .select()
      .single();

    if (parlayError || !parlay) {
      console.error('Error creating parlay:', parlayError);
      await addCreditsToUser(data.userId, data.betAmount);
      balanceDeducted = false;
      return { success: false, error: 'Failed to create parlay' };
    }

    const picksData = data.picks.map((pick) => {
      const row = propById.get(pick.player_prop_id)!;
      const player = Array.isArray(row.player) ? row.player[0] : row.player;
      const team = Array.isArray(row.team) ? row.team[0] : row.team;
      return {
        parlay_id: parlay.id,
        player_prop_id: pick.player_prop_id,
        player_name: player?.name ?? 'Unknown',
        team_name: team?.team_name ?? 'Unknown',
        prop_type: row.stat_type,
        predicted_value: Number(row.line),
        pick_type: pick.pick_type,
        odds: LEGACY_PICK_ODDS_PLACEHOLDER,
      };
    });

    const { error: picksError } = await supabase.from('parlay_picks').insert(picksData);

    if (picksError) {
      console.error('Error creating parlay picks:', picksError);
      await supabase.from('parlays').delete().eq('id', parlay.id);
      await addCreditsToUser(data.userId, data.betAmount);
      balanceDeducted = false;
      return { success: false, error: 'Failed to create parlay picks' };
    }

    return { success: true, parlay };
  } catch (error) {
    console.error('Error in createParlay:', error);
    // Only refund if we actually deducted credits — otherwise a pre-deduction
    // exception would incorrectly hand the user free money.
    if (balanceDeducted) {
      try {
        await addCreditsToUser(data.userId, data.betAmount);
      } catch (restoreError) {
        console.error('Failed to restore balance after error:', restoreError);
      }
    }
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function getUserParlays(
  userId: string,
  sport?: string,
  status?: 'pending' | 'won' | 'lost' | 'voided'
): Promise<Parlay[]> {
  const supabase = await createClient();

  try {
    // Embed player_props + players + basketballteams in one round-trip so
    // the history UI can show the player's current name/abbr without a
    // follow-up query. `prop` will be null if the underlying player_props
    // row was deleted (FK is ON DELETE SET NULL) — the component must
    // fall back to the denormalized player_name/team_name columns.
    let query = supabase
      .from('parlays')
      .select(`
        *,
        picks:parlay_picks(
          *,
          prop:player_props(
            stat_type,
            player:players(name),
            team:basketballteams(abbr)
          )
        )
      `)
      .eq('user_id', userId)
      .order('simulation_date', { ascending: false, nullsFirst: false })
      .order('placed_at', { ascending: false });

    if (sport) {
      query = query.eq('sport', sport);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user parlays:', error);
      return [];
    }

    return (data ?? []) as unknown as Parlay[];
  } catch (error) {
    console.error('Error in getUserParlays:', error);
    return [];
  }
}

export async function updateParlayStatus(parlayId: string, status: 'pending' | 'won' | 'lost' | 'voided'): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    // Get the parlay to handle winnings
    const { data: parlay, error: fetchError } = await supabase
      .from('parlays')
      .select('*')
      .eq('id', parlayId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching parlay for status update:', fetchError);
      return false;
    }
    
    // Update the parlay status
    const { error: updateError } = await supabase
      .from('parlays')
      .update({ status })
      .eq('id', parlayId);
    
    if (updateError) {
      console.error('Error updating parlay status:', updateError);
      return false;
    }
    
    // Handle winnings if parlay was won
    if (status === 'won' && parlay) {
      const winningsAdded = await addCreditsToUser(parlay.user_id, parlay.potential_payout);
      if (!winningsAdded) {
        console.error('Failed to add winnings to user balance');
        // Note: We don't rollback the status update as the parlay was actually won
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateParlayStatus:', error);
    return false;
  }
}

export async function getParlayById(parlayId: string): Promise<Parlay | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('parlays')
      .select(`
        *,
        picks:parlay_picks(*)
      `)
      .eq('id', parlayId)
      .single();
    
    if (error) {
      console.error('Error fetching parlay by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getParlayById:', error);
    return null;
  }
}

export async function deleteParlay(parlayId: string): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    // Get the parlay to restore balance if it's pending
    const { data: parlay, error: fetchError } = await supabase
      .from('parlays')
      .select('*')
      .eq('id', parlayId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching parlay for deletion:', fetchError);
      return false;
    }
    
    // Delete the parlay (cascades to picks)
    const { error: deleteError } = await supabase
      .from('parlays')
      .delete()
      .eq('id', parlayId);
    
    if (deleteError) {
      console.error('Error deleting parlay:', deleteError);
      return false;
    }
    
    // Restore balance if parlay was pending
    if (parlay && parlay.status === 'pending') {
      const balanceRestored = await addCreditsToUser(parlay.user_id, parlay.bet_amount);
      if (!balanceRestored) {
        console.error('Failed to restore balance after parlay deletion');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteParlay:', error);
    return false;
  }
}

export async function getParlayStats(userId: string): Promise<{
  totalParlays: number;
  pendingParlays: number;
  wonParlays: number;
  lostParlays: number;
  totalWagered: number;
  totalWon: number;
}> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('parlays')
      .select('status, bet_amount, potential_payout')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching parlay stats:', error);
      return {
        totalParlays: 0,
        pendingParlays: 0,
        wonParlays: 0,
        lostParlays: 0,
        totalWagered: 0,
        totalWon: 0
      };
    }
    
    const parlays = data || [];
    const totalParlays = parlays.length;
    const pendingParlays = parlays.filter(p => p.status === 'pending').length;
    const wonParlays = parlays.filter(p => p.status === 'won').length;
    const lostParlays = parlays.filter(p => p.status === 'lost').length;
    const totalWagered = parlays.reduce((sum, p) => sum + p.bet_amount, 0);
    const totalWon = parlays
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + p.potential_payout, 0);
    
    return {
      totalParlays,
      pendingParlays,
      wonParlays,
      lostParlays,
      totalWagered,
      totalWon
    };
  } catch (error) {
    console.error('Error in getParlayStats:', error);
    return {
      totalParlays: 0,
      pendingParlays: 0,
      wonParlays: 0,
      lostParlays: 0,
      totalWagered: 0,
      totalWon: 0
    };
  }
} 