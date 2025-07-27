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
}

export interface Parlay {
  id: string;
  user_id: string;
  sport: string;
  total_odds: number;
  bet_amount: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost';
  placed_at: string;
  created_at: string;
  picks?: ParlayPick[];
}

export interface CreateParlayData {
  userId: string;
  sport: string;
  picks: Array<{
    player_name: string;
    team_name: string;
    prop_type: string;
    predicted_value: number;
    pick_type: 'over' | 'under';
    odds: number;
  }>;
  betAmount: number;
}

export interface CreateParlayResult {
  success: boolean;
  parlay?: Parlay;
  error?: string;
}

export async function createParlay(data: CreateParlayData): Promise<CreateParlayResult> {
  const supabase = await createClient();
  
  try {
    // Check if user has sufficient balance
    const currentBalance = await getUserBalance(data.userId);
    if (currentBalance < data.betAmount) {
      return {
        success: false,
        error: 'Insufficient balance'
      };
    }

    // Validate bet amount
    if (data.betAmount < 10 || data.betAmount > 1000) {
      return {
        success: false,
        error: 'Bet amount must be between $10 and $1000'
      };
    }

    // Validate picks
    if (data.picks.length < 1 || data.picks.length > 5) {
      return {
        success: false,
        error: 'Parlay must have between 1 and 5 picks'
      };
    }

    // Calculate total odds (multiply all individual odds)
    const totalOdds = data.picks.reduce((total, pick) => {
      // Convert American odds to decimal for calculation
      const decimalOdds = pick.odds > 0 ? (pick.odds / 100) + 1 : (100 / Math.abs(pick.odds)) + 1;
      return total * decimalOdds;
    }, 1);
    
    // Convert back to American odds format
    const americanOdds = totalOdds > 2 ? (totalOdds - 1) * 100 : -100 / (totalOdds - 1);
    
    // Start transaction by deducting balance first
    const balanceDeducted = await deductCreditsFromUser(data.userId, data.betAmount);
    if (!balanceDeducted) {
      return {
        success: false,
        error: 'Failed to deduct balance'
      };
    }
    
    // Create the parlay
    const { data: parlay, error: parlayError } = await supabase
      .from('parlays')
      .insert({
        user_id: data.userId,
        sport: data.sport,
        total_odds: americanOdds,
        bet_amount: data.betAmount
      })
      .select()
      .single();
    
    if (parlayError) {
      console.error('Error creating parlay:', parlayError);
      // Rollback balance deduction
      await addCreditsToUser(data.userId, data.betAmount);
      return {
        success: false,
        error: 'Failed to create parlay'
      };
    }
    
    // Create the parlay picks
    const picksData = data.picks.map(pick => ({
      parlay_id: parlay.id,
      player_name: pick.player_name,
      team_name: pick.team_name,
      prop_type: pick.prop_type,
      predicted_value: pick.predicted_value,
      pick_type: pick.pick_type,
      odds: pick.odds
    }));
    
    const { error: picksError } = await supabase
      .from('parlay_picks')
      .insert(picksData);
    
    if (picksError) {
      console.error('Error creating parlay picks:', picksError);
      // Rollback: delete parlay and restore balance
      await supabase.from('parlays').delete().eq('id', parlay.id);
      await addCreditsToUser(data.userId, data.betAmount);
      return {
        success: false,
        error: 'Failed to create parlay picks'
      };
    }
    
    return {
      success: true,
      parlay
    };
  } catch (error) {
    console.error('Error in createParlay:', error);
    // Ensure balance is restored on any error
    try {
      await addCreditsToUser(data.userId, data.betAmount);
    } catch (restoreError) {
      console.error('Failed to restore balance after error:', restoreError);
    }
    return {
      success: false,
      error: 'Unexpected error occurred'
    };
  }
}

export async function getUserParlays(
  userId: string, 
  sport?: string, 
  status?: 'pending' | 'won' | 'lost'
): Promise<Parlay[]> {
  const supabase = await createClient();
  
  try {
    let query = supabase
      .from('parlays')
      .select(`
        *,
        picks:parlay_picks(*)
      `)
      .eq('user_id', userId)
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
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserParlays:', error);
    return [];
  }
}

export async function updateParlayStatus(parlayId: string, status: 'pending' | 'won' | 'lost'): Promise<boolean> {
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