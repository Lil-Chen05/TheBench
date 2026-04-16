"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Calendar,
  ArrowLeft,
  Filter,
  RefreshCw
} from "lucide-react";
import { BasketballAPI } from "@/lib/basketball-api";
import { GameWithTeams } from "@/types/basketball";
import GamesList from "@/components/basketball/GamesList";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

interface GameStats {
  upcomingCount: number;
  recentCount: number;
  totalCount: number;
}

export default function BasketballGamesPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [allGames, setAllGames] = useState<GameWithTeams[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    upcomingCount: 0,
    recentCount: 0,
    totalCount: 0
  });
  const [activeTab, setActiveTab] = useState('upcoming');

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const GAMES_PER_PAGE = 10;

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Reset pagination when switching tabs or changing filters
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when switching tabs
  }, [activeTab, searchTerm, selectedTeamId]);

  // Real-time updates for live games
  useEffect(() => {
    if (activeTab === 'upcoming' && user) {
      const subscription = supabase
        .channel('game-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'games' },
          (payload) => {
            // Update games in real-time
            handleGameUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeTab, user, supabase]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGameUpdate = (payload: any) => {
    // Update the games list when game data changes
    setAllGames(prevGames => {
      const updatedGames = [...prevGames];
      const gameIndex = updatedGames.findIndex(g => g.id === payload.new?.id);
      
      if (gameIndex !== -1) {
        updatedGames[gameIndex] = { ...updatedGames[gameIndex], ...payload.new };
      } else if (payload.eventType === 'INSERT') {
        updatedGames.unshift(payload.new);
      }
      
      return updatedGames;
    });
  };

  const loadInitialData = async () => {
    console.log('🚀 Starting to load games...');
    setLoading(true);
    try {
      // Use your existing working API - just load recent games once
      const games = await BasketballAPI.getGames(undefined, 100);
      console.log('✅ Loaded games from API:', games.length, games);
      setAllGames(games);
      
      // Calculate stats from the loaded games
      const now = new Date();
      const stats = {
        upcomingCount: games.filter(g => new Date(g.game_date) > now).length,
        recentCount: games.filter(g => new Date(g.game_date) <= now).length,
        totalCount: games.length
      };
      console.log('📊 Calculated stats:', stats);
      setGameStats(stats);
    } catch (error) {
      console.error('❌ Error loading games:', error);
    } finally {
      console.log('⏹️ Setting loading to false');
      setLoading(false);
    }
  };



  // Enhanced filtering with search and team filters
  const getFilteredGames = (type: 'upcoming' | 'recent' | 'all'): GameWithTeams[] => {
    console.log(`🔍 Filtering games for type: ${type}, total games: ${allGames.length}`);
    
    if (!allGames.length) {
      console.log('❌ No games to filter');
      return [];
    }
    
    const now = new Date();
    let filtered: GameWithTeams[] = [];
    
    // First filter by time
    switch (type) {
      case 'upcoming':
        filtered = allGames.filter(game => new Date(game.game_date) > now);
        break;
      case 'recent':
        filtered = allGames.filter(game => new Date(game.game_date) <= now);
        break;
      case 'all':
      default:
        filtered = allGames;
    }
    
    // Then apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(game => 
        game.home_team?.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.away_team?.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Then apply team filter
    if (selectedTeamId) {
      filtered = filtered.filter(game => 
        game.home_team_id === selectedTeamId || game.away_team_id === selectedTeamId
      );
    }
    
    console.log(`✅ Filtered ${filtered.length} games for ${type}`);
    return filtered;
  };

  // Pagination function to limit displayed games
  const getPaginatedGames = (games: GameWithTeams[]): GameWithTeams[] => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return games.slice(startIndex, startIndex + GAMES_PER_PAGE);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md bg-black/20 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500"></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-4">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <span className="text-4xl md:text-5xl font-black pixelated-text text-yellow-400 select-none drop-shadow-lg">
                GAMES
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="mt-4 text-yellow-400 font-bold uppercase tracking-wide">
              Loading Games...
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-black/80 backdrop-blur-md border-b border-yellow-400/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">Basketball Games</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard/basketball">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Basketball
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Controls */}
          <div className="bg-black/50 backdrop-blur-md border border-yellow-400/30 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div>
                <input
                  type="text"
                  placeholder="Search games by team or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/30 border border-yellow-400/50 rounded px-3 py-2 text-white placeholder-yellow-300/60 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              
              {/* Team Filter */}
              <div>
                <label htmlFor="team-filter" className="sr-only">Filter by Team</label>
                <select
                  id="team-filter"
                  value={selectedTeamId || ''}
                  onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-black/30 border border-yellow-400/50 rounded px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">All Teams</option>
                  {/* You'll need to load teams for this - use existing BasketballAPI.getTeams() */}
                </select>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-yellow-400/30">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                <Filter className="w-4 h-4 mr-2" />
                All Games
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Games Tab */}
            <TabsContent value="upcoming" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Upcoming Games</h2>
                <p className="text-yellow-300/80">
                  Browse upcoming basketball games and view player props
                </p>
              </div>
              
              <GamesList 
                games={getPaginatedGames(getFilteredGames('upcoming'))}
                loading={loading}
                title="Upcoming Basketball Games"
                showFilters={true}
                maxGames={GAMES_PER_PAGE}
                gameType="upcoming"
              />

              {/* Pagination Controls */}
              {(() => {
                const filteredGames = getFilteredGames('upcoming');
                const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
                return totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                      Previous
                    </Button>
                    
                    <span className="text-white px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                      Next
                    </Button>
                  </div>
                );
              })()}
            </TabsContent>

            {/* Recent Games Tab */}
            <TabsContent value="recent" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Recent Games</h2>
                <p className="text-yellow-300/80">
                  View recently completed games and final scores
                </p>
              </div>
              
              <GamesList 
                games={getPaginatedGames(getFilteredGames('recent'))}
                loading={loading}
                title="Recent Basketball Games"
                showFilters={true}
                maxGames={GAMES_PER_PAGE}
                gameType="recent"
              />

              {/* Pagination Controls */}
              {(() => {
                const filteredGames = getFilteredGames('recent');
                const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
                return totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                      Previous
                    </Button>
                    
                    <span className="text-white px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                      Next
                    </Button>
                  </div>
                );
              })()}
            </TabsContent>

            {/* All Games Tab */}
            <TabsContent value="all" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">All Games</h2>
                <p className="text-yellow-300/80">
                  Browse all basketball games across all seasons
                </p>
              </div>
              
              <GamesList 
                games={getPaginatedGames(getFilteredGames('all'))}
                loading={loading}
                title="All Basketball Games"
                showFilters={true}
                maxGames={GAMES_PER_PAGE}
                gameType="all"
              />

              {/* Pagination Controls */}
              {(() => {
                const filteredGames = getFilteredGames('all');
                const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
                return totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                      Previous
                    </Button>
                    
                    <span className="text-white px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    >
                      Next
                    </Button>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="mt-12">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-yellow-400/30">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {gameStats.upcomingCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Upcoming Games
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      Live
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time Updates
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      Props
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Player Betting Lines
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
