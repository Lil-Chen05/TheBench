"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Award, Target, RefreshCw } from 'lucide-react';
import { PlayerWithTeam, PlayerSeasonAverages } from '@/types/basketball';
import { BasketballAPI } from '@/lib/basketball-api';

interface PlayerDetailsModalProps {
  player: PlayerWithTeam;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerDetailsModal({ 
  player, 
  isOpen, 
  onClose 
}: PlayerDetailsModalProps) {
  const [playerStats, setPlayerStats] = useState<PlayerSeasonAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultImage = "https://mcgillathletics.ca/images/2021/11/11/Basketball_M_Headshots_920x1080_2021_11.jpg";

  // Helper function to get team name safely
  const getTeamName = () => {
    if (player.basketballteams) {
      if (typeof player.basketballteams === 'object' && 'team_name' in player.basketballteams) {
        return player.basketballteams.team_name;
      }
      if (typeof player.basketballteams === 'string') {
        return player.basketballteams;
      }
    }
    return 'Free Agent';
  };

  // Helper function to format percentage - check if it's already a percentage or decimal
  const formatPercentage = (value: number) => {
    // If the value is greater than 1, it's likely already a percentage
    if (value > 1) {
      return value.toFixed(1);
    }
    // If the value is between 0 and 1, it's a decimal that needs to be converted
    return (value * 100).toFixed(1);
  };

  // Load player stats when modal opens - MOVED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    const loadPlayerStats = async () => {
      if (!isOpen || !player.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const seasonAverages = await BasketballAPI.getPlayerSeasonAverages(player.id);
        
        console.log(`📊 Season averages for ${player.name}:`, seasonAverages); // Enhanced debug line
        
        if (seasonAverages && seasonAverages.length > 0) {
          setPlayerStats(seasonAverages[0]);
          console.log(`✅ Using season data for ${player.name}:`, seasonAverages[0]); // Added debug line for selected data
        } else {
          console.log(`❌ No season averages found for ${player.name}`); // Added debug line for no data
          setError('No stats available for this player');
        }
      } catch (err) {
        console.error(`🚨 Error loading player stats for ${player.name}:`, err);
        setError('Failed to load player statistics');
      } finally {
        setLoading(false);
      }
    };

    loadPlayerStats();
  }, [isOpen, player.id, player.name]); // Added player.name to dependencies

  // CONDITIONAL RETURN MOVED AFTER ALL HOOKS
  if (!isOpen) return null;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
        <Card className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 border-2 border-yellow-400/50 shadow-2xl backdrop-blur-lg max-w-md w-full">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
              <span className="text-gray-300">Loading player stats...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
      <Card className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 border-2 border-yellow-400/50 shadow-2xl backdrop-blur-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-90 duration-300">
        <CardHeader className="relative pb-6">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 border-gray-500 text-gray-400 hover:bg-gray-500/20 hover:text-white hover:border-gray-400 transition-all duration-200 p-2 rounded-full z-10"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Centered Player Header */}
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Player Photo - Larger and centered */}
            <div className="relative">
              <div className="w-48 h-48 lg:w-60 lg:h-60 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-4 border-yellow-400/50 shadow-2xl overflow-hidden group">
                <img 
                  src={defaultImage} 
                  alt={`${player.name} headshot`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              {/* Jersey Number Badge - Larger */}
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black px-4 py-2 rounded-full text-lg font-black shadow-xl">
                #{player.jersey_number || '00'}
              </div>
            </div>

            {/* Player Name - Much Larger */}
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                {player.name}
              </h2>
              
              {/* Team and Position - Larger badges */}
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-3 bg-yellow-400/20 px-6 py-3 rounded-xl border border-yellow-400/30">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-xl">
                    {getTeamName()}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-blue-500/20 px-6 py-3 rounded-xl border border-blue-500/30">
                  <Target className="w-6 h-6 text-blue-400" />
                  <span className="text-blue-400 font-bold text-xl">
                    Position TBD
                  </span>
                </div>
              </div>

              {/* Games Played and Season - Centered and larger */}
              {playerStats && (
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-600/30">
                    <span className="text-gray-400 text-lg">Games Played: </span>
                    <span className="text-white font-black text-xl">{playerStats.games_played}</span>
                  </div>
                  <div className="bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-600/30">
                    <span className="text-gray-400 text-lg">Season: </span>
                    <span className="text-white font-black text-xl">{playerStats.season_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg font-bold mb-2">{error}</div>
              <div className="text-gray-400">Unable to load player statistics</div>
            </div>
          ) : playerStats ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {/* Points Per Game */}
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/30 rounded-xl p-4 hover:border-red-400/50 transition-all duration-300 group">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-black text-red-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {playerStats.avg_points.toFixed(1)}
                    </div>
                    <div className="text-xs lg:text-sm text-red-300 font-semibold uppercase tracking-wide">
                      PPG
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Points Per Game
                    </div>
                  </div>
                </div>

                {/* Assists Per Game */}
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-4 hover:border-blue-400/50 transition-all duration-300 group">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-black text-blue-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {playerStats.avg_assists.toFixed(1)}
                    </div>
                    <div className="text-xs lg:text-sm text-blue-300 font-semibold uppercase tracking-wide">
                      APG
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Assists Per Game
                    </div>
                  </div>
                </div>

                {/* Rebounds Per Game */}
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-4 hover:border-green-400/50 transition-all duration-300 group">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-black text-green-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {playerStats.avg_rebounds.toFixed(1)}
                    </div>
                    <div className="text-xs lg:text-sm text-green-300 font-semibold uppercase tracking-wide">
                      RPG
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Rebounds Per Game
                    </div>
                  </div>
                </div>

                {/* Minutes Per Game */}
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 border border-gray-500/30 rounded-xl p-4 hover:border-gray-400/50 transition-all duration-300 group">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-black text-gray-300 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {playerStats.avg_minutes.toFixed(1)}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-300 font-semibold uppercase tracking-wide">
                      MPG
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Minutes Per Game
                    </div>
                  </div>
                </div>

                {/* Field Goal Percentage - FIXED */}
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-500/30 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300 group">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-black text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {formatPercentage(playerStats.fg_percentage)}%
                    </div>
                    <div className="text-xs lg:text-sm text-yellow-300 font-semibold uppercase tracking-wide">
                      FG%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Field Goal %
                    </div>
                  </div>
                </div>

                {/* Free Throw Percentage - FIXED */}
                <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300 group">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-black text-cyan-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      {formatPercentage(playerStats.ft_percentage)}%
                    </div>
                    <div className="text-xs lg:text-sm text-cyan-300 font-semibold uppercase tracking-wide">
                      FT%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Free Throw %
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Point Percentage - Featured Stat - FIXED */}
              <div className="bg-gradient-to-r from-yellow-400/20 via-yellow-300/20 to-yellow-400/20 border-2 border-yellow-400/40 rounded-xl p-6 text-center mb-6">
                <div className="text-4xl lg:text-5xl font-black text-yellow-400 mb-2">
                  {formatPercentage(playerStats.three_point_percentage)}%
                </div>
                <div className="text-lg font-bold text-yellow-300 uppercase tracking-wider">
                  3-Point Percentage
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Three-Point Field Goal Percentage
                </div>
              </div>
            </>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-500 text-gray-300 hover:bg-gray-500/20 hover:text-white hover:border-gray-400 transition-all duration-300 px-8"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}