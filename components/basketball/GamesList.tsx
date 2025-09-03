"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, RefreshCw } from 'lucide-react';
import { GameWithTeams, Season } from '@/types/basketball';
import { BasketballAPI } from '@/lib/basketball-api';
import GameCard from './GameCard';

interface GamesListProps {
  title?: string;
  showFilters?: boolean;
  maxGames?: number;
  gameType?: 'upcoming' | 'recent' | 'all';
}

export default function GamesList({ 
  title = "Basketball Games", 
  showFilters = true, 
  maxGames = 20,
  gameType = 'upcoming'
}: GamesListProps) {
  const [games, setGames] = useState<GameWithTeams[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    loadGames();
    loadSeasons();
  }, [loadGames, selectedSeason, filterCompleted, gameType]);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      let gamesData: GameWithTeams[] = [];
  
      // Determine seasonId if a specific season is selected
      const seasonId =
        selectedSeason !== 'all'
          ? parseInt(selectedSeason, 10)
          : undefined;
  
      // Fetch games
      gamesData = await BasketballAPI.getGames(seasonId);
  
      console.log('Raw games data:', gamesData);
  
      // Apply completed filter safely
      if (filterCompleted !== null) {
        gamesData = gamesData.filter(
          (game) =>
            typeof game.is_completed === 'boolean' &&
            game.is_completed === filterCompleted
        );
        console.log('After completed filter:', gamesData.length);
      }
  
      // Apply search filter safely
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        gamesData = gamesData.filter((game) => {
          const homeName = game.home_team?.team_name?.toLowerCase() || '';
          const awayName = game.away_team?.team_name?.toLowerCase() || '';
          const seasonName = game.season?.name?.toLowerCase() || '';
          return (
            homeName.includes(term) ||
            awayName.includes(term) ||
            seasonName.includes(term)
          );
        });
        console.log('After search filter:', gamesData.length);
      }
  
      // Limit results
      gamesData = gamesData.slice(0, maxGames);
  
      setGames(gamesData);
    } catch (err) {
      setError('Failed to load games. Please try again.');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, filterCompleted, searchTerm, maxGames]);
  
  

  const loadSeasons = async () => {
    try {
      const seasonsData = await BasketballAPI.getSeasons();
      setSeasons(seasonsData);
    } catch (err) {
      console.error('Error loading seasons:', err);
    }
  };

  const handleRefresh = () => {
    loadGames();
  };

  const handleViewProps = (gameId: number) => {
    // This will be handled by the parent component or navigation
    console.log('View props for game:', gameId);
  };

  const getFilteredGamesCount = () => {
    return games.length;
  };

  if (loading && games.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">Loading games...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {getFilteredGamesCount()} {getFilteredGamesCount() === 1 ? 'game' : 'games'} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Teams
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Season Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Season
                </label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Game Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Game Status
                </label>
                <Select 
                  value={filterCompleted === null ? 'all' : filterCompleted.toString()} 
                  onValueChange={(value) => {
                    if (value === 'all') setFilterCompleted(null);
                    else setFilterCompleted(value === 'true');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Games" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="false">Upcoming</SelectItem>
                    <SelectItem value="true">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games Grid */}
      {games.length === 0 ? (
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No games found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onViewProps={handleViewProps}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {games.length >= maxGames && (
        <div className="text-center">
          <Button variant="outline" onClick={handleRefresh}>
            Load More Games
          </Button>
        </div>
      )}
    </div>
  );
}
