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
import { User } from "@supabase/supabase-js";
import { BasketballAPI } from "@/lib/basketball-api";
import { Season } from "@/types/basketball";
import GamesList from "@/components/basketball/GamesList";
import Link from "next/link";

export default function BasketballGamesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  
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
        await loadSeasons();
      } catch (error) {
        console.error('Error loading basketball games page:', error);
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

  const loadSeasons = async () => {
    try {
      const seasonsData = await BasketballAPI.getSeasons();
      setSeasons(seasonsData);
    } catch (error) {
      console.error('Error loading seasons:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md bg-black/20 group overflow-hidden">
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}>
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
              
              
              <GamesList 
                title="Upcoming Basketball Games" 
                showFilters={true} 
                maxGames={30}
                gameType="upcoming"
              />
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
                title="Recent Basketball Games" 
                showFilters={true} 
                maxGames={30}
                gameType="recent"
              />
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
                title="All Basketball Games" 
                showFilters={true} 
                maxGames={50}
                gameType="all"
              />
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="mt-12">
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-yellow-400/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {seasons.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Seasons Available
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
