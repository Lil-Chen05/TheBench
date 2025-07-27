"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import TeamSportSelectionModal from "@/components/modals/team-sport-selection-modal";
import { useParlayCart } from "@/components/parlay/parlay-context";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-white">
      <main 
        className={cn(
          "ml-[50px] mt-[60px] flex flex-col gap-12 p-10 transition-all duration-300 ease-in-out",
          isDashboardShrunk 
            ? "mr-[400px] lg:mr-[450px] xl:mr-[500px]" 
            : "mr-0"
        )}
      >
        <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">
          Dashboard
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-black text-white p-4 rounded border border-black">
            <h3 className="text-lg font-bold mb-2">Welcome Back!</h3>
            <p className="text-gray-300 text-sm">Ready to make some picks?</p>
          </div>
          
          <div className="bg-black text-white p-4 rounded border border-black">
            <h3 className="text-lg font-bold mb-2">Balance</h3>
            <p className="text-[#F4D03F] text-xl font-bold">${currentProfile?.balance || 0}</p>
          </div>
          
          <div className="bg-black text-white p-4 rounded border border-black">
            <h3 className="text-lg font-bold mb-2">Favorite Teams</h3>
            <p className="text-gray-300 text-sm">
              {currentProfile?.favorite_teams?.length || 0} teams selected
            </p>
          </div>
          
          <div className="bg-black text-white p-4 rounded border border-black">
            <h3 className="text-lg font-bold mb-2">Favorite Sports</h3>
            <p className="text-gray-300 text-sm">
              {currentProfile?.favorite_sports?.length || 0} sports selected
            </p>
          </div>
        </div>

        <div className="bg-black text-white p-6 rounded border border-black">
          <div className="flex items-center gap-2 mb-4">
            <InfoIcon className="w-5 h-5 text-[#F4D03F]" />
            <h3 className="text-lg font-bold">Getting Started</h3>
          </div>
          <FetchDataSteps />
        </div>

        <pre className="text-xs text-white bg-black p-3 rounded border border-black max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
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