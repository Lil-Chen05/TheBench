"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Search, X, SortAsc, SortDesc } from 'lucide-react';
import { PlayerWithTeam, BasketballTeam } from '@/types/basketball';
import { BasketballAPI } from '@/lib/basketball-api';
import PlayerCard from './PlayerCard';
import Pagination from '@/components/ui/pagination';

interface PlayersListProps {
  title?: string;
  showFilters?: boolean;
  playersPerPage?: number;
  onPlayerClick?: (player: PlayerWithTeam) => void;
}

export default function PlayersList({ 
  title = "Basketball Players", 
  showFilters = true, 
  playersPerPage = 20,
  onPlayerClick
}: PlayersListProps) {
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortLoading, setSortLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [sortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  const loadPlayers = useCallback(async (loadingType: 'initial' | 'search' | 'sort' | 'none' = 'none') => {
    try {
      setError(null);
      
      // Set appropriate loading state
      if (loadingType === 'search') {
        setSearchLoading(true);
      } else if (loadingType === 'sort') {
        setSortLoading(true);
      }
      
      // Determine teamId if a specific team is selected
      const teamId = selectedTeamId !== 'all' ? parseInt(selectedTeamId, 10) : undefined;
      
      // Fetch players with pagination
      const result = await BasketballAPI.getPlayersPaginated(
        currentPage,
        playersPerPage,
        teamId,
        searchTerm, // Use confirmed search term, not input
        sortBy,
        sortOrder
      );
      
      setPlayers(result.players);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Failed to load players. Please try again.');
      console.error('Error loading players:', err);
    } finally {
      if (loadingType === 'search') {
        setSearchLoading(false);
      } else if (loadingType === 'sort') {
        setSortLoading(false);
      }
    }
  }, [currentPage, playersPerPage, selectedTeamId, searchTerm, sortBy, sortOrder]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load teams for filter dropdown
      const teamsData = await BasketballAPI.getAllBasketballTeams();
      setTeams(teamsData);
      
      // Load initial players
      await loadPlayers('initial');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadPlayers]);

  // Handle search button click
  const handleSearch = () => {
    setSearchTerm(searchInput); // Confirm the search term
    setCurrentPage(1); // Reset to first page
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle team filter change
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setCurrentPage(1);
  };

  // Handle sort change (only name now)
  const handleSortChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load filtered data when search term changes
  useEffect(() => {
    if (teams.length > 0 && searchTerm !== searchInput) {
      loadPlayers('search');
    }
  }, [searchTerm, teams, loadPlayers]);

  // Load filtered data when team filter changes
  useEffect(() => {
    if (teams.length > 0) {
      loadPlayers('search');
    }
  }, [selectedTeamId, currentPage, teams, loadPlayers]);

  // Load sorted data when sort changes
  useEffect(() => {
    if (teams.length > 0) {
      loadPlayers('sort');
    }
  }, [sortBy, sortOrder, teams, loadPlayers]);

  const handleRefresh = () => {
    loadPlayers('search');
  };

  const handlePlayerClick = (player: PlayerWithTeam) => {
    if (onPlayerClick) {
      onPlayerClick(player);
    } else {
      // Default behavior - could navigate to player details page
      console.log('Player clicked:', player);
    }
  };

  const getFilteredPlayersCount = () => {
    return totalCount;
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  if (loading && players.length === 0) {
    return (
      <Card className="bg-black border-yellow-400/30 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="text-gray-300">Loading players...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black border-yellow-400/30 border-red-200 dark:border-red-800 shadow-lg">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-colors duration-200">
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
          <p className="text-gray-300 mt-2">
            {getFilteredPlayersCount()} {getFilteredPlayersCount() === 1 ? 'player' : 'players'} found
          </p>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      {showFilters && (
        <Card className="bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 border-2 border-yellow-400/50 shadow-2xl backdrop-blur-lg">
          <CardContent className="p-8">
            {/* Main Search Row */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative group">
                {/* Enhanced glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 via-yellow-300/30 to-yellow-400/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
                
                {/* Search icon inside input */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="w-5 h-5 text-yellow-400/60 group-hover:text-yellow-400 transition-colors duration-300" />
                </div>
                
                <input
                  type="text"
                  placeholder="Search basketball players..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="relative w-full h-16 pl-14 pr-14 bg-gradient-to-r from-black/70 via-gray-900/70 to-black/70 border-2 border-yellow-400/40 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 font-medium text-lg shadow-2xl backdrop-blur-sm hover:bg-gradient-to-r hover:from-black/50 hover:via-gray-900/50 hover:to-black/50 group-hover:border-yellow-400/60"
                />
                
                {/* Enhanced clear button */}
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 p-2 hover:bg-gray-700/50 rounded-full z-10 group"
                  >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                )}
                
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              
              {/* Search Button - matching height */}
              <Button
                onClick={handleSearch}
                disabled={searchLoading}
                className="h-16 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:from-yellow-300 hover:to-yellow-200 font-bold px-8 text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-yellow-400/40 disabled:opacity-50 rounded-xl border-2 border-yellow-400/60 hover:border-yellow-300 relative overflow-hidden group"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-yellow-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center gap-2">
                  {searchLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {searchLoading ? "Searching..." : "Search"}
                </div>
              </Button>
              
              {/* Clear Button - matching height */}
              {(searchTerm || searchInput) && (
                <Button
                  onClick={handleClearSearch}
                  variant="outline"
                  className="h-16 border-2 border-gray-500/60 text-gray-300 hover:bg-gray-500/20 hover:text-white hover:border-gray-400 transition-all duration-300 px-6 text-lg rounded-xl hover:scale-105 backdrop-blur-sm"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Compact Filters Row */}
            <div className="flex items-center gap-8">
              {/* Compact Team Filter */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-yellow-400 whitespace-nowrap tracking-wide">Team:</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => handleTeamChange(e.target.value)}
                  className="px-4 py-2.5 bg-black/60 border-2 border-yellow-400/40 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 min-w-[160px] hover:bg-black/40"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id.toString()}>{team.team_name}</option>
                  ))}
                </select>
              </div>

              {/* Compact Sort by Name */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-yellow-400 whitespace-nowrap tracking-wide">Sort:</label>
                <Button
                  onClick={handleSortChange}
                  variant="outline"
                  size="sm"
                  disabled={sortLoading}
                  className="border-2 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-200 flex items-center gap-2 px-4 py-2.5"
                >
                  {sortLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    getSortIcon()
                  )}
                  Name {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players Grid */}
      {searchLoading ? (
        <Card className="bg-black border-yellow-400/30 shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
              <span className="text-gray-300">Searching players...</span>
            </div>
          </CardContent>
        </Card>
      ) : players.length === 0 ? (
        <Card className="bg-black border-yellow-400/30 shadow-lg">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No players found
            </h3>
            <p className="text-gray-300 mb-4">
              {searchTerm || selectedTeamId !== 'all' 
                ? 'Try adjusting your search terms or filters.' 
                : 'No players are currently available.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-200 ${sortLoading ? 'opacity-50' : 'opacity-100'}`}>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onViewDetails={handlePlayerClick}
              showDetails={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          maxVisiblePages={5}
        />
      )}
    </div>
  );
}