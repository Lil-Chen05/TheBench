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
    <Card className="bg-black border-yellow-400/30 border-yellow-400/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
                          <Button 
              variant="outline" 
              size="sm"
              onClick={onClearFilters}
              className="border-red-400/30 text-red-400 hover:bg-red-400/20 hover:text-red-300 transition-colors duration-200"
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
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300 transition-colors duration-200"
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
            <label className="text-sm font-medium text-white">
              Search Players
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background border-border text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Team Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Filter by Team
            </label>
            <Select value={selectedTeamId} onValueChange={onTeamChange} disabled={isLoading}>
              <SelectTrigger className="text-white bg-background border-border">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-800 focus:bg-gray-800">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                    {team.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={onSortByChange} disabled={isLoading}>
              <SelectTrigger className="text-white bg-background border-border">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                <SelectItem value="name" className="text-white hover:bg-gray-800 focus:bg-gray-800">Player Name</SelectItem>
                <SelectItem value="jersey_number" className="text-white hover:bg-gray-800 focus:bg-gray-800">Jersey Number</SelectItem>
                <SelectItem value="team_name" className="text-white hover:bg-gray-800 focus:bg-gray-800">Team Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Sort Order
            </label>
            <Select value={sortOrder} onValueChange={onSortOrderChange} disabled={isLoading}>
              <SelectTrigger className="text-white bg-background border-border">
                <SelectValue placeholder="Order..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                <SelectItem value="asc" className="text-white hover:bg-gray-800 focus:bg-gray-800">A to Z</SelectItem>
                <SelectItem value="desc" className="text-white hover:bg-gray-800 focus:bg-gray-800">Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-300">
                Active filters:
              </span>
              
              {searchTerm && (
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                  Search: &quot;{searchTerm}&quot;
                </Badge>
              )}
              
              {selectedTeamId !== 'all' && (
                <Badge variant="secondary" className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                  Team: {teams.find(t => t.id.toString() === selectedTeamId)?.team_name || 'Unknown'}
                </Badge>
              )}
              
              <Badge variant="secondary" className="bg-green-400/20 text-green-400 border-green-400/30">
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
