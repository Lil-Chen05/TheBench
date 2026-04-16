// Basketball data types for The Bench platform

export interface BasketballTeam {
  id: number;
  team_name: string;
  abbreviation: string;
  conference?: string;
  division?: string;
  is_active: boolean;
  created_at: string;
}

export interface Player {
  id: number;
  name: string;
  jersey_number?: number;
  team_id: number;
  sport_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: number;
  sport_id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Game {
  id: number;
  season_id: number;
  game_date: string;
  home_team_id: number;
  away_team_id: number;
  location?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerGameStats {
  id: number;
  player_id: number;
  game_id: number;
  team_id: number;
  is_starter: boolean;
  minutes_played: number;
  points: number;
  field_goals_made: number;
  field_goals_attempted: number;
  field_goal_percentage?: number;
  three_point_made: number;
  three_point_attempted: number;
  three_point_percentage?: number;
  free_throws_made: number;
  free_throws_attempted: number;
  free_throw_percentage?: number;
  true_shooting_percentage?: number;
  effective_field_goal_percentage?: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  total_rebounds: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  personal_fouls: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerProp {
  id: number;
  player_id: number;
  game_id: number;
  prop_type: 'points' | 'rebounds' | 'assists' | 'minutes';
  over_line: number;
  under_line: number;
  over_odds: number;
  under_odds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PickPopularity {
  id: number;
  player_prop_id: number;
  pick_type: 'over' | 'under';
  pick_count: number;
  last_updated: string;
}

export interface GameWithTeams extends Game {
  home_team: BasketballTeam;
  away_team: BasketballTeam;
  season: Season;
}

export interface PlayerWithTeam extends Player {
  team: BasketballTeam;
}

export interface PlayerStatsWithGame extends PlayerGameStats {
  game: Game;
  player: Player;
}

export interface PopularPick {
  player_name: string;
  team_name: string;
  prop_type: string;
  over_line: number;
  under_line: number;
  over_picks: number;
  under_picks: number;
  total_picks: number;
}

export interface PlayerLastNGames {
  game_date: string;
  stat_value: number;
  opponent: string;
}

export interface PlayerSeasonAverages {
  season_name: string;
  games_played: number;
  avg_points: number;
  avg_rebounds: number;
  avg_assists: number;
  avg_minutes: number;
  fg_percentage: number;
  three_point_percentage: number;
  ft_percentage: number;
}

export interface TopPerformer {
  player_name: string;
  team_name: string;
  games_played: number;
  total_stat: number;
  avg_stat: number;
}

export interface FavoriteTeamGame {
  game_id: number;
  game_date: string;
  home_team: string;
  away_team: string;
  location?: string;
  is_favorite_home: boolean;
  is_favorite_away: boolean;
}
