"use client";

import { useState, useEffect } from "react";
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

const SPORTS_OPTIONS = [
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'football', name: 'Football', icon: '🏈' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' }
];

export default function TeamSportSelectionModal({ 
  isOpen, 
  onClose, 
  userProfile, 
  onProfileUpdate 
}: TeamSportSelectionModalProps) {
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState<BasketballTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<BasketballTeam[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [validationError, setValidationError] = useState("");
  const supabase = createClient();

  // Load teams on mount
  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

  // Filter teams based on search term
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

  // Initialize selections from user profile
  useEffect(() => {
    if (userProfile) {
      setSelectedTeams(userProfile.favorite_teams || []);
      setSelectedSports(userProfile.favorite_sports || []);
    }
  }, [userProfile]);

  const loadTeams = async () => {
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
  };

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

  const handleSportToggle = (sportId: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      } else if (prev.length < 3) {
        return [...prev, sportId];
      }
      return prev;
    });
    setValidationError("");
  };

  const handleContinue = () => {
    if (selectedTeams.length === 0) {
      setValidationError("Please select at least 1 team to continue");
      return;
    }
    setStep(2);
    setValidationError("");
  };

  const handleBack = () => {
    setStep(1);
    setValidationError("");
  };

  const handleSave = async () => {
    if (!userProfile) return;

    if (selectedSports.length === 0) {
      setValidationError("Please select at least 1 sport to continue");
      return;
    }

    setLoading(true);
    setValidationError("");
    
    try {
      // Update favorite teams and sports using direct Supabase calls
      const { error: teamsError } = await supabase
        .from('profiles')
        .update({
          favorite_teams: selectedTeams,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (teamsError) throw teamsError;

      const { error: sportsError } = await supabase
        .from('profiles')
        .update({
          favorite_sports: selectedSports,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (sportsError) throw sportsError;

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onProfileUpdate();
      onClose();
      setStep(1);
      setMessage("");
    } catch (error) {
      console.error('Error saving favorites:', error);
      setMessage('Error saving favorites');
    } finally {
      setLoading(false);
    }
  };

  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id.toString() === teamId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay - Non-dismissible */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {/* Modal Content */}
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-black border-black">
          <CardHeader className="bg-black text-white border-b border-gray-700">
            <CardTitle className="text-[#F4D03F] text-xl">
              Select Your Favorites - Step {step} of 2
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

            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Select Your Favorite Teams</h3>
                  <p className="text-gray-300 mb-4">Choose 1-3 teams you want to follow</p>
                  
                  {/* Search Bar */}
                  <Input
                    type="text"
                    placeholder="Search teams by name, city, or province..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F4D03F] focus:ring-[#F4D03F]"
                  />
                  
                  {/* Selection Counter */}
                  <p className="text-sm text-gray-300 mb-4">
                    {selectedTeams.length} of 3 teams selected
                  </p>
                </div>

                {/* Teams Grid */}
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

                {/* Continue Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleContinue}
                    disabled={selectedTeams.length === 0}
                    className="bg-[#F4D03F] text-black hover:bg-[#e6c200] disabled:bg-gray-600 disabled:text-gray-400"
                  >
                    Continue to Sports
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Select Your Favorite Sports</h3>
                  <p className="text-gray-300 mb-4">Choose 1-3 sports you're interested in</p>
                  
                  {/* Selected Teams Summary */}
                  <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-600">
                    <p className="text-sm font-semibold text-white mb-2">Selected Teams:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeams.map(teamId => {
                        const team = getTeamById(teamId);
                        return team ? (
                          <span key={teamId} className="px-2 py-1 bg-[#F4D03F] text-black text-xs rounded">
                            {team.team_name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  {/* Selection Counter */}
                  <p className="text-sm text-gray-300 mb-4">
                    {selectedSports.length} of 3 sports selected
                  </p>
                </div>

                {/* Sports Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {SPORTS_OPTIONS.map((sport) => {
                    const isSelected = selectedSports.includes(sport.id);
                    return (
                      <div
                        key={sport.id}
                        onClick={() => handleSportToggle(sport.id)}
                        className={`p-6 rounded border-2 cursor-pointer transition-all text-center ${
                          isSelected
                            ? 'bg-[#F4D03F] text-black border-[#F4D03F]'
                            : 'bg-gray-800 text-white border-gray-600 hover:border-[#F4D03F] hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-4xl mb-2">{sport.icon}</div>
                        <h4 className="font-bold">{sport.name}</h4>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Back to Teams
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={selectedSports.length === 0 || loading}
                    className="bg-[#F4D03F] text-black hover:bg-[#e6c200] disabled:bg-gray-600 disabled:text-gray-400"
                  >
                    {loading ? 'Saving...' : 'Save Favorites'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[#F4D03F] text-black px-6 py-3 rounded shadow-lg z-50 animate-slide-in">
          Favorites Updated Successfully!
        </div>
      )}
    </>
  );
} 