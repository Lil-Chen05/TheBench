"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BasketballTeam } from '@/types/basketball';
import { BasketballAPI } from '@/lib/basketball-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

interface FavoriteTeamsDisplayProps {
  userId: string;
  favoriteTeamIds: string[];
}

export default function FavoriteTeamsDisplay({ userId, favoriteTeamIds }: FavoriteTeamsDisplayProps) {
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavoriteTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (favoriteTeamIds.length === 0) {
          setTeams([]);
          return;
        }

        const favoriteTeams = await BasketballAPI.getUserFavoriteTeams(userId);
        setTeams(favoriteTeams);
      } catch (err) {
        console.error('Error loading favorite teams:', err);
        setError('Failed to load favorite teams');
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteTeams();
  }, [userId, favoriteTeamIds]);

  const handleToggleFavorite = async (teamId: number) => {
    try {
      const supabase = createClient();
      const currentFavorites = favoriteTeamIds || [];
      
      let newFavorites: string[];
      if (currentFavorites.includes(teamId.toString())) {
        // Remove from favorites
        newFavorites = currentFavorites.filter(id => id !== teamId.toString());
      } else {
        // Add to favorites (max 5)
        if (currentFavorites.length >= 5) {
          return; // Don't add if already at max
        }
        newFavorites = [...currentFavorites, teamId.toString()];
      }

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_teams: newFavorites })
        .eq('id', userId);

      if (error) {
        console.error('Error updating favorites:', error);
      } else {
        // Update local state
        if (currentFavorites.includes(teamId.toString())) {
          setTeams(teams.filter(team => team.id !== teamId));
        } else {
          // Add the team to local state
          const teamToAdd = teams.find(team => team.id === teamId);
          if (teamToAdd) {
            setTeams([...teams, teamToAdd]);
          }
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <Card className="group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
        
        <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-yellow-400">Loading teams...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
        
        <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 text-center">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
      
      <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[200px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">
              Your Teams
            </h3>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{teams.length}/5</span>
            </div>
          </div>
          
          {teams.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-yellow-300/80 text-sm mb-3">No favorite teams yet</p>
              <Link href="/dashboard/basketball">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded transition-colors duration-300 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teams
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 3).map((team) => (
                <div key={team.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-yellow-400/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xs">{team.abbr}</span>
                    </div>
                    <span className="text-yellow-300 text-sm font-medium truncate">{team.team_name}</span>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(team.id)}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  >
                    ★
                  </button>
                </div>
              ))}
              {teams.length > 3 && (
                <p className="text-yellow-300/60 text-xs text-center">
                  +{teams.length - 3} more teams
                </p>
              )}
              <div className="pt-2">
                <Link href="/dashboard/basketball">
                  <Button variant="outline" className="w-full text-xs border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300 transition-colors duration-200">
                    Manage Teams
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
