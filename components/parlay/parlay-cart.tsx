"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Trash2, DollarSign, AlertCircle } from "lucide-react";
import { useParlayCart } from "./parlay-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function ParlayCart() {
  const {
    picks,
    betAmount,
    isCartOpen,
    removeFromCart,
    clearCart,
    updateBetAmount,
    closeCart,
    getTotalOdds,
    getPotentialPayout,
    getPickCount,
    canPlaceParlay,
    getValidationMessage,
  } = useParlayCart();
  const { showToast } = useToast();
  const [isPlacingParlay, setIsPlacingParlay] = useState(false);

  const handlePlaceParlay = async () => {
    if (!canPlaceParlay()) {
      showToast(getValidationMessage(), "error");
      return;
    }
    setIsPlacingParlay(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API call
    showToast("Parlay placed successfully! Good luck!", "success");
    clearCart();
    setIsPlacingParlay(false);
  };

  const validationMessage = getValidationMessage();
  const canPlace = canPlaceParlay();

  const formatPickDescription = (pick: any) => {
    const direction = pick.pickType === 'over' ? '↑' : '↓';
    return `${direction} ${pick.predictedValue} ${pick.propType}`;
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <div
      className={cn(
        "fixed top-[60px] right-0 h-[calc(100vh-60px)] w-[400px] lg:w-[450px] xl:w-[500px] bg-black text-white border-l border-gray-700 shadow-2xl transition-transform duration-300 ease-in-out z-40",
        isCartOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-bold">
              My Parlay ({getPickCount()}/5)
            </h2>
            <Badge 
              className={cn(
                "font-bold",
                getPickCount() >= 2 ? "bg-green-600 text-white" : "bg-[#F4D03F] text-black"
              )}
            >
              {getPickCount() >= 2 ? "Ready" : "Add More"}
            </Badge>
          </div>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div className="p-4 bg-yellow-900/20 border-b border-yellow-700/50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">
                {validationMessage}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Picks List */}
          <div className="flex-1 overflow-y-auto p-4">
            {picks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 mb-2 font-medium">No picks added yet</p>
                <p className="text-gray-500 text-sm">
                  Add picks from the betting cards to build your parlay
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {picks.map((pick, index) => (
                  <Card 
                    key={pick.id} 
                    className="bg-gray-800 border-gray-600 hover:border-[#F4D03F]/50 transition-all duration-200 animate-in slide-in-from-right"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm">
                              {pick.playerName}
                            </h4>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              #{index + 1}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">{pick.teamName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[#F4D03F] font-bold text-sm">
                              {formatPickDescription(pick)}
                            </span>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {formatOdds(pick.odds)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeFromCart(pick.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1 transition-colors"
                          aria-label="Remove pick"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Betting Controls */}
          {picks.length > 0 && (
            <div className="border-t border-gray-700 p-4 space-y-4">
              {/* Total Odds */}
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300 font-medium">Total Odds:</span>
                <span className="text-[#F4D03F] font-bold text-xl">
                  {formatOdds(getTotalOdds())}
                </span>
              </div>

              {/* Bet Amount */}
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">
                  Bet Amount (Credits)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => updateBetAmount(Number(e.target.value))}
                    min={10}
                    max={1000}
                    className="pl-10 bg-gray-800 border-gray-600 text-white focus:border-[#F4D03F] focus:ring-[#F4D03F] transition-colors"
                    placeholder="10"
                  />
                </div>
                <p className="text-gray-500 text-xs">Min: $10 | Max: $1000</p>
              </div>

              {/* Potential Payout */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-700/30">
                <span className="text-gray-300 font-medium">Potential Payout:</span>
                <span className="text-green-400 font-bold text-2xl">
                  ${getPotentialPayout().toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handlePlaceParlay}
                  disabled={!canPlace || isPlacingParlay}
                  className={cn(
                    "w-full font-bold py-4 transition-all duration-200",
                    canPlace 
                      ? "bg-[#F4D03F] text-black hover:bg-[#e6c200] hover:scale-[1.02]" 
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isPlacingParlay ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Placing Parlay...
                    </div>
                  ) : (
                    `Place Parlay ${canPlace ? `($${betAmount})` : ''}`
                  )}
                </Button>
                
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All Picks
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 