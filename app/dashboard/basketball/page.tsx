"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Calendar,
  Star,
  Users,
  Target
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { BasketballAPI } from "@/lib/basketball-api";
import { 
  GameWithTeams, 
  Season, 
  TopPerformer, 
  FavoriteTeamGame,
  BasketballTeam 
} from "@/types/basketball";
import GamesList from "@/components/basketball/GamesList";
import Link from "next/link";

export default function BasketballDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingGames, setUpcomingGames] = useState<GameWithTeams[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [favoriteTeamGames, setFavoriteTeamGames] = useState<FavoriteTeamGame[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<BasketballTeam[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          window.location.href = '/auth/login';
          return;
        }

        setUser(user);
        await loadBasketballData(user.id);
      } catch (error) {
        console.error('Error loading basketball dashboard:', error);
        window.location.href = '/auth/login';
      } finally {
        setLoading(false);
      }
    };

    getUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = '/auth/login';
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const loadBasketballData = async (userId: string) => {
    try {
      // Load upcoming games
      const games = await BasketballAPI.getUpcomingGames(7);
      setUpcomingGames(games);

      // Load top performers for points
      const performers = await BasketballAPI.getTopPerformers('points', undefined, 5);
      setTopPerformers(performers);

      // Load user's favorite teams
      const teams = await BasketballAPI.getUserFavoriteTeams(userId);
      setFavoriteTeams(teams);

      // Load favorite team games
      if (teams.length > 0) {
        const favoriteGames = await BasketballAPI.getFavoriteTeamGames(userId, 7);
        setFavoriteTeamGames(favoriteGames);
      }

      // Load seasons
      const seasonsData = await BasketballAPI.getSeasons();
      setSeasons(seasonsData);
    } catch (error) {
      console.error('Error loading basketball data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2193&q=80')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md bg-black/20 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500"></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-4">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <span className="text-4xl md:text-5xl font-black pixelated-text text-yellow-400 select-none drop-shadow-lg">
                BASKETBALL
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="mt-4 text-yellow-400 font-bold uppercase tracking-wide">
              Loading Your Court...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2193&q=80')"}}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-md border-b border-yellow-400/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">Basketball Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-yellow-400/30">
              <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Overview
              </TabsTrigger>
              <TabsTrigger value="games" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Games
              </TabsTrigger>
              <TabsTrigger value="players" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Players
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Favorites
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Upcoming Games
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {upcomingGames.length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Next 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Favorite Teams
                    </CardTitle>
                    <Star className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {favoriteTeams.length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Following
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Top Scorer
                    </CardTitle>
                    <Target className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {topPerformers[0]?.avg_stat || 'N/A'}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {topPerformers[0]?.player_name || 'No data'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Seasons
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {seasons.length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Available
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/basketball/games">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                        <Calendar className="w-4 h-4 mr-2" />
                        Browse Games
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/basketball/players">
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                        <Users className="w-4 h-4 mr-2" />
                        View Players
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/basketball/teams">
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold">
                        <Trophy className="w-4 h-4 mr-2" />
                        Manage Teams
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Games Preview */}
              {upcomingGames.length > 0 && (
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Upcoming Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingGames.slice(0, 6).map((game) => (
                        <div key={game.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(game.game_date).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {game.season.name}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>{game.home_team.team_name} vs {game.away_team.team_name}</div>
                            {game.location && (
                              <div className="text-xs text-gray-500 mt-1">{game.location}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link href="/dashboard/basketball/games">
                        <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                          View All Games
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-6">
              <GamesList 
                title="Basketball Games" 
                showFilters={true} 
                maxGames={20}
                gameType="upcoming"
              />
            </TabsContent>

            {/* Players Tab */}
            <TabsContent value="players" className="space-y-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topPerformers.length > 0 ? (
                    <div className="space-y-4">
                      {topPerformers.map((player, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-black font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {player.player_name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {player.team_name} • {player.games_played} games
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              {player.avg_stat} pts
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Avg per game
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No player data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Favorite Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoriteTeams.length > 0 ? (
                    <div className="space-y-4">
                      {favoriteTeams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-black font-bold text-sm">
                                {team.abbreviation}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {team.team_name}
                              </div>
                              {team.conference && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {team.conference}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven&apos;t added any favorite teams yet.
                      </p>
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        Add Favorite Teams
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Favorite Team Games */}
              {favoriteTeamGames.length > 0 && (
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Upcoming Favorite Team Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {favoriteTeamGames.map((game) => (
                        <div key={game.game_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(game.game_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {game.home_team} vs {game.away_team}
                          </div>
                          <div className="flex gap-2">
                            {game.is_favorite_home && (
                              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                Home
                              </Badge>
                            )}
                            {game.is_favorite_away && (
                              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                Away
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
