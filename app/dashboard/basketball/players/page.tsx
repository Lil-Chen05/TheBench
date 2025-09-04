"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, Users } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { PlayerWithTeam } from "@/types/basketball";
import PlayersList from "@/components/basketball/PlayersList";
import Link from "next/link";

export default function BasketballPlayersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
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
      } catch (error) {
        console.error('Error loading user data:', error);
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

  const handlePlayerClick = (player: PlayerWithTeam) => {
    // For now, just log the player. In the future, this could navigate to a player details page
    console.log('Player selected:', player);
    // Could implement: router.push(`/dashboard/basketball/players/${player.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md bg-black/20 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500"></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-4">
              <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <span className="text-4xl md:text-5xl font-black pixelated-text text-yellow-400 select-none drop-shadow-lg">
                PLAYERS
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="mt-4 text-yellow-400 font-bold uppercase tracking-wide">
              Loading Player Roster...
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
                <Users className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">Basketball Players</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard/basketball">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Basketball
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black">
                    <Trophy className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PlayersList 
            title="Basketball Players"
            showFilters={true}
            playersPerPage={20}
            onPlayerClick={handlePlayerClick}
          />
        </div>
      </div>
    </div>
  );
}
