-- Create useful views for basketball data display
-- These views will provide consistent, optimized data for your frontend

-- View 1: Active Games with Team Information
CREATE OR REPLACE VIEW public.active_games_view AS
SELECT 
  g.id as game_id,
  g.game_date,
  g.location,
  g.is_completed,
  s.name as season_name,
  s.id as season_id,
  home_team.id as home_team_id,
  home_team.team_name as home_team_name,
  home_team.abbreviation as home_team_abbr,
  away_team.id as away_team_id,
  away_team.team_name as away_team_name,
  away_team.abbreviation as away_team_abbr,
  CASE 
    WHEN g.game_date = CURRENT_DATE THEN 'Today'
    WHEN g.game_date = CURRENT_DATE + INTERVAL '1 day' THEN 'Tomorrow'
    WHEN g.game_date > CURRENT_DATE THEN 'Upcoming'
    WHEN g.game_date < CURRENT_DATE AND g.is_completed = false THEN 'Live'
    ELSE 'Completed'
  END as game_status
FROM public.games g
JOIN public.seasons s ON g.season_id = s.id
JOIN public.basketballteams home_team ON g.home_team_id = home_team.id
JOIN public.basketballteams away_team ON g.away_team_id = away_team.id
WHERE g.game_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY g.game_date DESC, g.id;

-- View 2: Player Performance Summary
CREATE OR REPLACE VIEW public.player_performance_view AS
SELECT 
  p.id as player_id,
  p.name as player_name,
  p.jersey_number,
  bt.id as team_id,
  bt.team_name,
  bt.abbreviation as team_abbr,
  s.name as season_name,
  COUNT(pgs.id) as games_played,
  AVG(pgs.points) as avg_points,
  AVG(pgs.total_rebounds) as avg_rebounds,
  AVG(pgs.assists) as avg_assists,
  AVG(pgs.minutes_played) as avg_minutes,
  AVG(pgs.field_goal_percentage) as avg_fg_percentage,
  AVG(pgs.three_point_percentage) as avg_3p_percentage,
  AVG(pgs.free_throw_percentage) as avg_ft_percentage,
  SUM(pgs.points) as total_points,
  SUM(pgs.total_rebounds) as total_rebounds,
  SUM(pgs.assists) as total_assists
FROM public.players p
JOIN public.basketballteams bt ON p.team_id = bt.id
LEFT JOIN public.player_game_stats pgs ON p.id = pgs.player_id
LEFT JOIN public.games g ON pgs.game_id = g.id
LEFT JOIN public.seasons s ON g.season_id = s.id
WHERE p.is_active = true
  AND (g.is_completed = true OR g.is_completed = false)
GROUP BY p.id, p.name, p.jersey_number, bt.id, bt.team_name, bt.abbreviation, s.name
HAVING COUNT(pgs.id) >= 1
ORDER BY avg_points DESC, games_played DESC;

-- View 3: Popular Picks Summary
CREATE OR REPLACE VIEW public.popular_picks_view AS
SELECT 
  pp.id as prop_id,
  p.name as player_name,
  bt.team_name,
  pp.prop_type,
  pp.over_line,
  pp.under_line,
  pp.over_odds,
  pp.under_odds,
  g.game_date,
  g.id as game_id,
  home_team.team_name as home_team,
  away_team.team_name as away_team,
  COALESCE(over_pop.pick_count, 0) as over_picks,
  COALESCE(under_pop.pick_count, 0) as under_picks,
  (COALESCE(over_pop.pick_count, 0) + COALESCE(under_pop.pick_count, 0)) as total_picks,
  CASE 
    WHEN over_pop.pick_count > under_pop.pick_count THEN 'Over'
    WHEN under_pop.pick_count > over_pop.pick_count THEN 'Under'
    ELSE 'Even'
  END as popular_side
FROM public.player_props pp
JOIN public.players p ON pp.player_id = p.id
JOIN public.basketballteams bt ON p.team_id = bt.id
JOIN public.games g ON pp.game_id = g.id
JOIN public.basketballteams home_team ON g.home_team_id = home_team.id
JOIN public.basketballteams away_team ON g.away_team_id = away_team.id
LEFT JOIN public.pick_popularity over_pop ON pp.id = over_pop.player_prop_id AND over_pop.pick_type = 'over'
LEFT JOIN public.pick_popularity under_pop ON pp.id = under_pop.player_prop_id AND under_pop.pick_type = 'under'
WHERE pp.is_active = true
  AND g.game_date >= CURRENT_DATE
ORDER BY total_picks DESC, g.game_date ASC;

-- View 4: Team Performance Summary
CREATE OR REPLACE VIEW public.team_performance_view AS
SELECT 
  bt.id as team_id,
  bt.team_name,
  bt.abbreviation,
  s.name as season_name,
  COUNT(DISTINCT g.id) as games_played,
  COUNT(DISTINCT CASE WHEN g.is_completed = true THEN g.id END) as completed_games,
  COUNT(DISTINCT CASE WHEN g.is_completed = false THEN g.id END) as upcoming_games,
  AVG(CASE WHEN g.is_completed = true THEN 
    CASE WHEN g.home_team_id = bt.id THEN 
      (SELECT AVG(pgs.points) FROM public.player_game_stats pgs WHERE pgs.game_id = g.id AND pgs.team_id = bt.id)
    ELSE 
      (SELECT AVG(pgs.points) FROM public.player_game_stats pgs WHERE pgs.game_id = g.id AND pgs.team_id = bt.id)
    END
  END) as avg_team_points,
  COUNT(DISTINCT p.id) as active_players
FROM public.basketballteams bt
LEFT JOIN public.games g ON (g.home_team_id = bt.id OR g.away_team_id = bt.id)
LEFT JOIN public.seasons s ON g.season_id = s.id
LEFT JOIN public.players p ON p.team_id = bt.id AND p.is_active = true
WHERE bt.is_active = true
GROUP BY bt.id, bt.team_name, bt.abbreviation, s.name
ORDER BY avg_team_points DESC NULLS LAST;

-- View 5: User Dashboard Summary
CREATE OR REPLACE VIEW public.user_dashboard_view AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT uft.team_id) as favorite_teams_count,
  COUNT(DISTINCT pp.id) as active_picks_count,
  COUNT(DISTINCT CASE WHEN pp.is_winner = true THEN pp.id END) as winning_picks_count,
  COUNT(DISTINCT CASE WHEN pp.is_winner = false THEN pp.id END) as losing_picks_count,
  CASE 
    WHEN COUNT(DISTINCT pp.id) > 0 THEN 
      ROUND((COUNT(DISTINCT CASE WHEN pp.is_winner = true THEN pp.id END)::decimal / COUNT(DISTINCT pp.id)::decimal) * 100, 1)
    ELSE 0
  END as win_percentage
FROM auth.users u
LEFT JOIN public.user_favorite_teams uft ON u.id = uft.user_id
LEFT JOIN public.parlay_picks pp ON u.id = pp.user_id
WHERE u.id IS NOT NULL
GROUP BY u.id, u.email;

-- Grant permissions to authenticated users
GRANT SELECT ON public.active_games_view TO authenticated;
GRANT SELECT ON public.player_performance_view TO authenticated;
GRANT SELECT ON public.popular_picks_view TO authenticated;
GRANT SELECT ON public.team_performance_view TO authenticated;
GRANT SELECT ON public.user_dashboard_view TO authenticated;

-- Create indexes for better view performance
CREATE INDEX IF NOT EXISTS idx_games_date_completed ON public.games(game_date, is_completed);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_game ON public.player_game_stats(player_id, game_id);
CREATE INDEX IF NOT EXISTS idx_player_props_game_active ON public.player_props(game_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pick_popularity_prop_type ON public.pick_popularity(player_prop_id, pick_type);
