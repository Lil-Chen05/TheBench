"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BasketballAPI } from '@/lib/basketball-api';
import { BasketballTeam } from '@/types/basketball';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import TeamCard from './TeamCard';
import TeamFilters from './TeamFilters';
import { updateFavoriteTeams } from '@/lib/database/profiles-client';
import { createClient } from '@/lib/supabase/client';

interface TeamsListProps {
  userId: string;
  teamsPerPage?: number;
}

export default function TeamsList({ userId, teamsPerPage = 20 }: TeamsListProps) {
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<BasketballTeam[]>([]);
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedConference, setSelectedConference] = useState('all');
  const [sortBy, setSortBy] = useState('team_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  // Load teams data
  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const teamsData = await BasketballAPI.getAllBasketballTeams();
      setTeams(teamsData);

      // Load user's favorite teams
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_teams')
        .eq('id', userId)
        .single();

      if (profile?.favorite_teams) {
        setFavoriteTeamIds(profile.favorite_teams);
      }

    } catch (err) {
      console.error('Error loading teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  // Apply filters and sorting
  const applyFilters = useCallback(() => {
    let filtered = [...teams];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(team =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.abbr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Province filter
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(team => team.province === selectedProvince);
    }

    // Conference filter
    if (selectedConference !== 'all') {
      filtered = filtered.filter(team => team.conference === selectedConference);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case 'city':
          aValue = a.city;
          bValue = b.city;
          break;
        case 'province':
          aValue = a.province;
          bValue = b.province;
          break;
        default:
          aValue = a.team_name;
          bValue = b.team_name;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredTeams(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / teamsPerPage));
    setCurrentPage(1);
  }, [teams, searchTerm, selectedProvince, selectedConference, sortBy, sortOrder, teamsPerPage]);

  // Handle favorite toggle
  const handleToggleFavorite = async (teamId: number) => {
    try {
      setUpdating(true);
      setError(null);

      const teamIdStr = teamId.toString();
      const isCurrentlyFavorite = favoriteTeamIds.includes(teamIdStr);
      
      let newFavoriteIds: string[];
      if (isCurrentlyFavorite) {
        newFavoriteIds = favoriteTeamIds.filter(id => id !== teamIdStr);
      } else {
        if (favoriteTeamIds.length >= 5) {
          setError('Maximum of 5 favorite teams allowed');
          return;
        }
        newFavoriteIds = [...favoriteTeamIds, teamIdStr];
      }

      const success = await updateFavoriteTeams(userId, newFavoriteIds);
      
      if (success) {
        setFavoriteTeamIds(newFavoriteIds);
      } else {
        throw new Error('Failed to update favorite teams');
      }

    } catch (err) {
      console.error('Error updating favorite teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorites');
    } finally {
      setUpdating(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvince('all');
    setSelectedConference('all');
    setSortBy('team_name');
    setSortOrder('asc');
  };

  // Get unique provinces and conferences
  const provinces = Array.from(new Set(teams.map(team => team.province))).sort();
  const conferences = Array.from(new Set(teams.map(team => team.conference).filter(Boolean) as string[])).sort();

  // Load data on mount
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (teams.length > 0) {
      applyFilters();
    }
  }, [applyFilters]);

  // Get paginated teams
  const getPaginatedTeams = () => {
    const startIndex = (currentPage - 1) * teamsPerPage;
    const endIndex = startIndex + teamsPerPage;
    return filteredTeams.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-black border-yellow-400/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <span className="ml-3 text-white">Loading teams...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={loadTeams}
              className="mt-4 border-red-500/30 text-red-400 hover:bg-red-900/20"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paginatedTeams = getPaginatedTeams();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TeamFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedProvince={selectedProvince}
        onProvinceChange={setSelectedProvince}
        selectedConference={selectedConference}
        onConferenceChange={setSelectedConference}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        provinces={provinces}
        conferences={conferences}
        isLoading={loading}
        onClearFilters={clearFilters}
      />

      {/* Results Summary */}
      <Card className="bg-black border-yellow-400/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">
                {totalCount} team{totalCount !== 1 ? 's' : ''} found
              </span>
            </div>
            {updating && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {paginatedTeams.length === 0 ? (
        <Card className="bg-black border-yellow-400/30">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No teams found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your filters to see more results
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isFavorite={favoriteTeamIds.includes(team.id.toString())}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-black border-yellow-400/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={
                    currentPage === page
                      ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
