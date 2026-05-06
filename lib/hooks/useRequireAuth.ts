"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile, UserProfile } from "@/lib/database/profiles-client";
import { User } from "@supabase/supabase-js";

interface UseRequireAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useRequireAuth(): UseRequireAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          window.location.href = "/auth/login";
          return;
        }

        setUser(user);

        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading auth:", error);
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    };

    getUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = "/auth/login";
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, profile, loading };
}
