"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/database/profiles-client";
import WelcomeHeader from "@/components/account/welcome-header";
import AccountInformation from "@/components/account/account-information";
import AccountSettings from "@/components/account/account-settings";
import BalancePanel from "@/components/account/balance-panel";
import TopNavbar from "@/components/top-navbar";
import Sidebar from "@/components/sidebar";
import { ParlayCartProvider } from "@/components/parlay/parlay-context";
import { ToastProvider } from "@/components/ui/toast";
import ParlayCart from "@/components/parlay/parlay-cart";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      try {
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          window.location.href = '/auth/login';
          return;
        }

        setUser(user);

        // Fetch user profile data
        const profileData = await getUserProfile(user.id);
        
        if (!profileData) {
          // If no profile exists, redirect to dashboard to trigger profile creation
          window.location.href = '/dashboard';
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Error loading account page:', error);
        window.location.href = '/dashboard';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect to login
  }

  return (
    <ToastProvider>
      <ParlayCartProvider>
        <div className="flex h-screen bg-black text-white">
          {/* Left Sidebar Navigation */}
          <Sidebar active="dashboard" />
          
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Bar */}
            <TopNavbar />
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-auto ml-[50px] mt-[60px]">
              <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
                {/* Full-width welcome section */}
                <WelcomeHeader user={user} />
                
                {/* Split layout container */}
                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                  {/* Left/Main content area (70% on desktop, full width on mobile) */}
                  <div className="flex-1 space-y-6">
                    <AccountInformation user={user} profile={profile} />
                    <AccountSettings profile={profile} />
                    {/* Placeholder for future sections */}
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-yellow-400 mb-4">Coming Soon</h3>
                      <p className="text-gray-400">Statistics dashboard and betting history will be added here.</p>
                    </div>
                  </div>
                  
                  {/* Right sticky balance panel (30% on desktop, bottom sticky on mobile) */}
                  <div className="lg:w-80 lg:sticky lg:top-8 lg:self-start">
                    <BalancePanel profile={profile} userId={user.id} />
                  </div>
                </div>
              </div>
            </main>
          </div>
          
          {/* Parlay Cart */}
          <ParlayCart />
        </div>
      </ParlayCartProvider>
    </ToastProvider>
  );
} 