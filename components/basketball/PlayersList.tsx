"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Search } from 'lucide-react';
import { PlayerWithTeam, BasketballTeam } from '@/types/basketball';
import { BasketballAPI } from '@/lib/basketball-api';
import PlayerCard from './PlayerCard';
import PlayerFilters from './PlayerFilters';
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
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  const loadPlayers = useCallback(async () => {
    try {
      setError(null);
      
      // Determine teamId if a specific team is selected
      const teamId = selectedTeamId !== 'all' ? parseInt(selectedTeamId, 10) : undefined;
      
      // Fetch players with pagination
      const result = await BasketballAPI.getPlayersPaginated(
        currentPage,
        playersPerPage,
        teamId,
        searchTerm,
        sortBy,
        sortOrder
      );
      
      setPlayers(result.players);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Failed to load players. Please try again.');
      console.error('Error loading players:', err);
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
      await loadPlayers();
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadPlayers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeamId, sortBy, sortOrder, searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load filtered data when filters change
  useEffect(() => {
    if (teams.length > 0) {
      loadPlayers();
    }
  }, [selectedTeamId, sortBy, sortOrder, teams, loadPlayers]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        loadPlayers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadPlayers]);


  const handleRefresh = () => {
    loadPlayers();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTeamId('all');
    setSortBy('name');
    setSortOrder('asc');
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedTeamId !== 'all') count++;
    if (sortBy !== 'name' || sortOrder !== 'asc') count++;
    return count;
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
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-300">
              {getFilteredPlayersCount()} {getFilteredPlayersCount() === 1 ? 'player' : 'players'} found
            </p>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <PlayerFilters
          searchTerm={searchTerm}
          selectedTeamId={selectedTeamId}
          sortBy={sortBy}
          sortOrder={sortOrder}
          teams={teams}
          onSearchChange={setSearchTerm}
          onTeamChange={setSelectedTeamId}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          isLoading={loading}
        />
      )}

      {/* Players Grid */}
      {players.length === 0 ? (
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
            {(searchTerm || selectedTeamId !== 'all') && (
              <Button onClick={handleClearFilters} variant="outline" className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300 transition-colors duration-200">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        maxVisiblePages={5}
      />
    </div>
  );
}
