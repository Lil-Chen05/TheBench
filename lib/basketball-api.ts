import { createClient } from '@/lib/supabase/client';
import {
  BasketballTeam,
  Season,
  PlayerProp,
  GameWithTeams,
  PlayerWithTeam,
  PlayerStatsWithGame,
  PopularPick,
  PlayerLastNGames,
  PlayerSeasonAverages,
  TopPerformer,
  FavoriteTeamGame
} from '@/types/basketball';

export class BasketballAPI {
  private static getClient() {
    return createClient();
  }
  // Get all basketball teams
  static async getTeams(): Promise<BasketballTeam[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('basketballteams')
        .select('*')
        .eq('is_active', true)
        .order('team_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  // Get all seasons
  static async getSeasons(): Promise<Season[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('seasons')
        .select('*')
        .eq('sport_id', 1) // Basketball sport ID
        .order('name', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      return [];
    }
  }

  // Get games with team information
  static async getGames(seasonId?: number, limit: number = 50): Promise<GameWithTeams[]> {
    try {
      let query = BasketballAPI.getClient()
        .from('games')
        .select(`
            *,
            home_team:games_home_team_id_fkey(*),
            away_team:games_away_team_id_fkey(*),
            season:games_season_id_fkey(*)
          `)
          
        .order('game_date', { ascending: false })
        .limit(limit);
  
      if (seasonId) {
        query = query.eq('season_id', seasonId);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  // NEW: Get games in date range for efficient caching
  static async getGamesInDateRange(
    startDate: string,
    endDate: string,
    seasonId?: number,
    limit: number = 100
  ): Promise<GameWithTeams[]> {
    try {
      let query = BasketballAPI.getClient()
        .from('games')
        .select(`
          *,
          home_team:games_home_team_id_fkey(*),
          away_team:games_away_team_id_fkey(*),
          season:games_season_id_fkey(*)
        `)
        .gte('game_date', startDate)
        .lte('game_date', endDate)
        .order('game_date', { ascending: false })
        .limit(limit);

      if (seasonId) {
        query = query.eq('season_id', seasonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching games in date range:', error);
      return [];
    }
  }

  // NEW: Get games with pagination for historical data
  static async getGamesPaginated(
    offset: number,
    limit: number,
    seasonId?: number
  ): Promise<GameWithTeams[]> {
    try {
      let query = BasketballAPI.getClient()
        .from('games')
        .select(`
          *,
          home_team:games_home_team_id_fkey(*),
          away_team:games_away_team_id_fkey(*),
          season:games_season_id_fkey(*)
        `)
        .order('game_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (seasonId) {
        query = query.eq('season_id', seasonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching paginated games:', error);
      return [];
    }
  }
  

  // Get upcoming games
  static async getUpcomingGames(daysAhead: number = 7): Promise<GameWithTeams[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
  
      const { data, error } = await BasketballAPI.getClient()
        .from('games')
        .select(`
            *,
            home_team:games_home_team_id_fkey(*),
            away_team:games_away_team_id_fkey(*),
            season:games_season_id_fkey(*)
          `)
        .gte('game_date', today)
        .lte('game_date', futureDate)
        .eq('is_completed', false)
        .order('game_date', { ascending: true });
  
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      return [];
    }
  }
  
  

  // Get players by team
  static async getPlayersByTeam(teamId: number): Promise<PlayerWithTeam[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('players')
        .select(`
          *,
          team:basketballteams(*)
        `)
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching players by team:', error);
      return [];
    }
  }

  // Get player stats for a specific game
  static async getPlayerGameStats(gameId: number): Promise<PlayerStatsWithGame[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('player_game_stats')
        .select(`
          *,
          game:games(*),
          player:players(*)
        `)
        .eq('game_id', gameId)
        .order('points', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching player game stats:', error);
      return [];
    }
  }

  // Get player props for a game
  static async getPlayerProps(gameId: number): Promise<PlayerProp[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('player_props')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching player props:', error);
      return [];
    }
  }

  // Get popular picks for a game using database function
  static async getPopularPicksForGame(gameId: number, limit: number = 10): Promise<PopularPick[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .rpc('get_popular_picks_for_game', {
          p_game_id: gameId,
          p_limit: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular picks:', error);
      return [];
    }
  }

  // Get player's last N games stats using database function
  static async getPlayerLastNGames(
    playerId: number,
    statType: 'points' | 'rebounds' | 'assists' | 'minutes',
    gamesCount: number = 5
  ): Promise<PlayerLastNGames[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .rpc('get_player_last_n_games', {
          p_player_id: playerId,
          p_stat_type: statType,
          p_games_count: gamesCount
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching player last N games:', error);
      return [];
    }
  }

  // Get player season averages using database function
  static async getPlayerSeasonAverages(
    playerId: number,
    seasonName?: string
  ): Promise<PlayerSeasonAverages[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .rpc('get_player_season_averages', {
          p_player_id: playerId,
          p_season_name: seasonName
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching player season averages:', error);
      return [];
    }
  }

  // Get top performers by stat category using database function
  static async getTopPerformers(
    statType: 'points' | 'rebounds' | 'assists' | 'minutes',
    seasonName?: string,
    limit: number = 10
  ): Promise<TopPerformer[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .rpc('get_top_performers', {
          p_stat_type: statType,
          p_season_name: seasonName,
          p_limit: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching top performers:', error);
      return [];
    }
  }

  // Get favorite team games for a user using database function
  static async getFavoriteTeamGames(
    userId: string,
    daysAhead: number = 7
  ): Promise<FavoriteTeamGame[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .rpc('get_favorite_team_games', {
          p_user_id: userId,
          p_days_ahead: daysAhead
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching favorite team games:', error);
      return [];
    }
  }

  // Get user's favorite teams (reads from profiles.favorite_teams JSONB)
  static async getUserFavoriteTeams(userId: string): Promise<BasketballTeam[]> {
    try {
      // Get team IDs from the user's profile
      const { data: profile, error: profileError } = await BasketballAPI.getClient()
        .from('profiles')
        .select('favorite_teams')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.favorite_teams?.length) return [];

      // Fetch the actual team records for those IDs
      const teamIds = profile.favorite_teams.map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id));
      if (teamIds.length === 0) return [];

      const { data, error } = await BasketballAPI.getClient()
        .from('basketballteams')
        .select('*')
        .in('id', teamIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user favorite teams:', error);
      return [];
    }
  }

  // NEW: Get games using optimized view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getGamesFromView(seasonId?: number, limit: number = 50): Promise<any[]> {
    try {
      let query = BasketballAPI.getClient()
        .from('active_games_view')
        .select('*')
        .order('game_date', { ascending: false })
        .limit(limit);

      if (seasonId) {
        query = query.eq('season_id', seasonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching games from view:', error);
      return [];
    }
  }

  // NEW: Get player performance using optimized view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getPlayerPerformanceFromView(seasonName?: string, limit: number = 20): Promise<any[]> {
    try {
      let query = BasketballAPI.getClient()
        .from('player_performance_view')
        .select('*')
        .order('avg_points', { ascending: false })
        .limit(limit);

      if (seasonName) {
        query = query.eq('season_name', seasonName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching player performance from view:', error);
      return [];
    }
  }

  // NEW: Get popular picks using optimized view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getPopularPicksFromView(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('popular_picks_view')
        .select('*')
        .order('total_picks', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular picks from view:', error);
      return [];
    }
  }

  // NEW: Get team performance using optimized view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getTeamPerformanceFromView(seasonName?: string): Promise<any[]> {
    try {
      let query = BasketballAPI.getClient()
        .from('team_performance_view')
        .select('*')
        .order('avg_team_points', { ascending: false });

      if (seasonName) {
        query = query.eq('season_name', seasonName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team performance from view:', error);
      return [];
    }
  }

  // NEW: Get user dashboard summary using optimized view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getUserDashboardSummary(userId: string): Promise<any> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('user_dashboard_view')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user dashboard summary:', error);
      return null;
    }
  }

  // Add a team to user's favorites
  static async addFavoriteTeam(userId: string, teamId: number): Promise<boolean> {
    try {
      const { error } = await BasketballAPI.getClient()
        .from('user_favorite_teams')
        .insert({
          user_id: userId,
          team_id: teamId,
          sport_id: 1
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding favorite team:', error);
      return false;
    }
  }

  // Remove a team from user's favorites
  static async removeFavoriteTeam(userId: string, teamId: number): Promise<boolean> {
    try {
      const { error } = await BasketballAPI.getClient()
        .from('user_favorite_teams')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing favorite team:', error);
      return false;
    }
  }

  // Search players by name
  static async searchPlayers(searchTerm: string, limit: number = 20): Promise<PlayerWithTeam[]> {
    try {
      const { data, error } = await BasketballAPI.getClient()
        .from('players')
        .select(`
          *,
          team:basketballteams(*)
        `)
        .ilike('name', `%${searchTerm}%`)
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }
}
