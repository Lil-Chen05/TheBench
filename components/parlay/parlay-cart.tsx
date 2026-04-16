"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useParlayCart, type ParlayPick } from "./parlay-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { PlaceParlayRequest } from "@/types/props";

/**
 * The parlay cart renders in two positioning modes:
 *
 *   - Desktop (≥ lg): a fixed right rail. On `/dashboard/play` the rail is
 *     always visible (empty state shown when no picks); on every other
 *     authed page it slides in/out based on `isCartOpen`. `/dashboard/play`
 *     reserves `lg:pr-[420px] xl:pr-[480px]` on its container so the rail
 *     never overlaps content.
 *   - Mobile (< lg): a bottom sheet triggered by the navbar's
 *     `ParlayCartBadge`, unchanged.
 *
 * Both modes share `<CartBody />` below so layout logic is not duplicated.
 */
export default function ParlayCart() {
  const { isCartOpen, closeCart } = useParlayCart();
  const pathname = usePathname();
  const alwaysOpen = pathname === "/dashboard/play";

  return (
    <>
      {/* Desktop: right rail (≥ lg) */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-[60px] right-0 h-[calc(100vh-60px)] w-[400px] xl:w-[460px]",
          "bg-[#0a0a0a] border-l border-gray-800 shadow-2xl flex-col z-40",
          "transition-transform duration-300 ease-in-out",
          alwaysOpen || isCartOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Parlay cart"
      >
        <CartBody mode="rail" alwaysOpen={alwaysOpen} />
      </aside>

      {/* Mobile: bottom sheet (< lg) */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
          isCartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* Scrim */}
        <button
          type="button"
          aria-label="Close parlay cart"
          onClick={closeCart}
          className="absolute inset-0 bg-black/60"
        />
        {/* Sheet */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[88vh] flex flex-col",
            "bg-[#0a0a0a] border-t border-gray-800 rounded-t-2xl shadow-2xl",
            "transition-transform duration-300 ease-in-out",
            isCartOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Grab handle */}
          <div className="pt-2 pb-1 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-gray-700" />
          </div>
          <CartBody mode="sheet" alwaysOpen={false} />
        </div>
      </div>
    </>
  );
}

function CartBody({
  mode,
  alwaysOpen,
}: {
  mode: "rail" | "sheet";
  alwaysOpen: boolean;
}) {
  const {
    picks,
    betAmount,
    simulationDate,
    removeFromCart,
    clearCart,
    updateBetAmount,
    getMultiplier,
    getPotentialPayout,
    getPickCount,
    canPlaceParlay,
    getValidationMessage,
    closeCart,
  } = useParlayCart();
  const { showToast } = useToast();
  const [isPlacingParlay, setIsPlacingParlay] = useState(false);

  const handlePlaceParlay = async () => {
    if (!canPlaceParlay() || !simulationDate) {
      showToast(getValidationMessage(), "error");
      return;
    }
    setIsPlacingParlay(true);
    try {
      const body: PlaceParlayRequest = {
        simulation_date: simulationDate,
        betAmount,
        picks: picks.map((p) => ({
          player_prop_id: p.player_prop_id,
          pick_type: p.pick_type,
        })),
      };
      const response = await fetch("/api/parlays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to place parlay");
      }
      showToast("Parlay placed successfully! Good luck!", "success");
      clearCart();
    } catch (error) {
      console.error("Error placing parlay:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to place parlay",
        "error",
      );
    } finally {
      setIsPlacingParlay(false);
    }
  };

  const validationMessage = getValidationMessage();
  const canPlace = canPlaceParlay();
  const multiplier = getMultiplier();
  const pickCount = getPickCount();
  const isEmpty = pickCount === 0;
  // Render the footer in two cases:
  //   1. there's at least one pick (traditional behaviour)
  //   2. we're on the play page and the rail is always visible — empty
  //      state still shows the entry amount + disabled Place button so the
  //      user sees the shape of the action before they've built anything.
  const showFooter = pickCount > 0 || alwaysOpen;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-lg font-bold tracking-tight">
              {isEmpty ? "Add Picks" : "My Parlay"}
            </h2>
            {!isEmpty && (
              <span className="text-gray-500 text-sm font-semibold">
                {pickCount}/5
              </span>
            )}
          </div>
          {simulationDate ? (
            <p className="text-gray-400 text-xs mt-0.5">
              Game date · <span className="text-gray-200">{simulationDate}</span>
            </p>
          ) : (
            <p className="text-gray-500 text-xs mt-0.5">
              Add picks to start playing
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEmpty && (
            <Badge
              className={cn(
                "font-bold uppercase tracking-wider text-[10px]",
                pickCount >= 2
                  ? "bg-green-500/20 text-green-300 border border-green-500/40"
                  : "bg-[#F4D03F]/15 text-[#F4D03F] border border-[#F4D03F]/40",
              )}
            >
              {pickCount >= 2 ? "Ready" : "Add More"}
            </Badge>
          )}
          {mode === "sheet" && (
            <button
              type="button"
              onClick={closeCart}
              className="text-gray-400 hover:text-white p-1"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {validationMessage && pickCount > 0 && (
        <div className="px-5 py-2.5 bg-yellow-900/10 border-b border-yellow-700/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-300 text-xs font-medium">
            {validationMessage}
          </span>
        </div>
      )}

      {/* Picks list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {picks.map((pick, index) => (
              <PickRow
                key={pick.player_prop_id}
                pick={pick}
                index={index}
                onRemove={() => removeFromCart(pick.player_prop_id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="border-t border-gray-800 px-5 py-4 space-y-3 bg-[#0a0a0a]">
          {!isEmpty && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-gray-900 border border-gray-800 px-3 py-2">
                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  Multiplier
                </div>
                <div className="text-[#F4D03F] font-black text-lg leading-tight">
                  {multiplier > 0 ? `${multiplier}x` : "—"}
                </div>
              </div>
              <div className="rounded-md bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-700/30 px-3 py-2">
                <div className="text-green-300/70 text-[10px] font-bold uppercase tracking-widest">
                  To Win
                </div>
                <div className="text-green-300 font-black text-lg leading-tight">
                  ${getPotentialPayout().toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Entry amount (credits)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                $
              </span>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => updateBetAmount(Number(e.target.value))}
                min={10}
                max={1000}
                className="pl-7 bg-gray-900 border-gray-700 text-white focus:border-[#F4D03F] focus:ring-[#F4D03F]"
                placeholder="10"
              />
            </div>
            <p className="text-gray-600 text-[10px] mt-1">Min $10 · Max $1000</p>
          </div>

          <div className="flex gap-2 pt-1">
            {!isEmpty && (
              <Button
                onClick={clearCart}
                variant="outline"
                className="shrink-0 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                aria-label="Clear all picks"
              >
                <Trash2 size={16} />
              </Button>
            )}
            <Button
              onClick={handlePlaceParlay}
              disabled={!canPlace || isPlacingParlay}
              className={cn(
                "flex-1 font-bold tracking-tight text-sm py-5 transition-colors",
                canPlace
                  ? "bg-[#F4D03F] text-black hover:bg-[#e6c200]"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed",
              )}
            >
              {isPlacingParlay ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Placing…
                </span>
              ) : canPlace ? (
                `Place Parlay · $${betAmount}`
              ) : (
                "Place Parlay"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-3">
        <span className="text-[#F4D03F] text-xl font-bold">+</span>
      </div>
      <p className="text-gray-200 font-semibold text-sm mb-1">No picks yet</p>
      <p className="text-gray-500 text-xs max-w-[240px]">
        Tap Over or Under on any prop to build your parlay (2–5 picks).
      </p>
    </div>
  );
}

function PickRow({
  pick,
  index,
  onRemove,
}: {
  pick: ParlayPick;
  index: number;
  onRemove: () => void;
}) {
  const isOver = pick.pick_type === "over";
  return (
    <li className="group rounded-lg bg-gray-900/80 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-stretch">
        {/* Direction rail */}
        <div
          className={cn(
            "w-1 rounded-l-lg",
            isOver ? "bg-green-500" : "bg-red-500",
          )}
          aria-hidden
        />
        <div className="flex-1 min-w-0 px-3 py-2.5 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-gray-500 text-[10px] font-bold">
                #{index + 1}
              </span>
              <span className="text-white font-bold text-sm truncate">
                {pick.player_name}
              </span>
              <span className="text-gray-400 text-[10px] font-semibold bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5">
                {pick.team_abbr}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isOver ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className={cn(
                  "text-sm font-bold",
                  isOver ? "text-green-300" : "text-red-300",
                )}
              >
                {isOver ? "Over" : "Under"} {pick.line}
              </span>
              <span className="text-gray-500 text-xs">{pick.stat_type}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-gray-500 hover:text-red-400 p-1 -mr-1 rounded transition-colors"
            aria-label={`Remove ${pick.player_name} pick`}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </li>
  );
}
