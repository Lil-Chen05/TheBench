import { BasketballAPI } from './basketball-api';
import { GameWithTeams } from '@/types/basketball';

export interface GameStats {
  upcomingCount: number;
  recentCount: number;
  totalCount: number;
}

export interface PaginationState {
  offset: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
}

export class BasketballGamesService {
  private static gameCache = new Map<string, { data: GameWithTeams[], timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for stats

  /**
   * Load recent games (last 30 days) with intelligent caching
   * This covers both recent and upcoming games for efficient client-side filtering
   */
  static async getRecentGamesWithCache(seasonId?: number): Promise<GameWithTeams[]> {
    const cacheKey = `recent-games-${seasonId || 'all'}`;
    const cached = this.gameCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      console.log('Cache miss, fetching from database...');
      
      // Try the new date range method first
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const games = await BasketballAPI.getGamesInDateRange(
          thirtyDaysAgo.toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
          seasonId,
          100 // Reasonable limit for 30 days
        );
        
        console.log('Successfully fetched games with date range:', games.length);
        this.gameCache.set(cacheKey, { data: games, timestamp: Date.now() });
        return games;
      } catch (dateRangeError) {
        console.log('Date range method failed, falling back to getGames:', dateRangeError);
        
        // Fallback to existing working method
        const games = await BasketballAPI.getGames(seasonId, 100);
        console.log('Successfully fetched games with fallback method:', games.length);
        
        this.gameCache.set(cacheKey, { data: games, timestamp: Date.now() });
        return games;
      }
    } catch (error) {
      console.error('Error loading recent games:', error);
      // Return cached data if available, even if expired
      return cached?.data || [];
    }
  }

  /**
   * Client-side filtering for recent data - extremely fast tab switching
   */
  static filterGames(games: GameWithTeams[], type: 'upcoming' | 'recent' | 'all'): GameWithTeams[] {
    const now = new Date();
    
    switch (type) {
      case 'upcoming':
        return games.filter(game => new Date(game.game_date) > now);
      case 'recent':
        return games.filter(game => new Date(game.game_date) <= now);
      case 'all':
        return games;
      default:
        return games;
    }
  }

  /**
   * Calculate game statistics from cached data
   */
  static calculateGameStats(games: GameWithTeams[]): GameStats {
    const now = new Date();
    const upcoming = games.filter(game => new Date(game.game_date) > now);
    const recent = games.filter(game => new Date(game.game_date) <= now);

    return {
      upcomingCount: upcoming.length,
      recentCount: recent.length,
      totalCount: games.length
    };
  }

  /**
   * Load historical games with pagination for the 'all' tab
   * This is separate from the cached recent games
   */
  static async getHistoricalGames(
    offset: number,
    limit: number,
    seasonId?: number
  ): Promise<{ games: GameWithTeams[], hasMore: boolean }> {
    try {
      const games = await BasketballAPI.getGamesPaginated(offset, limit, seasonId);
      const hasMore = games.length === limit;
      
      return { games, hasMore };
    } catch (error) {
      console.error('Error loading historical games:', error);
      return { games: [], hasMore: false };
    }
  }

  /**
   * Clear cache when data becomes stale
   */
  static clearCache(): void {
    this.gameCache.clear();
  }

  /**
   * Get cache status for debugging
   */
  static getCacheStatus(): { size: number, keys: string[] } {
    return {
      size: this.gameCache.size,
      keys: Array.from(this.gameCache.keys())
    };
  }

  /**
   * Preload data for better perceived performance
   */
  static async preloadGames(seasonId?: number): Promise<void> {
    // Preload in background without blocking UI
    this.getRecentGamesWithCache(seasonId).catch(console.error);
  }

  /**
   * Debug method to test API connectivity
   */
  static async testAPIConnectivity(): Promise<{ success: boolean; method: string; count: number; error?: string }> {
    try {
      // Test the basic getGames method
      const games = await BasketballAPI.getGames(undefined, 5);
      return { success: true, method: 'getGames', count: games.length };
    } catch (error) {
      return { success: false, method: 'getGames', count: 0, error: String(error) };
    }
  }
}
