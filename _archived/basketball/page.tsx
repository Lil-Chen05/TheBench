"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TopNavbar from "@/components/top-navbar";
import PopularPicks from "@/components/basketball/popular-picks";
import FavoritePicks from "@/components/basketball/favorite-picks";
import { ParlayCartProvider, useParlayCart } from "@/components/parlay/parlay-context";
import { ToastProvider } from "@/components/ui/toast";
import ParlayCart from "@/components/parlay/parlay-cart";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

function BasketballContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDashboardShrunk } = useParlayCart();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    };

    getUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNavbar />
      <main 
        className={cn(
          "mt-[60px] flex flex-col gap-12 p-10 transition-all duration-300 ease-in-out",
          isDashboardShrunk 
            ? "mr-[400px] lg:mr-[450px] xl:mr-[500px]" 
            : "mr-0"
        )}
      >
        <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">
          Basketball Dashboard
        </div>
        
        {/* Popular Picks Section */}
        <PopularPicks />
        
        {/* Favorite Picks Section */}
        <FavoritePicks userProfile={profile} />
      </main>
      <ParlayCart />
    </div>
  );
}

export default function BasketballPage() {
  return (
    <ToastProvider>
      <ParlayCartProvider>
        <BasketballContent />
      </ParlayCartProvider>
    </ToastProvider>
  );
} 