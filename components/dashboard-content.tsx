"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import TeamSportSelectionModal from "@/components/modals/team-sport-selection-modal";
import type { User } from "@supabase/supabase-js";

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
  const supabase = createClient();

  // Check if user needs to select favorites
  const needsFavorites = currentProfile && 
    (!currentProfile.favorite_teams || currentProfile.favorite_teams.length === 0) && 
    (!currentProfile.favorite_sports || currentProfile.favorite_sports.length === 0);

  // Show modal if user needs to select favorites
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
      <main className="ml-[50px] mt-[60px] flex flex-col gap-12 p-10">
        <div className="w-full">
          <div className="bg-black text-white text-sm p-3 px-5 rounded-md border border-black flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} className="text-[#F4D03F]" />
            This is a protected page that you can only see as an authenticated user
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">Your user details</div>
          <pre className="text-xs text-white bg-black p-3 rounded border border-black max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div>
          <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">Next steps</div>
          <div className="bg-black text-white p-4 rounded border border-black">
            <FetchDataSteps />
          </div>
        </div>
      </main>

      {/* Team Sport Selection Modal */}
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