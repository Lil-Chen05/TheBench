"use client";

import { useEffect, useMemo, useState } from "react";
import CurrentDatePill from "@/components/play/CurrentDatePill";
import GameListForDate from "@/components/play/GameListForDate";
import PropList from "@/components/play/PropList";
import type {
  GameWithProps,
  PropDatesResponse,
  PropsGamesResponse,
} from "@/types/props";

/**
 * The parlay builder hub. Two-step flow:
 *   1. Pick a game on the current simulation date (GameListForDate)
 *   2. Click Over/Under on any prop to add to the cart (PropList)
 *
 * The simulation date is fixed globally — users cannot browse other
 * dates. The CurrentDatePill shows which date is active.
 *
 * The parlay cart is rendered by `app/dashboard/layout.tsx`. On desktop
 * (≥ lg) the cart is a fixed right rail — we reserve `lg:pr-[420px]
 * xl:pr-[480px]` on the main column so the content never sits under it.
 * On mobile the cart is a bottom sheet triggered from the top navbar.
 */
export default function PlayPage() {
  const [simDate, setSimDate] = useState<string | null>(null);
  const [loadingDate, setLoadingDate] = useState(true);
  const [dateError, setDateError] = useState<string | null>(null);

  const [games, setGames] = useState<GameWithProps[] | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Fetch the current simulation date once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/props/dates");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const body: PropDatesResponse = await res.json();
        if (cancelled) return;
        if (body.dates.length > 0) setSimDate(body.dates[0]);
      } catch (e) {
        if (!cancelled) {
          setDateError(
            e instanceof Error ? e.message : "Failed to load simulation date",
          );
        }
      } finally {
        if (!cancelled) setLoadingDate(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch games whenever the simulation date is known.
  useEffect(() => {
    if (!simDate) {
      setGames(null);
      setSelectedGameId(null);
      return;
    }

    let cancelled = false;
    setLoadingGames(true);
    setGamesError(null);
    setGames(null);
    setSelectedGameId(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/props/games?date=${encodeURIComponent(simDate)}`,
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const body: PropsGamesResponse = await res.json();
        if (cancelled) return;
        setGames(body.games);
      } catch (e) {
        if (!cancelled) {
          setGamesError(e instanceof Error ? e.message : "Failed to load games");
        }
      } finally {
        if (!cancelled) setLoadingGames(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [simDate]);

  const handleSelectGame = (game: GameWithProps) => {
    setSelectedGameId((curr) => (curr === game.id ? null : game.id));
  };

  const selectedGame = useMemo(
    () => games?.find((g) => g.id === selectedGameId) ?? null,
    [games, selectedGameId],
  );

  const totalProps = useMemo(
    () => (games ?? []).reduce((sum, g) => sum + g.prop_count, 0),
    [games],
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div
        className={[
          "pl-[60px] pt-[60px]",
          "lg:pr-[420px] xl:pr-[480px]",
        ].join(" ")}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          {/* Sticky header: title + current date pill */}
          <div className="sticky top-[60px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-3 bg-black/95 backdrop-blur-sm border-b border-gray-900">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F4D03F] leading-none tracking-tight">
                  Build a Parlay
                </h1>
                <p className="text-gray-500 text-xs mt-1.5">
                  Choose a game, tap Over or Under on 2&ndash;5 props.
                </p>
              </div>
              {games && games.length > 0 && (
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <span className="text-white font-black text-xl leading-none tabular-nums">
                    {totalProps}
                  </span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    props today
                  </span>
                </div>
              )}
            </div>

            {dateError ? (
              <div className="text-red-400 text-sm">
                Couldn&rsquo;t load game date: {dateError}
              </div>
            ) : (
              <CurrentDatePill
                date={simDate ?? ""}
                loading={loadingDate}
              />
            )}
          </div>

          {/* Games for current simulation date */}
          {simDate && (
            <section className="mt-6">
              <SectionHeading
                index="01"
                title="Games"
                subtitle={
                  selectedGame
                    ? `${selectedGame.away_team.abbr} @ ${selectedGame.home_team.abbr} selected`
                    : "Pick a game to see its props"
                }
              />
              {gamesError ? (
                <div className="text-red-400 text-sm">
                  Couldn&rsquo;t load games: {gamesError}
                </div>
              ) : (
                <GameListForDate
                  games={games ?? []}
                  selectedGameId={selectedGameId}
                  onSelect={handleSelectGame}
                  loading={loadingGames}
                />
              )}
            </section>
          )}

          {/* Props for selected game */}
          {simDate && selectedGameId !== null && (
            <section className="mt-8">
              <SectionHeading
                index="02"
                title="Props"
                subtitle="Tap Over or Under to add to your parlay"
              />
              <PropList
                gameId={selectedGameId}
                simulationDate={simDate}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function SectionHeading({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#F4D03F] text-black text-xs font-black tabular-nums">
        {index}
      </span>
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="text-white text-base font-bold uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <span className="text-gray-500 text-xs truncate">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
