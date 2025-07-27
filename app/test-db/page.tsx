"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";

interface BasketballTeam {
  id: number;
  team_name: string;
  abbr: string;
  city: string;
  province: string;
}

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function TestDatabasePage() {
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          setMessage(`Error getting user: ${error.message}`);
          return;
        }
        setUser(user);
        if (user) {
          await loadUserProfile(user.id);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        setMessage(`Error in getUser: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    getUser();
  }, [supabase.auth]);

  // Load all teams
  const loadTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('basketballteams')
        .select('*')
        .order('team_name');
      
      if (error) {
        console.error('Error loading teams:', error);
        throw error;
      }
      setTeams(data || []);
      setMessage(`Loaded ${data?.length || 0} teams successfully`);
    } catch (error) {
      console.error('Error in loadTeams:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'message' in error) ? String(error.message) : 
        String(error);
      setMessage(`Error loading teams: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found for user, will need to create one');
          setUserProfile(null);
        } else {
          console.error('Error loading profile:', error);
          throw error;
        }
      } else {
        console.log('Profile loaded successfully:', data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'message' in error) ? String(error.message) : 
        String(error);
      setMessage(`Error loading profile: ${errorMessage}`);
    }
  };

  // Add favorite team
  const addFavoriteTeam = async (teamId: string) => {
    if (!user || !userProfile) {
      setMessage("No user or profile found");
      return;
    }

    setLoading(true);
    try {
      const currentFavorites = userProfile.favorite_teams || [];
      const updatedFavorites = [...currentFavorites, teamId];
      
      console.log('Adding favorite team:', teamId, 'for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_teams: updatedFavorites,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error adding favorite team:', error);
        throw error;
      }
      
      setUserProfile({
        ...userProfile,
        favorite_teams: updatedFavorites
      });
      setMessage(`Added team ${teamId} to favorites`);
    } catch (error) {
      console.error('Error in addFavoriteTeam:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'message' in error) ? String(error.message) : 
        String(error);
      setMessage(`Error adding favorite team: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove favorite team
  const removeFavoriteTeam = async (teamId: string) => {
    if (!user || !userProfile) {
      setMessage("No user or profile found");
      return;
    }

    setLoading(true);
    try {
      const currentFavorites = userProfile.favorite_teams || [];
      const updatedFavorites = currentFavorites.filter(id => id !== teamId);
      
      console.log('Removing favorite team:', teamId, 'for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_teams: updatedFavorites,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error removing favorite team:', error);
        throw error;
      }
      
      setUserProfile({
        ...userProfile,
        favorite_teams: updatedFavorites
      });
      setMessage(`Removed team ${teamId} from favorites`);
    } catch (error) {
      console.error('Error in removeFavoriteTeam:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'message' in error) ? String(error.message) : 
        String(error);
      setMessage(`Error removing favorite team: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Update balance
  const updateBalance = async (amount: number) => {
    if (!user || !userProfile) {
      setMessage("No user or profile found");
      return;
    }

    setLoading(true);
    try {
      const newBalance = userProfile.balance + amount;
      
      console.log('Updating balance for user:', user.id, 'new balance:', newBalance);
      const { error } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating balance:', error);
        throw error;
      }
      
      setUserProfile({
        ...userProfile,
        balance: newBalance
      });
      setMessage(`Balance updated to $${newBalance.toFixed(2)}`);
    } catch (error) {
      console.error('Error in updateBalance:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'message' in error) ? String(error.message) : 
        String(error);
      setMessage(`Error updating balance: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-black mb-8">Database Test Page</h1>
        
        {/* Status Message */}
        {message && (
          <div className="mb-6 p-4 bg-black text-white rounded border border-black">
            {message}
          </div>
        )}

        {/* User Info */}
        <Card className="mb-8 bg-black text-white border-black">
          <CardHeader>
            <CardTitle className="text-[#F4D03F]">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Authenticated:</strong> Yes</p>
                {userProfile && (
                  <div className="mt-4">
                    <p><strong>Profile Exists:</strong> Yes (created automatically)</p>
                    <p><strong>Balance:</strong> ${userProfile.balance.toFixed(2)}</p>
                    <p><strong>Favorite Teams:</strong> {userProfile.favorite_teams?.length || 0}</p>
                    <p><strong>Profile Created:</strong> {new Date(userProfile.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {!userProfile && (
                  <div className="mt-4">
                    <p><strong>Profile Exists:</strong> No (should be created automatically on signup)</p>
                    <p className="text-yellow-400">Note: Profile should be created automatically by Supabase trigger</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p><strong>Authenticated:</strong> No</p>
                <p>Please log in to test database functions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card className="mb-8 bg-black text-white border-black">
          <CardHeader>
            <CardTitle className="text-[#F4D03F]">Database Test Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={loadTeams} 
                disabled={loading}
                className="bg-[#F4D03F] text-black hover:bg-[#e6c200]"
              >
                Load All Teams
              </Button>
              
              <Button 
                onClick={() => updateBalance(10)} 
                disabled={loading || !userProfile}
                className="bg-[#F4D03F] text-black hover:bg-[#e6c200]"
              >
                Add $10
              </Button>
              
              <Button 
                onClick={() => updateBalance(-5)} 
                disabled={loading || !userProfile}
                className="bg-[#F4D03F] text-black hover:bg-[#e6c200]"
              >
                Remove $5
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teams Display */}
        {teams.length > 0 && (
          <Card className="mb-8 bg-black text-white border-black">
            <CardHeader>
              <CardTitle className="text-[#F4D03F]">Basketball Teams ({teams.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <div key={team.id} className="bg-white text-black p-3 rounded border border-black">
                    <h3 className="font-bold">{team.team_name}</h3>
                    <p className="text-sm">{team.city}, {team.province}</p>
                    <p className="text-xs text-gray-600">({team.abbr})</p>
                    {userProfile && (
                      <div className="mt-2">
                        {userProfile.favorite_teams?.includes(team.id.toString()) ? (
                          <Button 
                            size="sm"
                            onClick={() => removeFavoriteTeam(team.id.toString())}
                            disabled={loading}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Remove from Favorites
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => addFavoriteTeam(team.id.toString())}
                            disabled={loading}
                            className="bg-[#F4D03F] text-black hover:bg-[#e6c200]"
                          >
                            Add to Favorites
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Details */}
        {userProfile && (
          <Card className="bg-black text-white border-black">
            <CardHeader>
              <CardTitle className="text-[#F4D03F]">User Profile Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-white text-black p-4 rounded border border-black overflow-auto text-sm">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 