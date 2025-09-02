"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import TeamSportSelectionModal from "@/components/modals/team-sport-selection-modal";
import { useParlayCart } from "@/components/parlay/parlay-context";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

interface DashboardContentProps {
  user: User;
  profile: UserProfile | null;
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(profile);
  const [showModal, setShowModal] = useState(false);
  const { isDashboardShrunk } = useParlayCart();
  const supabase = createClient();

  const needsFavorites = currentProfile && 
    (!currentProfile.favorite_teams || currentProfile.favorite_teams.length === 0) && 
    (!currentProfile.favorite_sports || currentProfile.favorite_sports.length === 0);

  useEffect(() => {
    if (needsFavorites) {
      setShowModal(true);
    }
  }, [needsFavorites]);

  const handleProfileUpdate = async () => {
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentProfile(profileData);
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://images.sidearmdev.com/convert?url=https%3a%2f%2fdxbhsrqyrr690.cloudfront.net%2fsidearm.nextgen.sites%2fmcgill.sidearmsports.com%2fimages%2f2019%2f11%2f15%2fBBALL_m_Whyne_Quarry_McG_UQAM_2018_19_MG.jpg&type=webp')"}}>
      <div className="absolute inset-0 bg-black/10"></div>
      
      <main 
        className={cn(
          "relative z-10 mt-[60px] flex flex-col gap-8 p-10 transition-all duration-300 ease-in-out",
          "ml-[60px]", // Always account for collapsed sidebar
          isDashboardShrunk 
            ? "mr-[400px] lg:mr-[450px] xl:mr-[500px]" 
            : "mr-0"
        )}
      >
         {/* Dashboard Header with athletic styling */}
        <div className="group relative overflow-hidden">
          {/* Animated gradient background - made more transparent */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-yellow-300/20 to-yellow-400/20 group-hover:from-yellow-400/30 group-hover:via-yellow-300/30 group-hover:to-yellow-400/30 transition-all duration-500 rounded-xl"></div>
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-300/15 to-yellow-400/10 transition-opacity duration-700 rounded-xl"></div>
          
          <div className="relative z-10 bg-black/10 backdrop-blur-sm text-yellow-400 text-3xl font-black p-6 rounded-xl border-2 border-yellow-400/40 shadow-2xl group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:text-yellow-300">
            <span className="pixelated-text uppercase tracking-wide drop-shadow-lg">Dashboard</span>
          </div>
        </div>

        {/* Stats Grid with athletic cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Welcome Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[120px]">
              <h3 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Welcome Back!</h3>
              <p className="text-yellow-300/80 text-sm font-semibold">Ready to make some championship picks?</p>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[120px]">
              <h3 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Balance</h3>
              <p className="text-yellow-400 text-2xl font-black group-hover:text-yellow-300 transition-colors duration-300">${currentProfile?.balance || 0}</p>
            </div>
          </div>
          
          {/* Favorite Teams Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[120px]">
              <h3 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Your Teams</h3>
              <p className="text-yellow-300/80 text-sm font-semibold">
                {currentProfile?.favorite_teams?.length || 0} championship teams
              </p>
            </div>
          </div>
          
          {/* Favorite Sports Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[120px]">
              <h3 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Your Sports</h3>
              <p className="text-yellow-300/80 text-sm font-semibold">
                {currentProfile?.favorite_sports?.length || 0} elite sports
              </p>
            </div>
          </div>
        </div>

        {/* User Data Debug Card with athletic styling */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
          
          <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300">
            <h3 className="text-lg font-black text-yellow-400 mb-4 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Player Profile Data</h3>
            <pre className="text-xs text-yellow-100 bg-black/30 p-4 rounded border border-yellow-400/20 max-h-32 overflow-auto font-mono">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        {/* Basketball Database Call-to-Action */}
        <div className="group relative overflow-hidden">
          {/* Background with athletic styling */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
          
          <div className="relative z-10 p-8 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-yellow-400 pixelated-text uppercase tracking-wide group-hover:text-yellow-300 transition-colors duration-300">
                  🏀 Canadian Univeristy MBB Directory
                </h2>
                <p className="text-yellow-300/80 text-lg font-semibold max-w-2xl mx-auto">
                  Access comprehensive player data, game statistics, and performance analytics from Canadian university basketball
                </p>
              </div>
              
              <Link 
                href="/basketball_search_database"
                className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black rounded-xl font-black uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/30 active:scale-95 text-lg group/button"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover/button:opacity-100 bg-gradient-to-r from-yellow-300 to-yellow-200 transition-opacity duration-300 rounded-xl"></div>
              
                <span className="pixelated-text relative z-10">Search Player Database</span>
                <span className="text-2xl transform group-hover/button:translate-x-1 transition-transform duration-200">→</span>
              </Link>
              
              <div className="flex justify-center items-center gap-8 text-sm text-yellow-400/60 font-bold">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Game Stats</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span>Team Records</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Player Performances</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <TeamSportSelectionModal
          isOpen={showModal}
          onClose={handleCloseModal}
          userProfile={currentProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}