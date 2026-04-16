"use client";

import { useEffect, useState } from "react";
import { useParlayCart } from "@/components/parlay/parlay-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type {
  PlayerPropRow,
  PropsForGameResponse,
} from "@/types/props";

interface PropListProps {
  gameId: number;
  /** YYYY-MM-DD — required so picks carry the right simulation_date. */
  simulationDate: string;
}

/**
 * Loads props for a single game and renders an Underdog-style prop card
 * per prop: player identity on top, big line number in the middle, and
 * a two-tone Over/Under pill pair at the bottom.
 *
 * All pick dispatches go through the parlay cart context so cross-date
 * validation, cart size, and direction-toggle logic live in one place.
 */
export default function PropList({ gameId, simulationDate }: PropListProps) {
  const [props, setProps] = useState<PlayerPropRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToParlayCart, getPickDirection } = useParlayCart();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setProps(null);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/props/game/${gameId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const body: PropsForGameResponse = await res.json();
        if (!cancelled) setProps(body.props);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load props");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const handlePick = (prop: PlayerPropRow, direction: "over" | "under") => {
    const result = addToParlayCart({
      player_prop_id: prop.id,
      pick_type: direction,
      line: prop.line,
      stat_type: prop.stat_type,
      player_name: prop.player_name,
      team_abbr: prop.team_abbr,
      game_id: gameId,
      simulation_date: simulationDate,
    });
    showToast(result.message, result.success ? "success" : "error");
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-red-300 text-sm">
        Couldn&rsquo;t load props: {error}
      </div>
    );
  }

  if (props === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-xl bg-gray-900 border border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (props.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-800 px-4 py-6 text-center">
        <p className="text-gray-300 text-sm font-semibold">
          No active props for this game.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {props.map((prop) => {
        const active = getPickDirection(prop.id);
        return (
          <PropCard
            key={prop.id}
            prop={prop}
            active={active}
            onPick={(dir) => handlePick(prop, dir)}
          />
        );
      })}
    </div>
  );
}

function PropCard({
  prop,
  active,
  onPick,
}: {
  prop: PlayerPropRow;
  active: "over" | "under" | null;
  onPick: (direction: "over" | "under") => void;
}) {
  const isInParlay = active !== null;
  return (
    <div
      className={cn(
        "relative rounded-xl border overflow-hidden transition-colors",
        isInParlay
          ? "bg-gray-900 border-[#F4D03F]/60"
          : "bg-gray-900 border-gray-800",
      )}
    >
      {/* Active accent rail */}
      {isInParlay && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#F4D03F]"
        />
      )}

      {/* Header: player + team */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm truncate">
            {prop.player_name}
          </div>
          <div className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
            {prop.team_abbr}
          </div>
        </div>
        {isInParlay && (
          <span className="text-[#F4D03F] text-[10px] font-black uppercase tracking-widest bg-[#F4D03F]/10 border border-[#F4D03F]/40 rounded px-1.5 py-0.5 whitespace-nowrap">
            In parlay
          </span>
        )}
      </div>

      {/* Big line */}
      <div className="px-4 pb-2 text-center">
        <div className="text-white font-black text-4xl leading-none tabular-nums">
          {prop.line}
        </div>
        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          {prop.stat_type}
        </div>
        <div className="text-gray-600 text-[10px] mt-1 tabular-nums">
          range {prop.low_pred}&ndash;{prop.high_pred}
        </div>
      </div>

      {/* Over / Under pills */}
      <div className="grid grid-cols-2 border-t border-gray-800 divide-x divide-gray-800">
        <PickPill
          direction="over"
          active={active === "over"}
          onClick={() => onPick("over")}
        />
        <PickPill
          direction="under"
          active={active === "under"}
          onClick={() => onPick("under")}
        />
      </div>
    </div>
  );
}

function PickPill({
  direction,
  active,
  onClick,
}: {
  direction: "over" | "under";
  active: boolean;
  onClick: () => void;
}) {
  const isOver = direction === "over";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ? "true" : "false"}
      className={cn(
        "relative flex items-center justify-center gap-1.5 py-3 text-sm font-black uppercase tracking-widest transition-colors",
        active
          ? isOver
            ? "bg-green-500/15 text-green-300"
            : "bg-red-500/15 text-red-300"
          : "text-gray-300 hover:bg-gray-800/60",
      )}
    >
      <span aria-hidden className="text-base">
        {isOver ? "↑" : "↓"}
      </span>
      <span>{isOver ? "Over" : "Under"}</span>
    </button>
  );
}
