import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createParlay } from '@/lib/database/parlays';

export async function POST(request: NextRequest) {
  try {
    console.log('Parlay placement API called');
    
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse the request body
    const body = await request.json();
    const { picks, betAmount, sport = 'basketball' } = body;

    console.log('Request data:', { picks: picks?.length, betAmount, sport });

    // Validate required fields
    if (!picks || !Array.isArray(picks) || picks.length === 0) {
      console.error('Invalid picks data:', picks);
      return NextResponse.json(
        { error: 'Picks are required' },
        { status: 400 }
      );
    }

    if (!betAmount || typeof betAmount !== 'number') {
      console.error('Invalid bet amount:', betAmount);
      return NextResponse.json(
        { error: 'Valid bet amount is required' },
        { status: 400 }
      );
    }

    // Validate picks structure
    for (const pick of picks) {
      if (!pick.playerName || !pick.teamName || !pick.propType || 
          typeof pick.predictedValue !== 'number' || 
          !['over', 'under'].includes(pick.pickType) ||
          typeof pick.odds !== 'number') {
        console.error('Invalid pick structure:', pick);
        return NextResponse.json(
          { error: 'Invalid pick data structure' },
          { status: 400 }
        );
      }
    }

    console.log('Validation passed, creating parlay...');

    // Create the parlay using the database helper
    const result = await createParlay({
      userId: user.id,
      sport,
      picks: picks.map(pick => ({
        player_name: pick.playerName,
        team_name: pick.teamName,
        prop_type: pick.propType,
        predicted_value: pick.predictedValue,
        pick_type: pick.pickType,
        odds: pick.odds
      })),
      betAmount
    });

    console.log('Parlay creation result:', result);

    if (!result.success) {
      console.error('Parlay creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create parlay' },
        { status: 400 }
      );
    }

    console.log('Parlay created successfully:', result.parlay?.id);

    return NextResponse.json({
      success: true,
      parlay: result.parlay,
      message: 'Parlay placed successfully!'
    });

  } catch (error) {
    console.error('Error in parlay placement API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    const status = searchParams.get('status') as 'pending' | 'won' | 'lost' | undefined;

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