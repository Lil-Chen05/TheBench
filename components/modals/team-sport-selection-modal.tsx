"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface TeamSportSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onProfileUpdate: () => void;
}

export default function TeamSportSelectionModal({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdate
}: TeamSportSelectionModalProps) {
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<BasketballTeam[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [validationError, setValidationError] = useState("");
  const supabase = createClient();

  const loadTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('basketballteams')
        .select('*')
        .order('team_name');

      if (error) throw error;
      setTeams(data || []);
      setFilteredTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      setMessage('Error loading teams');
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen, loadTeams]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.province.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  useEffect(() => {
    if (userProfile) {
      setSelectedTeams(userProfile.favorite_teams || []);
    }
  }, [userProfile]);

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else if (prev.length < 3) {
        return [...prev, teamId];
      }
      return prev;
    });
    setValidationError("");
  };

  const handleSave = async () => {
    if (!userProfile) return;

    if (selectedTeams.length === 0) {
      setValidationError("Please select at least 1 team to continue");
      return;
    }

    setLoading(true);
    setValidationError("");

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_teams: selectedTeams,
          favorite_sports: ['basketball'],
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onProfileUpdate();
      onClose();
      setMessage("");
    } catch (error) {
      console.error('Error saving favorites:', error);
      setMessage('Error saving favorites');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-black border-black">
          <CardHeader className="bg-black text-white border-b border-gray-700">
            <CardTitle className="text-[#F4D03F] text-xl">
              Select Your Favorite Teams
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[70vh] bg-black">
            {message && (
              <div className="mb-4 p-3 bg-red-900 text-red-200 rounded border border-red-700">
                {message}
              </div>
            )}

            {validationError && (
              <div className="mb-4 p-3 bg-red-900 text-red-200 rounded border border-red-700">
                {validationError}
              </div>
            )}

            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">Choose Your Teams</h3>
                <p className="text-gray-300 mb-4">Select 1-3 teams you want to follow</p>

                <Input
                  type="text"
                  placeholder="Search teams by name, city, or province..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F4D03F] focus:ring-[#F4D03F]"
                />

                <p className="text-sm text-gray-300 mb-4">
                  {selectedTeams.length} of 3 teams selected
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredTeams.map((team) => {
                  const isSelected = selectedTeams.includes(team.id.toString());
                  return (
                    <div
                      key={team.id}
                      onClick={() => handleTeamToggle(team.id.toString())}
                      className={`p-4 rounded border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#F4D03F] text-black border-[#F4D03F]'
                          : 'bg-gray-800 text-white border-gray-600 hover:border-[#F4D03F] hover:bg-gray-700'
                      }`}
                    >
                      <h4 className="font-bold text-sm">{team.team_name}</h4>
                      <p className="text-xs text-gray-400">{team.city}, {team.province}</p>
                      <p className="text-xs text-gray-500">({team.abbr})</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={selectedTeams.length === 0 || loading}
                  className="bg-[#F4D03F] text-black hover:bg-[#e6c200] disabled:bg-gray-600 disabled:text-gray-400"
                >
                  {loading ? 'Saving...' : 'Save Favorites'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showToast && (
        <div className="fixed top-4 right-4 bg-[#F4D03F] text-black px-6 py-3 rounded shadow-lg z-50 animate-slide-in">
          Favorites Updated Successfully!
        </div>
      )}
    </>
  );
}
