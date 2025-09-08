"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import TeamSportSelectionModal from "@/components/modals/team-sport-selection-modal";
import { useParlayCart } from "@/components/parlay/parlay-context";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import FavoriteTeamsDisplay from "@/components/dashboard/FavoriteTeamsDisplay";
import FavoriteSportsDisplay from "@/components/dashboard/FavoriteSportsDisplay";

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
          
          <div className="relative z-10 bg-black/10 backdrop-blur-sm text-yellow-400 text-3xl font-black p-6 rounded-xl border-2 border-yellow-400/40 shadow-2xl hover:shadow-xl transition-all duration-300 hover:text-yellow-300 overflow-hidden">
            <span className="pixelated-text uppercase tracking-wide drop-shadow-lg inline-block transition-transform duration-300 hover:scale-105">
            Dashboard
            </span>
          </div>
        </div>

        {/* Stats Grid with athletic cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Welcome Card */}
          <div className="group relative overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[160px]">
              <div>
                <h3 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Welcome!</h3>
                <p className="text-yellow-300/80 text-sm font-semibold mb-2">
                  Your gateway to USports basketball statistics in a fun and engaging way.
                </p>
                <p className="text-yellow-300/70 text-xs">
                  Sports parlay creation is our main focus, currently in development. We support men&apos;s basketball now, with plans to expand to women&apos;s basketball and other sports.
                </p>
              </div>
            </div>
          </div>
          
          {/* Balance Card */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[160px]">
              <div>
                <h3 className="text-xl font-black text-yellow-400 mb-3 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">Balance</h3>
                <p className="text-yellow-400 text-2xl font-black group-hover:text-yellow-300 transition-colors duration-300 mb-3">${currentProfile?.balance || 0}</p>
              </div>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded transition-colors duration-300 text-sm">
                Add Credits
              </button>
            </div>
          </div>
          
          {/* Favorite Teams Card */}
          <FavoriteTeamsDisplay 
            userId={user.id}
            favoriteTeamIds={currentProfile?.favorite_teams || []}
          />
          
          {/* Favorite Sports Card */}
          <FavoriteSportsDisplay 
            favoriteSports={currentProfile?.favorite_sports || []}
          />
        </div>

        {/* Basketball Section */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
          
          <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-yellow-400 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">
                🏀 Basketball
              </h3>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">BB</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-400/20">
                <h4 className="text-yellow-300 font-semibold mb-2">Quick Access</h4>
                <p className="text-yellow-100/80 text-sm mb-3">
                  View games, player stats, and make picks
                </p>
                <a 
                  href="/dashboard/basketball" 
                  className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded transition-colors duration-300"
                >
                  Go to Basketball
                </a>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-400/20">
                <h4 className="text-yellow-300 font-semibold mb-2">Features</h4>
                <ul className="text-yellow-100/80 text-sm space-y-1">
                  <li>• Game Results</li>
                  <li>• Player statistics</li>
                  <li>• Parlay odds</li>
                  <li>• Favorite teams</li>
                </ul>
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