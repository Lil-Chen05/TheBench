import type { Parlay, ParlayPick } from "@/lib/database/parlays";
import { cn } from "@/lib/utils";

interface ParlayHistoryListProps {
  parlays: Parlay[];
}

/**
 * Renders a user's parlay history as a list of cards. Pure render —
 * no state, no interactivity — so it lives as a server component.
 *
 * Data expectations:
 *   - `parlays` comes from `getUserParlays()`, already ordered by
 *     simulation_date DESC, placed_at DESC.
 *   - Each pick's `prop` is the embedded player_props row (with
 *     player.name + team.abbr). It can be null if the underlying prop
 *     was deleted (FK is ON DELETE SET NULL); we fall back to the
 *     denormalized `player_name` / `team_name` columns on parlay_picks.
 */
export default function ParlayHistoryList({ parlays }: ParlayHistoryListProps) {
  if (parlays.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-800 px-4 py-10 text-center">
        <p className="text-white font-semibold text-sm">No parlays yet</p>
        <p className="text-gray-500 text-xs mt-1">
          Head to the Play page to build your first parlay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parlays.map((parlay) => (
        <ParlayCard key={parlay.id} parlay={parlay} />
      ))}
    </div>
  );
}

function ParlayCard({ parlay }: { parlay: Parlay }) {
  const picks = parlay.picks ?? [];
  return (
    <article className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-gray-800">
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge status={parlay.status} />
          <span className="text-gray-400 text-xs font-semibold">
            {formatSimDate(parlay.simulation_date)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs tabular-nums">
          <span className="text-gray-500">${parlay.bet_amount}</span>
          <span className="text-gray-600">→</span>
          <span className="text-[#F4D03F] font-black">
            ${parlay.potential_payout}
          </span>
        </div>
      </header>

      {/* Picks */}
      <ul className="divide-y divide-gray-800">
        {picks.map((pick) => (
          <PickRow key={pick.id} pick={pick} />
        ))}
      </ul>
    </article>
  );
}

function PickRow({ pick }: { pick: ParlayPick }) {
  const playerName =
    pick.prop?.player?.name ?? pick.player_name ?? "Unknown player";
  const teamAbbr = pick.prop?.team?.abbr ?? abbreviateTeam(pick.team_name);
  const statType = pick.prop?.stat_type ?? pick.prop_type;
  const direction = pick.pick_type.toUpperCase();
  const isOver = pick.pick_type === "over";

  return (
    <li className="px-5 py-3 flex items-center gap-4">
      {/* Player + prop */}
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-bold truncate">
          {playerName}
          {teamAbbr && (
            <span className="ml-2 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
              {teamAbbr}
            </span>
          )}
        </div>
        <div className="text-gray-500 text-[11px] mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-black text-[10px] uppercase tracking-widest",
              isOver ? "text-green-400" : "text-red-400",
            )}
          >
            <span aria-hidden>{isOver ? "↑" : "↓"}</span>
            {direction}
          </span>
          <span className="text-gray-600 tabular-nums">
            {pick.predicted_value}
          </span>
          <span className="text-gray-600 uppercase tracking-wider text-[10px]">
            {statType}
          </span>
        </div>
      </div>

      {/* Result */}
      <div className="flex items-center gap-2 shrink-0">
        {pick.actual_result != null && (
          <div className="text-right">
            <div className="text-white text-sm font-black tabular-nums leading-none">
              {pick.actual_result}
            </div>
            <div className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">
              Actual
            </div>
          </div>
        )}
        <PickResultIcon isWinner={pick.is_winner} />
      </div>
    </li>
  );
}

function PickResultIcon({ isWinner }: { isWinner: boolean | null }) {
  if (isWinner === true) {
    return (
      <span
        aria-label="Pick won"
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-400 text-xs font-black"
      >
        ✓
      </span>
    );
  }
  if (isWinner === false) {
    return (
      <span
        aria-label="Pick lost"
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/15 text-red-400 text-xs font-black"
      >
        ✕
      </span>
    );
  }
  return (
    <span
      aria-label="Pick ungraded"
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-gray-500 text-xs font-black"
    >
      –
    </span>
  );
}

function StatusBadge({ status }: { status: Parlay["status"] }) {
  const styles: Record<Parlay["status"], string> = {
    pending: "bg-gray-800 text-gray-300 border-gray-700",
    won: "bg-green-500/15 text-green-300 border-green-700/40",
    lost: "bg-red-500/15 text-red-300 border-red-700/40",
    voided: "bg-yellow-500/15 text-yellow-300 border-yellow-700/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

function formatSimDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Best-effort shorter form for legacy picks whose `team_name` was stored
 * as a full name (pre-embed fallback). If the string is already short
 * (≤4 chars), return it uppercased; otherwise take the first letter of
 * each whitespace-separated word.
 */
function abbreviateTeam(teamName: string | null | undefined): string {
  if (!teamName) return "";
  const trimmed = teamName.trim();
  if (trimmed.length <= 4) return trimmed.toUpperCase();
  return trimmed
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
