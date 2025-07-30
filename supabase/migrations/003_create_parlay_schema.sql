-- Create parlays table
CREATE TABLE public.parlays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sport text NOT NULL,
  total_odds decimal(10,2) NOT NULL,
  bet_amount integer NOT NULL CHECK (bet_amount >= 10 AND bet_amount <= 1000),
  potential_payout integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  placed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create parlay_picks table
CREATE TABLE public.parlay_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parlay_id uuid REFERENCES public.parlays(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  team_name text NOT NULL,
  prop_type text NOT NULL,
  predicted_value decimal(6,1) NOT NULL,
  pick_type text NOT NULL CHECK (pick_type IN ('over', 'under')),
  odds decimal(6,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_parlays_user_id ON public.parlays(user_id);
CREATE INDEX idx_parlays_sport ON public.parlays(sport);
CREATE INDEX idx_parlays_placed_at ON public.parlays(placed_at);
CREATE INDEX idx_parlays_status ON public.parlays(status);
CREATE INDEX idx_parlay_picks_parlay_id ON public.parlay_picks(parlay_id);

-- Enable RLS
ALTER TABLE public.parlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parlay_picks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parlays
CREATE POLICY "Users can view own parlays" ON public.parlays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parlays" ON public.parlays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parlays" ON public.parlays
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for parlay_picks
CREATE POLICY "Users can view own parlay picks" ON public.parlay_picks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parlays 
      WHERE parlays.id = parlay_picks.parlay_id 
      AND parlays.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own parlay picks" ON public.parlay_picks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parlays 
      WHERE parlays.id = parlay_picks.parlay_id 
      AND parlays.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own parlay picks" ON public.parlay_picks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.parlays 
      WHERE parlays.id = parlay_picks.parlay_id 
      AND parlays.user_id = auth.uid()
    )
  );

-- Function to enforce max 5 picks per parlay
CREATE OR REPLACE FUNCTION check_parlay_pick_limit()
RETURNS trigger AS $$
BEGIN
  -- Check if adding this pick would exceed 5 picks
  IF (
    SELECT COUNT(*) 
    FROM public.parlay_picks 
    WHERE parlay_id = NEW.parlay_id
  ) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 picks allowed per parlay';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce max 5 picks per parlay
CREATE TRIGGER enforce_parlay_pick_limit
  BEFORE INSERT ON public.parlay_picks
  FOR EACH ROW
  EXECUTE FUNCTION check_parlay_pick_limit();

-- Function to calculate potential payout from American odds
CREATE OR REPLACE FUNCTION calculate_potential_payout()
RETURNS trigger AS $$
DECLARE
  decimal_odds numeric;
BEGIN
  -- Convert American odds to decimal odds for payout calculation
  IF NEW.total_odds > 0 THEN
    -- Positive American odds: (odds/100) + 1
    decimal_odds := (NEW.total_odds / 100) + 1;
  ELSE
    -- Negative American odds: (100/|odds|) + 1
    decimal_odds := (100 / ABS(NEW.total_odds)) + 1;
  END IF;
  
  -- Calculate potential payout: bet_amount * decimal_odds
  NEW.potential_payout := ROUND(NEW.bet_amount * decimal_odds);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate potential payout
CREATE TRIGGER calculate_payout_trigger
  BEFORE INSERT OR UPDATE ON public.parlays
  FOR EACH ROW
  EXECUTE FUNCTION calculate_potential_payout(); 