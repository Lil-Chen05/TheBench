"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BasketballAPI } from '@/lib/basketball-api';
import { updateFavoriteTeams } from '@/lib/database/profiles-client';
import { BasketballTeam } from '@/types/basketball';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Plus, X, Loader2, Heart } from 'lucide-react';

interface FavoritesTabProps {
  userId: string;
}

export default function FavoritesTab({ userId }: FavoritesTabProps) {
  const [favoriteTeams, setFavoriteTeams] = useState<BasketballTeam[]>([]);
  const [allTeams, setAllTeams] = useState<BasketballTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  
  const supabase = createClient();

  // Load user's favorite teams and all available teams
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile to fetch favorite teams
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('favorite_teams')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error('Failed to load user profile');
      }

      const favoriteTeamIds = profile.favorite_teams || [];
      
      // Get all basketball teams
      const teams = await BasketballAPI.getAllBasketballTeams();
      setAllTeams(teams);

      // Get favorite teams details
      if (favoriteTeamIds.length > 0) {
        const favoriteTeamsData = teams.filter(team => 
          favoriteTeamIds.includes(team.id.toString())
        );
        setFavoriteTeams(favoriteTeamsData);
      } else {
        setFavoriteTeams([]);
      }

    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add a team to favorites
  const addFavoriteTeam = async (teamId: string) => {
    if (!teamId || favoriteTeams.length >= 5) return;

    try {
      setUpdating(true);
      setError(null);

      const currentFavoriteIds = favoriteTeams.map(team => team.id.toString());
      const newFavoriteIds = [...currentFavoriteIds, teamId];

      const success = await updateFavoriteTeams(userId, newFavoriteIds);
      
      if (success) {
        // Optimistic update
        const newTeam = allTeams.find(team => team.id.toString() === teamId);
        if (newTeam) {
          setFavoriteTeams(prev => [...prev, newTeam]);
        }
        setSelectedTeamId('');
      } else {
        throw new Error('Failed to add team to favorites');
      }

    } catch (err) {
      console.error('Error adding favorite team:', err);
      setError(err instanceof Error ? err.message : 'Failed to add team');
    } finally {
      setUpdating(false);
    }
  };

  // Remove a team from favorites
  const removeFavoriteTeam = async (teamId: number) => {
    try {
      setUpdating(true);
      setError(null);

      const newFavoriteIds = favoriteTeams
        .filter(team => team.id !== teamId)
        .map(team => team.id.toString());

      const success = await updateFavoriteTeams(userId, newFavoriteIds);
      
      if (success) {
        // Optimistic update
        setFavoriteTeams(prev => prev.filter(team => team.id !== teamId));
      } else {
        throw new Error('Failed to remove team from favorites');
      }

    } catch (err) {
      console.error('Error removing favorite team:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove team');
    } finally {
      setUpdating(false);
    }
  };

  // Get available teams (not already in favorites)
  const getAvailableTeams = () => {
    const favoriteTeamIds = favoriteTeams.map(team => team.id.toString());
    return allTeams.filter(team => !favoriteTeamIds.includes(team.id.toString()));
  };

  const availableTeams = getAvailableTeams();
  const canAddMore = favoriteTeams.length < 5;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-black border-yellow-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Star className="w-5 h-5" />
              Favorite Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
              <span className="ml-2 text-white">Loading your favorite teams...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black border-yellow-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Heart className="w-5 h-5" />
            Favorite Teams
            <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
              {favoriteTeams.length}/5
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm">
            Select up to 5 teams to follow their games, players, and stats. 
            Your favorite teams will appear in your dashboard overview.
          </p>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData}
              className="mt-2 border-red-500/30 text-red-400 hover:bg-red-900/20"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Team Section */}
      {canAddMore && availableTeams.length > 0 && (
        <Card className="bg-black border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Add Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Select 
                value={selectedTeamId} 
                onValueChange={setSelectedTeamId}
                disabled={updating}
              >
                <SelectTrigger className="flex-1 bg-background border-border text-white">
                  <SelectValue placeholder="Select a team to add..." className="text-white" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                  {availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{team.team_name}</span>
                        <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/30">
                          {team.abbr}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => addFavoriteTeam(selectedTeamId)}
                disabled={!selectedTeamId || updating}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorite Teams Display */}
      <Card className="bg-black border-yellow-400/30">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Your Favorite Teams
            {favoriteTeams.length === 0 && (
              <span className="text-gray-400 text-sm font-normal ml-2">
                (No teams selected yet)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteTeams.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No favorite teams yet</p>
              <p className="text-gray-500 text-sm">
                Add teams above to start following their games and players
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteTeams.map((team) => (
                <div
                  key={team.id}
                  className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 hover:border-yellow-400 transition-all duration-200"
                >
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavoriteTeam(team.id)}
                    disabled={updating}
                    className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </Button>

                  {/* Team Info */}
                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <h3 className="font-semibold text-white text-sm truncate">
                        {team.team_name}
                      </h3>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/30">
                          {team.abbr}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {team.city}, {team.province}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Max Teams Reached */}
      {!canAddMore && (
        <Card className="bg-yellow-400/10 border-yellow-400/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">
                Maximum of 5 favorite teams reached
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Remove a team above to add a different one
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
