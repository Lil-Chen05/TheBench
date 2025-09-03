"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Calendar,
  TrendingDown,
  Minus,
  Plus
} from 'lucide-react';
import { 
  PlayerWithTeam, 
  PlayerGameStats, 
  PlayerLastNGames, 
  PlayerSeasonAverages
} from '@/types/basketball';
import { BasketballAPI } from '@/lib/basketball-api';

interface PlayerStatsCardProps {
  player: PlayerWithTeam;
  gameStats?: PlayerGameStats;
  showProps?: boolean;
}

export default function PlayerStatsCard({ 
  player, 
  gameStats, 
  showProps = false
}: PlayerStatsCardProps) {
  const [seasonAverages, setSeasonAverages] = useState<PlayerSeasonAverages[]>([]);
  const [lastNGames, setLastNGames] = useState<PlayerLastNGames[]>([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (player.id) {
      loadPlayerData();
    }
  }, [player.id, loadPlayerData]);

  const loadPlayerData = useCallback(async () => {
    setLoading(true);
    try {
      // Load season averages
      const averages = await BasketballAPI.getPlayerSeasonAverages(player.id);
      setSeasonAverages(averages);

      // Load last 5 games for points
      const recentGames = await BasketballAPI.getPlayerLastNGames(player.id, 'points', 5);
      setLastNGames(recentGames);

      // Load player props if needed
      if (showProps) {
        // This would need a gameId context - for now we'll show a placeholder
        // In a real implementation, you'd pass the current game context
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  }, [player.id, showProps]);

  const getStatColor = (value: number, average: number) => {
    if (value > average * 1.2) return 'text-green-600 dark:text-green-400';
    if (value < average * 0.8) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`;
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">
                {player.jersey_number || '?'}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {player.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {player.team.team_name}
                </Badge>
                {player.team.conference && (
                  <Badge variant="secondary" className="text-xs">
                    {player.team.conference}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {gameStats && (
            <div className="text-right">
              <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {gameStats.is_starter ? 'Starter' : 'Bench'}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="props">Props</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {gameStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {gameStats.points}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {gameStats.total_rebounds}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rebounds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {gameStats.assists}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Assists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatMinutes(gameStats.minutes_played)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                </div>
              </div>
            )}

            {/* Season Averages */}
            {seasonAverages.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Season Averages
                </h4>
                {seasonAverages.map((season, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {season.season_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {season.games_played} games
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Points:</span>
                        <span className="ml-2 font-medium">{season.avg_points}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Rebounds:</span>
                        <span className="ml-2 font-medium">{season.avg_rebounds}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Assists:</span>
                        <span className="ml-2 font-medium">{season.avg_assists}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Minutes:</span>
                        <span className="ml-2 font-medium">{season.avg_minutes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            {lastNGames.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Last 5 Games - Points
                </h4>
                <div className="space-y-2">
                  {lastNGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(game.game_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          vs {game.opponent}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {game.stat_value} pts
                        </span>
                        {seasonAverages[0] && (
                          <span className={`text-xs ${getStatColor(game.stat_value, seasonAverages[0].avg_points)}`}>
                            {game.stat_value > seasonAverages[0].avg_points ? (
                              <Plus className="w-3 h-3" />
                            ) : game.stat_value < seasonAverages[0].avg_points ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading trends...</p>
              </div>
            )}
          </TabsContent>

          {/* Props Tab */}
          <TabsContent value="props" className="space-y-4">
            {showProps ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Player Props
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Props will be available when viewing a specific game.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Props Not Available
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Enable props display to see betting lines for this player.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
