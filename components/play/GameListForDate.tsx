"use client";

import { cn } from "@/lib/utils";
import type { GameWithProps } from "@/types/props";

interface GameListForDateProps {
  games: GameWithProps[];
  selectedGameId: number | null;
  onSelect: (game: GameWithProps) => void;
  loading?: boolean;
}

/**
 * Grid of games for the currently selected date. Each card shows the
 * matchup (away @ home) and the number of props available. Clicking a
 * card tells the parent to expand the prop list for that game.
 *
 * Responsive: single column on mobile, two columns from `lg` up.
 */
export default function GameListForDate({
  games,
  selectedGameId,
  onSelect,
  loading = false,
}: GameListForDateProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-lg bg-gray-900 border border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-800 px-4 py-6 text-center">
        <p className="text-gray-300 text-sm font-semibold">No games today</p>
        <p className="text-gray-500 text-xs mt-1">
          Try a different date to see available props.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {games.map((g) => {
        const isSelected = g.id === selectedGameId;
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g)}
            aria-pressed={isSelected ? "true" : "false"}
            className={cn(
              "relative text-left rounded-lg border transition-all",
              "bg-gray-900 hover:bg-gray-900/70",
              isSelected
                ? "border-[#F4D03F] ring-1 ring-[#F4D03F]/30"
                : "border-gray-800 hover:border-gray-700",
            )}
          >
            {/* Yellow accent rail when selected */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-3 bottom-3 w-1 rounded-r",
                isSelected ? "bg-[#F4D03F]" : "bg-transparent",
              )}
            />
            <div className="px-4 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <TeamBlock abbr={g.away_team.abbr} name={g.away_team.name} />
                <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                  @
                </span>
                <TeamBlock abbr={g.home_team.abbr} name={g.home_team.name} />
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[#F4D03F] font-black text-lg leading-none">
                  {g.prop_count}
                </span>
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  prop{g.prop_count === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TeamBlock({ abbr, name }: { abbr: string; name: string }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-white font-black text-sm leading-tight truncate">
        {abbr}
      </span>
      <span className="text-gray-500 text-[11px] leading-tight truncate max-w-[120px]">
        {name}
      </span>
    </div>
  );
}
