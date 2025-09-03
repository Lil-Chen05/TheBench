"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw, X } from 'lucide-react';
import { BasketballTeam } from '@/types/basketball';

interface PlayerFiltersProps {
  searchTerm: string;
  selectedTeamId: string;
  sortBy: string;
  sortOrder: string;
  teams: BasketballTeam[];
  onSearchChange: (value: string) => void;
  onTeamChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
  searchTerm,
  selectedTeamId,
  sortBy,
  sortOrder,
  teams,
  onSearchChange,
  onTeamChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
  onRefresh,
  isLoading = false
}) => {
  const hasActiveFilters = searchTerm || selectedTeamId !== 'all' || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <Card className="bg-white dark:bg-gray-900 border-yellow-400/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearFilters}
                className="border-red-400 text-red-600 dark:text-red-400 hover:bg-red-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Players
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Team Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Team
            </label>
            <Select value={selectedTeamId} onValueChange={onTeamChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={onSortByChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Player Name</SelectItem>
                <SelectItem value="jersey_number">Jersey Number</SelectItem>
                <SelectItem value="team_name">Team Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort Order
            </label>
            <Select value={sortOrder} onValueChange={onSortOrderChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Order..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A to Z</SelectItem>
                <SelectItem value="desc">Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active filters:
              </span>
              
              {searchTerm && (
                <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  Search: "{searchTerm}"
                </Badge>
              )}
              
              {selectedTeamId !== 'all' && (
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Team: {teams.find(t => t.id.toString() === selectedTeamId)?.team_name || 'Unknown'}
                </Badge>
              )}
              
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Sort: {sortBy === 'name' ? 'Name' : sortBy === 'jersey_number' ? 'Jersey' : 'Team'} 
                ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerFilters;
