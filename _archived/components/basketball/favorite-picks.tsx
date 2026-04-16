"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { useParlayCart } from "@/components/parlay/parlay-context";
import { useToast } from "@/components/ui/toast";

interface PlayerProp {
  id: string;
  playerName: string;
  teamName: string;
  teamAbbr: string;
  propType: string;
  predictedOutput: string;
  overOdds: string;
  underOdds: string;
}

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

interface FavoritePicksProps {
  userProfile: UserProfile | null;
}

// Mock data for favorite teams (filtered based on user's favorite teams)
const MOCK_FAVORITE_PICKS: PlayerProp[] = [
  {
    id: "f1",
    playerName: "Scottie Barnes",
    teamName: "Toronto Raptors",
    teamAbbr: "TOR",
    propType: "Points",
    predictedOutput: "18.5",
    overOdds: "+105",
    underOdds: "-125"
  },
  {
    id: "f2",
    playerName: "Pascal Siakam",
    teamName: "Toronto Raptors",
    teamAbbr: "TOR",
    propType: "Rebounds",
    predictedOutput: "7.5",
    overOdds: "+110",
    underOdds: "-130"
  },
  {
    id: "f3",
    playerName: "Shai Gilgeous-Alexander",
    teamName: "Oklahoma City Thunder",
    teamAbbr: "OKC",
    propType: "Points",
    predictedOutput: "31.5",
    overOdds: "+100",
    underOdds: "-120"
  },
  {
    id: "f4",
    playerName: "Chet Holmgren",
    teamName: "Oklahoma City Thunder",
    teamAbbr: "OKC",
    propType: "Blocks",
    predictedOutput: "2.5",
    overOdds: "+115",
    underOdds: "-145"
  },
  {
    id: "f5",
    playerName: "Anthony Edwards",
    teamName: "Minnesota Timberwolves",
    teamAbbr: "MIN",
    propType: "Points",
    predictedOutput: "25.5",
    overOdds: "+105",
    underOdds: "-125"
  },
  {
    id: "f6",
    playerName: "Karl-Anthony Towns",
    teamName: "Minnesota Timberwolves",
    teamAbbr: "MIN",
    propType: "Rebounds",
    predictedOutput: "9.5",
    overOdds: "+110",
    underOdds: "-130"
  }
];

export default function FavoritePicks({ userProfile }: FavoritePicksProps) {
  const { addToParlayCart, isPickInCart, removeFromCart } = useParlayCart();
  const { showToast } = useToast();

  const handleAddToParlay = (prop: PlayerProp, type: 'over' | 'under') => {
    const pickId = `${prop.id}-${type}`;
    
    // Check if pick is already in cart
    if (isPickInCart(pickId)) {
      // Remove from cart if already added
      removeFromCart(pickId);
      showToast("Pick removed from parlay", "info");
      return;
    }

    const pickData = {
      id: pickId,
      playerName: prop.playerName,
      teamName: prop.teamName,
      propType: prop.propType,
      predictedValue: parseFloat(prop.predictedOutput),
      pickType: type,
      odds: type === 'over' ? parseInt(prop.overOdds) : parseInt(prop.underOdds)
    };

    const result = addToParlayCart(pickData);
    
    if (result.success) {
      showToast(result.message, "success");
    } else {
      showToast(result.message, "error");
    }
  };

  const isPickAdded = (prop: PlayerProp, type: 'over' | 'under') => {
    return isPickInCart(`${prop.id}-${type}`);
  };

  // Filter picks based on user's favorite teams
  const getFilteredPicks = () => {
    if (!userProfile || !userProfile.favorite_teams || userProfile.favorite_teams.length === 0) {
      return [];
    }

    // For demo purposes, we'll show picks for teams that might match user's favorites
    // In a real app, you'd filter based on actual team IDs from the database
    return MOCK_FAVORITE_PICKS.slice(0, Math.min(6, userProfile.favorite_teams.length * 2));
  };

  const filteredPicks = getFilteredPicks();

  if (!userProfile || !userProfile.favorite_teams || userProfile.favorite_teams.length === 0) {
    return (
      <div className="w-full mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">Your Favorite Teams</h2>
          <div className="w-16 h-1 bg-[#F4D03F] rounded"></div>
        </div>
        
        <Card className="bg-black text-white border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-300 mb-4">No favorite teams selected yet.</p>
            <p className="text-gray-400 text-sm">Select your favorite teams in your profile to see personalized picks.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Your Favorite Teams</h2>
        <div className="w-16 h-1 bg-[#F4D03F] rounded"></div>
      </div>
      
      {filteredPicks.length === 0 ? (
        <Card className="bg-black text-white border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-300">No props available for your favorite teams at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPicks.map((prop) => (
            <Card 
              key={prop.id} 
              className={cn(
                "bg-black text-white border-gray-700 transition-all duration-200 hover:border-[#F4D03F]",
                (isPickAdded(prop, 'over') || isPickAdded(prop, 'under')) && "border-[#F4D03F] shadow-lg shadow-[#F4D03F]/20"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Jersey Icon */}
                    <div className="w-8 h-10 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-black text-xs font-bold">00</span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg font-bold">{prop.playerName}</CardTitle>
                      <p className="text-gray-400 text-sm">{prop.teamName}</p>
                    </div>
                  </div>
                  {/* Pick Indicator */}
                  {(isPickAdded(prop, 'over') || isPickAdded(prop, 'under')) && (
                    <Badge className="bg-green-600 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Added
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{prop.propType}</span>
                    <span className="text-[#F4D03F] font-bold text-lg">{prop.predictedOutput}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToParlay(prop, 'over')}
                      className={cn(
                        "flex-1 font-bold py-2 transition-all duration-200",
                        isPickAdded(prop, 'over')
                          ? "bg-green-600 text-white hover:bg-red-600"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      )}
                    >
                      {isPickAdded(prop, 'over') ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Remove
                        </>
                      ) : (
                        <>
                          ↑ {prop.overOdds}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleAddToParlay(prop, 'under')}
                      className={cn(
                        "flex-1 font-bold py-2 transition-all duration-200",
                        isPickAdded(prop, 'under')
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      )}
                    >
                      {isPickAdded(prop, 'under') ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Remove
                        </>
                      ) : (
                        <>
                          ↓ {prop.underOdds}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToParlay(prop, 'over')}
                    className={cn(
                      "w-full font-bold transition-all duration-200",
                      isPickAdded(prop, 'over') || isPickAdded(prop, 'under')
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-[#F4D03F] text-black hover:bg-[#e6c200] hover:scale-[1.02]"
                    )}
                    disabled={isPickAdded(prop, 'over') || isPickAdded(prop, 'under')}
                  >
                    {isPickAdded(prop, 'over') || isPickAdded(prop, 'under') ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Added to Parlay
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Parlay
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
} 