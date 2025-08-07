"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardContent from "@/components/dashboard-content";
import { getUserProfile } from "@/lib/database/profiles-client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2193&q=80')"}}>
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md bg-black/20 group overflow-hidden">
          {/* Animated gradient background - only on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500"></div>
          
          {/* Subtle glow effect - appears on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700"></div>
          
          {/* Pulse effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:animate-pulse bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/5 transition-opacity duration-500"></div>
          
          {/* Loading content */}
          <div className="relative z-10 text-center">
            <div className="mb-4">
              <span className="text-4xl md:text-5xl font-black pixelated-text text-yellow-400 select-none drop-shadow-lg group-hover:text-yellow-300 transition-colors duration-300">THE BENCH</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="mt-4 text-yellow-400 font-bold uppercase tracking-wide">
              Getting You In The Game...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2193&q=80')"}}>
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Dashboard content with backdrop blur */}
      <div className="relative z-10 backdrop-blur-sm">
        <DashboardContent user={user} profile={profile} />
      </div>
    </div>
  );
}