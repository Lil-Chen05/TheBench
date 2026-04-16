"use client";

import { cn } from "@/lib/utils";

interface DateStripProps {
  dates: string[];
  selected: string | null;
  onSelect: (date: string) => void;
  loading?: boolean;
}

/**
 * Horizontal scrollable strip of game dates. Dates are ISO YYYY-MM-DD
 * strings from GET /api/props/dates (already sorted ascending).
 *
 * The strip is designed to be placed inside a `sticky` wrapper on the
 * parlay-builder page so the date picker stays visible while the user
 * scrolls through games and props.
 */
export default function DateStrip({
  dates,
  selected,
  onSelect,
  loading = false,
}: DateStripProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-[58px] w-[76px] rounded-lg bg-gray-900 border border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (dates.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-3">
        No games with props available yet.
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
      aria-label="Game date"
    >
      {dates.map((date) => {
        const isActive = date === selected;
        const { weekday, monthDay } = formatDateParts(date);
        return (
          <button
            key={date}
            type="button"
            aria-pressed={isActive ? "true" : "false"}
            onClick={() => onSelect(date)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center",
              "min-w-[76px] px-4 py-2 rounded-lg border text-sm transition-colors",
              isActive
                ? "bg-[#F4D03F] text-black border-[#F4D03F] shadow-[0_4px_0_0_rgba(244,208,63,0.25)]"
                : "bg-gray-900 text-gray-200 border-gray-800 hover:border-[#F4D03F]/50 hover:bg-gray-900/80",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest leading-none mb-1",
                isActive ? "text-black/70" : "text-gray-500",
              )}
            >
              {weekday}
            </span>
            <span className="font-bold leading-none">{monthDay}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Split "2024-10-25" into weekday ("Fri") and month+day ("Oct 25") parts.
 * Uses UTC parsing so the label matches the DB's game_date regardless of
 * the viewer's timezone.
 */
function formatDateParts(iso: string): { weekday: string; monthDay: string } {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = dt.toLocaleDateString(undefined, {
    weekday: "short",
    timeZone: "UTC",
  });
  const monthDay = dt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return { weekday, monthDay };
}
