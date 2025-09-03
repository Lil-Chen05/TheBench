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

interface PlayersListProps {
  title?: string;
  showFilters?: boolean;
  maxPlayers?: number;
  onPlayerClick?: (player: PlayerWithTeam) => void;
}

export default function PlayersList({ 
  title = "Basketball Players", 
  showFilters = true, 
  maxPlayers = 50,
  onPlayerClick
}: PlayersListProps) {
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  const loadPlayers = useCallback(async () => {
    try {
      setError(null);
      
      let playersData: PlayerWithTeam[] = [];
      
      if (searchTerm.length >= 2) {
        // Search by name
        playersData = await BasketballAPI.searchPlayersByName(searchTerm);
      } else if (selectedTeamId !== 'all') {
        // Filter by team
        const teamId = parseInt(selectedTeamId, 10);
        playersData = await BasketballAPI.getPlayersByTeamId(teamId);
      } else {
        // Get all players
        playersData = await BasketballAPI.getAllPlayersWithTeams();
      }
      
      // Apply sorting
      playersData = sortPlayers(playersData, sortBy, sortOrder);
      
      // Limit results
      playersData = playersData.slice(0, maxPlayers);
      
      setPlayers(playersData);
    } catch (err) {
      setError('Failed to load players. Please try again.');
      console.error('Error loading players:', err);
    }
  }, [searchTerm, selectedTeamId, sortBy, sortOrder, maxPlayers]);

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

  const sortPlayers = (playersList: PlayerWithTeam[], sortField: string, order: string): PlayerWithTeam[] => {
    return [...playersList].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'jersey_number':
          aValue = a.jersey_number || 0;
          bValue = b.jersey_number || 0;
          break;
        case 'team_name':
          aValue = a.basketballteams.team_name;
          bValue = b.basketballteams.team_name;
          break;
        default: // name
          aValue = a.name;
          bValue = b.name;
      }
      
      if (order === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  };

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
    return players.length;
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
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">Loading players...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600 dark:text-gray-400">
              {getFilteredPlayersCount()} {getFilteredPlayersCount() === 1 ? 'player' : 'players'} found
            </p>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
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
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No players found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedTeamId !== 'all' 
                ? 'Try adjusting your search terms or filters.' 
                : 'No players are currently available.'}
            </p>
            {(searchTerm || selectedTeamId !== 'all') && (
              <Button onClick={handleClearFilters} variant="outline">
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

      {/* Load More Button */}
      {players.length >= maxPlayers && (
        <div className="text-center">
          <Button variant="outline" onClick={handleRefresh}>
            Load More Players
          </Button>
        </div>
      )}
    </div>
  );
}
