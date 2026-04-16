import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createParlay } from '@/lib/database/parlays';
import type { PlaceParlayRequest, PlaceParlayPickInput } from '@/types/props';

/**
 * POST /api/parlays
 *
 * Body: PlaceParlayRequest = {
 *   simulation_date: "YYYY-MM-DD",
 *   betAmount: number,                // 10..1000
 *   picks: [{ player_prop_id, pick_type: "over"|"under" }, ...]  // 2..5 unique ids
 * }
 *
 * All deeper validation (prop existence/active/date-match, duplicate picks,
 * balance) happens inside createParlay — this handler is a thin shape check.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<PlaceParlayRequest>;
    const { picks, betAmount, simulation_date: simulationDate } = body;

    if (!Array.isArray(picks) || picks.length === 0) {
      return NextResponse.json({ error: 'Picks are required' }, { status: 400 });
    }

    if (typeof betAmount !== 'number' || !Number.isFinite(betAmount)) {
      return NextResponse.json({ error: 'Valid bet amount is required' }, { status: 400 });
    }

    if (typeof simulationDate !== 'string') {
      return NextResponse.json({ error: 'simulation_date is required' }, { status: 400 });
    }

    for (const pick of picks as PlaceParlayPickInput[]) {
      if (
        typeof pick?.player_prop_id !== 'number' ||
        !Number.isInteger(pick.player_prop_id) ||
        (pick.pick_type !== 'over' && pick.pick_type !== 'under')
      ) {
        return NextResponse.json({ error: 'Invalid pick data structure' }, { status: 400 });
      }
    }

    const result = await createParlay({
      userId: user.id,
      sport: 'basketball',
      picks: picks as PlaceParlayPickInput[],
      betAmount,
      simulationDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create parlay' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      parlay: result.parlay,
      message: 'Parlay placed successfully!',
    });
  } catch (error) {
    console.error('Error in parlay placement API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const status = searchParams.get('status') as 'pending' | 'won' | 'lost' | 'voided' | undefined;

    // Import the getUserParlays function
    const { getUserParlays } = await import('@/lib/database/parlays');
    
    const parlays = await getUserParlays(user.id, sport || undefined, status);

    return NextResponse.json({
      success: true,
      parlays
    });

  } catch (error) {
    console.error('Error in get parlays API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 