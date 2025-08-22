-- Create sports table for future expansion
CREATE TABLE public.sports (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  abbreviation text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert basketball as the first sport
INSERT INTO public.sports (name, abbreviation) VALUES ('Basketball', 'BBL');

-- Create seasons table
CREATE TABLE public.seasons (
  id serial PRIMARY KEY,
  sport_id integer REFERENCES public.sports(id) NOT NULL,
  name text NOT NULL, -- e.g., "2021-22"
  start_date date,
  end_date date,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sport_id, name)
);

-- Create players table
CREATE TABLE public.players (
  id serial PRIMARY KEY,
  name text NOT NULL,
  jersey_number integer,
  team_id integer REFERENCES public.basketballteams(id),
  sport_id integer REFERENCES public.sports(id) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE public.games (
  id serial PRIMARY KEY,
  season_id integer REFERENCES public.seasons(id) NOT NULL,
  game_date date NOT NULL,
  home_team_id integer REFERENCES public.basketballteams(id) NOT NULL,
  away_team_id integer REFERENCES public.basketballteams(id) NOT NULL,
  location text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_game_stats table (main stats storage)
CREATE TABLE public.player_game_stats (
  id serial PRIMARY KEY,
  player_id integer REFERENCES public.players(id) NOT NULL,
  game_id integer REFERENCES public.games(id) NOT NULL,
  team_id integer REFERENCES public.basketballteams(id) NOT NULL,
  is_starter boolean DEFAULT false,
  minutes_played integer DEFAULT 0,
  
  -- Shooting stats
  points integer DEFAULT 0,
  field_goals_made integer DEFAULT 0,
  field_goals_attempted integer DEFAULT 0,
  field_goal_percentage decimal(5,2),
  three_point_made integer DEFAULT 0,
  three_point_attempted integer DEFAULT 0,
  three_point_percentage decimal(5,2),
  free_throws_made integer DEFAULT 0,
  free_throws_attempted integer DEFAULT 0,
  free_throw_percentage decimal(5,2),
  
  -- Advanced shooting metrics
  true_shooting_percentage decimal(5,2),
  effective_field_goal_percentage decimal(5,2),
  
  -- Rebounding
  offensive_rebounds integer DEFAULT 0,
  defensive_rebounds integer DEFAULT 0,
  total_rebounds integer DEFAULT 0,
  
  -- Other stats
  assists integer DEFAULT 0,
  turnovers integer DEFAULT 0,
  steals integer DEFAULT 0,
  blocks integer DEFAULT 0,
  personal_fouls integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one record per player per game
  UNIQUE(player_id, game_id)
);

-- Create indexes for performance
CREATE INDEX idx_players_team_id ON public.players(team_id);
CREATE INDEX idx_players_sport_id ON public.players(sport_id);
CREATE INDEX idx_players_name ON public.players(name);

CREATE INDEX idx_games_season_id ON public.games(season_id);
CREATE INDEX idx_games_date ON public.games(game_date);
CREATE INDEX idx_games_home_team ON public.games(home_team_id);
CREATE INDEX idx_games_away_team ON public.games(away_team_id);

CREATE INDEX idx_player_game_stats_player_id ON public.player_game_stats(player_id);
CREATE INDEX idx_player_game_stats_game_id ON public.player_game_stats(game_id);
CREATE INDEX idx_player_game_stats_team_id ON public.player_game_stats(team_id);
CREATE INDEX idx_player_game_stats_points ON public.player_game_stats(points);
CREATE INDEX idx_player_game_stats_minutes ON public.player_game_stats(minutes_played);

-- Enable RLS
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for authenticated users)
CREATE POLICY "Everyone can view sports" ON public.sports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view seasons" ON public.seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view players" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view games" ON public.games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view player stats" ON public.player_game_stats FOR SELECT TO authenticated USING (true);