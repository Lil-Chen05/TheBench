-- Function to get player's last N games stats
CREATE OR REPLACE FUNCTION get_player_last_n_games(
  p_player_id integer,
  p_stat_type text, -- 'points', 'rebounds', 'assists', 'minutes'
  p_games_count integer DEFAULT 5
)
RETURNS TABLE(
  game_date date,
  stat_value integer,
  opponent text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.game_date,
    CASE 
      WHEN p_stat_type = 'points' THEN pgs.points
      WHEN p_stat_type = 'rebounds' THEN pgs.total_rebounds
      WHEN p_stat_type = 'assists' THEN pgs.assists
      WHEN p_stat_type = 'minutes' THEN pgs.minutes_played
      ELSE 0
    END as stat_value,
    CASE 
      WHEN g.home_team_id = pgs.team_id THEN away_team.team_name
      ELSE home_team.team_name
    END as opponent
  FROM public.player_game_stats pgs
  JOIN public.games g ON pgs.game_id = g.id
  JOIN public.basketballteams home_team ON g.home_team_id = home_team.id
  JOIN public.basketballteams away_team ON g.away_team_id = away_team.id
  WHERE pgs.player_id = p_player_id
    AND g.is_completed = true
  ORDER BY g.game_date DESC
  LIMIT p_games_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get player season averages
CREATE OR REPLACE FUNCTION get_player_season_averages(
  p_player_id integer,
  p_season_name text DEFAULT NULL
)
RETURNS TABLE(
  season_name text,
  games_played bigint,
  avg_points decimal,
  avg_rebounds decimal,
  avg_assists decimal,
  avg_minutes decimal,
  fg_percentage decimal,
  three_point_percentage decimal,
  ft_percentage decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as season_name,
    COUNT(pgs.id) as games_played,
    ROUND(AVG(pgs.points::decimal), 1) as avg_points,
    ROUND(AVG(pgs.total_rebounds::decimal), 1) as avg_rebounds,
    ROUND(AVG(pgs.assists::decimal), 1) as avg_assists,
    ROUND(AVG(pgs.minutes_played::decimal), 1) as avg_minutes,
    ROUND(AVG(pgs.field_goal_percentage), 1) as fg_percentage,
    ROUND(AVG(pgs.three_point_percentage), 1) as three_point_percentage,
    ROUND(AVG(pgs.free_throw_percentage), 1) as ft_percentage
  FROM public.player_game_stats pgs
  JOIN public.games g ON pgs.game_id = g.id
  JOIN public.seasons s ON g.season_id = s.id
  WHERE pgs.player_id = p_player_id
    AND (p_season_name IS NULL OR s.name = p_season_name)
  GROUP BY s.name
  ORDER BY s.name DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular picks for a specific game
CREATE OR REPLACE FUNCTION get_popular_picks_for_game(
  p_game_id integer,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  player_name text,
  team_name text,
  prop_type text,
  over_line decimal,
  under_line decimal,
  over_picks bigint,
  under_picks bigint,
  total_picks bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name as player_name,
    bt.team_name,
    pp.prop_type,
    pp.over_line,
    pp.under_line,
    COALESCE(over_pop.pick_count, 0)::bigint as over_picks,
    COALESCE(under_pop.pick_count, 0)::bigint as under_picks,
    (COALESCE(over_pop.pick_count, 0) + COALESCE(under_pop.pick_count, 0))::bigint as total_picks
  FROM public.player_props pp
  JOIN public.players p ON pp.player_id = p.id
  JOIN public.basketballteams bt ON p.team_id = bt.id
  LEFT JOIN public.pick_popularity over_pop ON pp.id = over_pop.player_prop_id AND over_pop.pick_type = 'over'
  LEFT JOIN public.pick_popularity under_pop ON pp.id = under_pop.player_prop_id AND under_pop.pick_type = 'under'
  WHERE pp.game_id = p_game_id
    AND pp.is_active = true
  ORDER BY total_picks DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming games for favorite teams
CREATE OR REPLACE FUNCTION get_favorite_team_games(
  p_user_id uuid,
  p_days_ahead integer DEFAULT 7
)
RETURNS TABLE(
  game_id integer,
  game_date date,
  home_team text,
  away_team text,
  location text,
  is_favorite_home boolean,
  is_favorite_away boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as game_id,
    g.game_date,
    home_team.team_name as home_team,
    away_team.team_name as away_team,
    g.location,
    EXISTS(SELECT 1 FROM public.user_favorite_teams uft WHERE uft.user_id = p_user_id AND uft.team_id = g.home_team_id) as is_favorite_home,
    EXISTS(SELECT 1 FROM public.user_favorite_teams uft WHERE uft.user_id = p_user_id AND uft.team_id = g.away_team_id) as is_favorite_away
  FROM public.games g
  JOIN public.basketballteams home_team ON g.home_team_id = home_team.id
  JOIN public.basketballteams away_team ON g.away_team_id = away_team.id
  WHERE g.game_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '%s days')
    AND g.is_completed = false
    AND (
      EXISTS(SELECT 1 FROM public.user_favorite_teams uft WHERE uft.user_id = p_user_id AND uft.team_id = g.home_team_id)
      OR
      EXISTS(SELECT 1 FROM public.user_favorite_teams uft WHERE uft.user_id = p_user_id AND uft.team_id = g.away_team_id)
    )
  ORDER BY g.game_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performers by stat category
CREATE OR REPLACE FUNCTION get_top_performers(
  p_stat_type text, -- 'points', 'rebounds', 'assists', 'minutes'
  p_season_name text DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  player_name text,
  team_name text,
  games_played bigint,
  total_stat integer,
  avg_stat decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name as player_name,
    bt.team_name,
    COUNT(pgs.id) as games_played,
    CASE 
      WHEN p_stat_type = 'points' THEN SUM(pgs.points)
      WHEN p_stat_type = 'rebounds' THEN SUM(pgs.total_rebounds)
      WHEN p_stat_type = 'assists' THEN SUM(pgs.assists)
      WHEN p_stat_type = 'minutes' THEN SUM(pgs.minutes_played)
      ELSE 0
    END as total_stat,
    CASE 
      WHEN p_stat_type = 'points' THEN ROUND(AVG(pgs.points::decimal), 1)
      WHEN p_stat_type = 'rebounds' THEN ROUND(AVG(pgs.total_rebounds::decimal), 1)
      WHEN p_stat_type = 'assists' THEN ROUND(AVG(pgs.assists::decimal), 1)
      WHEN p_stat_type = 'minutes' THEN ROUND(AVG(pgs.minutes_played::decimal), 1)
      ELSE 0
    END as avg_stat
  FROM public.player_game_stats pgs
  JOIN public.players p ON pgs.player_id = p.id
  JOIN public.basketballteams bt ON p.team_id = bt.id
  JOIN public.games g ON pgs.game_id = g.id
  JOIN public.seasons s ON g.season_id = s.id
  WHERE (p_season_name IS NULL OR s.name = p_season_name)
    AND g.is_completed = true
  GROUP BY p.id, p.name, bt.team_name
  HAVING COUNT(pgs.id) >= 5 -- Minimum 5 games played
  ORDER BY avg_stat DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- New function: get_players_with_team_info
CREATE OR REPLACE FUNCTION get_players_with_team_info(
  p_team_id integer DEFAULT NULL,
  p_sort_by text DEFAULT 'name', -- 'name', 'jersey_number', 'team_name'
  p_sort_order text DEFAULT 'asc', -- 'asc', 'desc'
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  player_id integer,
  player_name text,
  jersey_number integer,
  team_id integer,
  team_name text,
  team_abbr text,
  city text,
  province text,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as player_id,
    p.name as player_name,
    p.jersey_number,
    p.team_id,
    bt.team_name,
    bt.abbr as team_abbr,
    bt.city,
    bt.province,
    p.is_active
  FROM public.players p
  JOIN public.basketballteams bt ON p.team_id = bt.id
  WHERE p.is_active = true
    AND (p_team_id IS NULL OR p.team_id = p_team_id)
  ORDER BY 
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN p_sort_by = 'jersey_number' AND p_sort_order = 'asc' THEN p.jersey_number END ASC,
    CASE WHEN p_sort_by = 'jersey_number' AND p_sort_order = 'desc' THEN p.jersey_number END DESC,
    CASE WHEN p_sort_by = 'team_name' AND p_sort_order = 'asc' THEN bt.team_name END ASC,
    CASE WHEN p_sort_by = 'team_name' AND p_sort_order = 'desc' THEN bt.team_name END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;