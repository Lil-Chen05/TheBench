"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ParlayPick {
  id: string;
  playerName: string;
  teamName: string;
  propType: string;
  predictedValue: number;
  pickType: 'over' | 'under';
  odds: number;
}

interface ParlayCartContextType {
  picks: ParlayPick[];
  betAmount: number;
  isCartOpen: boolean;
  isDashboardShrunk: boolean;
  addToParlayCart: (pick: ParlayPick) => { success: boolean; message: string };
  removeFromCart: (pickId: string) => void;
  clearCart: () => void;
  updateBetAmount: (amount: number) => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalOdds: () => number;
  getPotentialPayout: () => number;
  getPickCount: () => number;
  isPickInCart: (pickId: string) => boolean;
  canPlaceParlay: () => boolean;
  getValidationMessage: () => string;
}

const ParlayCartContext = createContext<ParlayCartContextType | undefined>(undefined);

interface ParlayCartProviderProps {
  children: ReactNode;
}

export function ParlayCartProvider({ children }: ParlayCartProviderProps) {
  const [picks, setPicks] = useState<ParlayPick[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isDashboardShrunk, setIsDashboardShrunk] = useState<boolean>(false);

  const addToParlayCart = (pick: ParlayPick): { success: boolean; message: string } => {
    // Check if pick already exists
    if (picks.some(p => p.id === pick.id)) {
      return { 
        success: false, 
        message: "This pick is already in your parlay" 
      };
    }

    // Check if cart is full (max 5 picks)
    if (picks.length >= 5) {
      return { 
        success: false, 
        message: "Maximum 5 picks allowed per parlay" 
      };
    }

    setPicks(prev => [...prev, pick]);
    
    // Open cart and shrink dashboard on first pick
    if (picks.length === 0) {
      setIsCartOpen(true);
      setIsDashboardShrunk(true);
    }
    
    return { 
      success: true, 
      message: "Pick added to parlay" 
    };
  };

  const removeFromCart = (pickId: string) => {
    setPicks(prev => prev.filter(pick => pick.id !== pickId));
    
    // Close cart and expand dashboard if no picks left
    if (picks.length === 1) {
      setIsCartOpen(false);
      setIsDashboardShrunk(false);
    }
  };

  const clearCart = () => {
    setPicks([]);
    setBetAmount(10);
    setIsCartOpen(false);
    setIsDashboardShrunk(false);
  };

  const updateBetAmount = (amount: number) => {
    // Ensure bet amount is within valid range
    const validAmount = Math.max(10, Math.min(1000, amount));
    setBetAmount(validAmount);
  };

  const openCart = () => {
    setIsCartOpen(true);
    if (picks.length > 0) {
      setIsDashboardShrunk(true);
    }
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setIsDashboardShrunk(false);
  };

  const getTotalOdds = (): number => {
    if (picks.length === 0) return 0;

    // Calculate total odds by multiplying individual odds
    const totalOdds = picks.reduce((total, pick) => {
      // Convert American odds to decimal for calculation
      const decimalOdds = pick.odds > 0 ? (pick.odds / 100) + 1 : (100 / Math.abs(pick.odds)) + 1;
      return total * decimalOdds;
    }, 1);

    // Convert back to American odds format
    const americanOdds = totalOdds > 2 ? (totalOdds - 1) * 100 : -100 / (totalOdds - 1);
    return Math.round(americanOdds);
  };

  const getPotentialPayout = (): number => {
    const totalOdds = getTotalOdds();
    if (totalOdds === 0) return 0;

    // Calculate potential payout
    const decimalOdds = totalOdds > 0 ? (totalOdds / 100) + 1 : (100 / Math.abs(totalOdds)) + 1;
    return Math.round(betAmount * decimalOdds);
  };

  const getPickCount = (): number => {
    return picks.length;
  };

  const isPickInCart = (pickId: string): boolean => {
    return picks.some(pick => pick.id === pickId);
  };

  const canPlaceParlay = (): boolean => {
    return picks.length >= 2 && picks.length <= 5;
  };

  const getValidationMessage = (): string => {
    if (picks.length === 0) {
      return "Add picks to start building your parlay";
    }
    if (picks.length === 1) {
      return "Add at least 2 picks to create a parlay";
    }
    if (picks.length > 5) {
      return "Maximum 5 picks allowed per parlay";
    }
    return "";
  };

  const value: ParlayCartContextType = {
    picks,
    betAmount,
    isCartOpen,
    isDashboardShrunk,
    addToParlayCart,
    removeFromCart,
    clearCart,
    updateBetAmount,
    openCart,
    closeCart,
    getTotalOdds,
    getPotentialPayout,
    getPickCount,
    isPickInCart,
    canPlaceParlay,
    getValidationMessage,
  };

  return (
    <ParlayCartContext.Provider value={value}>
      {children}
    </ParlayCartContext.Provider>
  );
}

export function useParlayCart() {
  const context = useContext(ParlayCartContext);
  if (context === undefined) {
    throw new Error('useParlayCart must be used within a ParlayCartProvider');
  }
  return context;
} 