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
import Pagination from '@/components/ui/pagination';

interface GamesListProps {
  title?: string;
  showFilters?: boolean;
  gamesPerPage?: number;
}

export default function GamesList({ 
  title = "Basketball Games", 
  showFilters = true, 
  gamesPerPage = 20
}: GamesListProps) {
  const [games, setGames] = useState<GameWithTeams[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Determine seasonId if a specific season is selected
      const seasonId =
        selectedSeason !== 'all'
          ? parseInt(selectedSeason, 10)
          : undefined;
  
      // Fetch games with pagination
      const result = await BasketballAPI.getGamesPaginated(
        currentPage,
        gamesPerPage,
        seasonId,
        searchTerm,
        filterCompleted
      );
  
      setGames(result.games);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Failed to load games. Please try again.');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, gamesPerPage, selectedSeason, filterCompleted, searchTerm]);

  const loadSeasons = useCallback(async () => {
    try {
      const seasonsData = await BasketballAPI.getSeasons();
      setSeasons(seasonsData);
    } catch (err) {
      console.error('Error loading seasons:', err);
    }
  }, []);

  useEffect(() => {
    loadGames();
    loadSeasons();
  }, [loadGames, loadSeasons]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeason, filterCompleted, searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadGames();
  };


  const getFilteredGamesCount = () => {
    return totalCount;
  };

  if (loading && games.length === 0) {
    return (
      <Card className="bg-black border-yellow-400/30 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="text-gray-300">Loading games...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black border-yellow-400/30 border-red-200 dark:border-red-800 shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="border-red-400 text-red-600 dark:text-red-400 hover:bg-red-400 hover:text-white transition-colors duration-200">
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
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-300">
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
        <Card className="bg-black border-yellow-400/30 border-yellow-400/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Search Teams
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Season Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Season
                </label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="text-white bg-background border-border">
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                    <SelectItem value="all" className="text-white hover:bg-gray-800 focus:bg-gray-800">All Seasons</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id.toString()} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Game Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Game Status
                </label>
                <Select 
                  value={filterCompleted === null ? 'all' : filterCompleted.toString()} 
                  onValueChange={(value) => {
                    if (value === 'all') setFilterCompleted(null);
                    else setFilterCompleted(value === 'true');
                  }}
                >
                  <SelectTrigger className="text-white bg-background border-border">
                    <SelectValue placeholder="All Games" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                    <SelectItem value="all" className="text-white hover:bg-gray-800 focus:bg-gray-800">All Games</SelectItem>
                    <SelectItem value="false" className="text-white hover:bg-gray-800 focus:bg-gray-800">Upcoming</SelectItem>
                    <SelectItem value="true" className="text-white hover:bg-gray-800 focus:bg-gray-800">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games Grid */}
      {games.length === 0 ? (
        <Card className="bg-black border-yellow-400/30 shadow-lg">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No games found
            </h3>
            <p className="text-gray-300 mb-4">
              Try adjusting your filters or search terms.
            </p>
            <Button onClick={handleRefresh} variant="outline" className="border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors duration-200">
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
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        maxVisiblePages={5}
      />
    </div>
  );
}
