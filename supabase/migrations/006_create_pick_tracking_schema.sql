-- Create player_props table for tracking available props
CREATE TABLE public.player_props (
  id serial PRIMARY KEY,
  player_id integer REFERENCES public.players(id) NOT NULL,
  game_id integer REFERENCES public.games(id) NOT NULL,
  prop_type text NOT NULL, -- 'points', 'rebounds', 'assists', 'minutes'
  over_line decimal(4,1) NOT NULL,
  under_line decimal(4,1) NOT NULL,
  over_odds decimal(6,2) NOT NULL,
  under_odds decimal(6,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one prop per player per game per stat type
  UNIQUE(player_id, game_id, prop_type)
);

-- Create pick_popularity table to track how many users pick each option
CREATE TABLE public.pick_popularity (
  id serial PRIMARY KEY,
  player_prop_id integer REFERENCES public.player_props(id) NOT NULL,
  pick_type text NOT NULL CHECK (pick_type IN ('over', 'under')),
  pick_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  
  -- Ensure one record per prop per pick type
  UNIQUE(player_prop_id, pick_type)
);

-- Create favorite_teams junction table (replacing jsonb in profiles)
CREATE TABLE public.user_favorite_teams (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id integer REFERENCES public.basketballteams(id) NOT NULL,
  sport_id integer REFERENCES public.sports(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one record per user per team
  UNIQUE(user_id, team_id)
);

-- Update parlay_picks to reference player_props instead of storing raw data
ALTER TABLE public.parlay_picks 
ADD COLUMN player_prop_id integer REFERENCES public.player_props(id),
ADD COLUMN actual_result decimal(6,1), -- For resolving picks
ADD COLUMN is_winner boolean; -- For tracking win/loss

-- Create indexes for performance
CREATE INDEX idx_player_props_player_id ON public.player_props(player_id);
CREATE INDEX idx_player_props_game_id ON public.player_props(game_id);
CREATE INDEX idx_player_props_prop_type ON public.player_props(prop_type);
CREATE INDEX idx_player_props_active ON public.player_props(is_active);

CREATE INDEX idx_pick_popularity_prop_id ON public.pick_popularity(player_prop_id);
CREATE INDEX idx_pick_popularity_pick_type ON public.pick_popularity(pick_type);

CREATE INDEX idx_user_favorite_teams_user_id ON public.user_favorite_teams(user_id);
CREATE INDEX idx_user_favorite_teams_team_id ON public.user_favorite_teams(team_id);

CREATE INDEX idx_parlay_picks_prop_id ON public.parlay_picks(player_prop_id);

-- Enable RLS
ALTER TABLE public.player_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_popularity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view player props" ON public.player_props 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Everyone can view pick popularity" ON public.pick_popularity 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own favorite teams" ON public.user_favorite_teams 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorite teams" ON public.user_favorite_teams 
  FOR ALL USING (auth.uid() = user_id);

-- Function to update pick popularity when a pick is made
CREATE OR REPLACE FUNCTION update_pick_popularity()
RETURNS trigger AS $$
BEGIN
  -- Insert or update pick popularity count
  INSERT INTO public.pick_popularity (player_prop_id, pick_type, pick_count, last_updated)
  VALUES (NEW.player_prop_id, NEW.pick_type, 1, now())
  ON CONFLICT (player_prop_id, pick_type) 
  DO UPDATE SET 
    pick_count = pick_popularity.pick_count + 1,
    last_updated = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update pick popularity
CREATE TRIGGER update_pick_popularity_trigger
  AFTER INSERT ON public.parlay_picks
  FOR EACH ROW
  WHEN (NEW.player_prop_id IS NOT NULL)
  EXECUTE FUNCTION update_pick_popularity();