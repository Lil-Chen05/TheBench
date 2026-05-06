"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Shape of a pick in the parlay cart.
 *
 * `player_prop_id` is the stable identity (matches `player_props.id` in the
 * database) and is what we send to POST /api/parlays. Everything else on
 * this record is denormalized display data — cheaper than re-fetching when
 * the cart renders, and kept consistent with the server's own denormalized
 * snapshot on parlay_picks.
 */
export interface ParlayPick {
  player_prop_id: number;
  pick_type: "over" | "under";
  line: number;
  stat_type: string; // currently always "points" for MVP
  player_name: string;
  team_abbr: string;
  game_id: number;
  simulation_date: string; // YYYY-MM-DD — all picks in a parlay must match
}

// Fixed multiplier payouts — must stay in sync with getPayoutMultiplier()
// in lib/database/parlays.ts. 0 means "not a valid parlay size yet."
const PAYOUT_MULTIPLIERS: Record<number, number> = {
  2: 3,
  3: 5,
  4: 10,
  5: 20,
};

interface ParlayCartContextType {
  picks: ParlayPick[];
  betAmount: number;
  isCartOpen: boolean;
  isDashboardShrunk: boolean;
  /** Date all picks in the cart are for. `null` when the cart is empty. */
  simulationDate: string | null;
  addToParlayCart: (pick: ParlayPick) => { success: boolean; message: string };
  removeFromCart: (propId: number) => void;
  clearCart: () => void;
  updateBetAmount: (amount: number) => void;
  openCart: () => void;
  closeCart: () => void;
  getMultiplier: () => number;
  getPotentialPayout: () => number;
  getPickCount: () => number;
  /** Is this specific prop in the cart — and if so, which direction? */
  getPickDirection: (propId: number) => "over" | "under" | null;
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

  const simulationDate = picks.length > 0 ? picks[0].simulation_date : null;

  const addToParlayCart = (
    pick: ParlayPick,
  ): { success: boolean; message: string } => {
    // Enforce same-date across the whole parlay. Once a cart has a pick, any
    // new pick must share its simulation_date — server also enforces this,
    // but we want to fail client-side with a clearer message.
    if (picks.length > 0 && picks[0].simulation_date !== pick.simulation_date) {
      return {
        success: false,
        message: "All picks must be from the same game date. Clear your cart to switch dates.",
      };
    }

    const existingIdx = picks.findIndex((p) => p.player_prop_id === pick.player_prop_id);

    // Same prop already in cart → treat as a direction toggle rather than
    // a duplicate. A duplicate prop would be rejected by the server anyway.
    if (existingIdx !== -1) {
      if (picks[existingIdx].pick_type === pick.pick_type) {
        return { success: false, message: "This pick is already in your parlay" };
      }
      setPicks((prev) => {
        const next = prev.slice();
        next[existingIdx] = pick;
        return next;
      });
      return { success: true, message: "Pick direction updated" };
    }

    if (picks.length >= 5) {
      return { success: false, message: "Maximum 5 picks allowed per parlay" };
    }

    setPicks((prev) => [...prev, pick]);

    // Open the cart + shrink the main content on first pick so the user
    // knows where their pick went.
    if (picks.length === 0) {
      setIsCartOpen(true);
      setIsDashboardShrunk(true);
    }

    return { success: true, message: "Pick added to parlay" };
  };

  const removeFromCart = (propId: number) => {
    // Compute the next array inside the updater so we're reading React's
    // queued state rather than the (potentially stale) closure over `picks`.
    // The collapse side-effect is decided from `next.length`, not from the
    // pre-update value.
    setPicks((prev) => {
      const next = prev.filter((p) => p.player_prop_id !== propId);
      if (next.length === 0) {
        setIsCartOpen(false);
        setIsDashboardShrunk(false);
      }
      return next;
    });
  };

  const clearCart = () => {
    setPicks([]);
    setBetAmount(10);
    setIsCartOpen(false);
    setIsDashboardShrunk(false);
  };

  const updateBetAmount = (amount: number) => {
    // Clamp to the range POST /api/parlays validates (10..1000).
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

  const getMultiplier = (): number => PAYOUT_MULTIPLIERS[picks.length] ?? 0;

  const getPotentialPayout = (): number => {
    const multiplier = getMultiplier();
    if (multiplier === 0) return 0;
    return betAmount * multiplier;
  };

  const getPickCount = (): number => picks.length;

  const getPickDirection = (propId: number): "over" | "under" | null => {
    const match = picks.find((p) => p.player_prop_id === propId);
    return match ? match.pick_type : null;
  };

  const canPlaceParlay = (): boolean =>
    picks.length >= 2 && picks.length <= 5 && simulationDate !== null;

  const getValidationMessage = (): string => {
    if (picks.length === 0) return "Add picks to start building your parlay";
    if (picks.length === 1) return "Add at least 2 picks to create a parlay";
    if (picks.length > 5) return "Maximum 5 picks allowed per parlay";
    return "";
  };

  const value: ParlayCartContextType = {
    picks,
    betAmount,
    isCartOpen,
    isDashboardShrunk,
    simulationDate,
    addToParlayCart,
    removeFromCart,
    clearCart,
    updateBetAmount,
    openCart,
    closeCart,
    getMultiplier,
    getPotentialPayout,
    getPickCount,
    getPickDirection,
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
    throw new Error("useParlayCart must be used within a ParlayCartProvider");
  }
  return context;
}
