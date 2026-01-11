"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, Clock } from "lucide-react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function StandingsPage() {
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
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
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
                <h1 className="text-2xl font-bold text-white">Team Standings</h1>
              </div>
              <Link href="/dashboard/basketball">
                <Button variant="outline" className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-black border-yellow-400/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Coming Soon
              </CardTitle>
              <p className="text-gray-300 text-lg">
                Team standings and league tables are currently under development
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-gray-400">
                                  We&apos;re working hard to bring you comprehensive team standings, league tables, 
                and season statistics. This feature will include:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-yellow-400">League Tables</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Win/Loss records</li>
                      <li>• Points and rankings</li>
                      <li>• Conference standings</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-yellow-400">Statistics</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Season performance</li>
                      <li>• Head-to-head records</li>
                      <li>• Recent form trends</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/dashboard/basketball">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
