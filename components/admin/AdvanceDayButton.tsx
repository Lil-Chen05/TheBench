"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdvanceResult {
  success: boolean;
  from_date: string;
  to_date: string | null;
  graded: number;
  won: number;
  lost: number;
  voided: number;
  errored: number;
  error?: string;
}

interface AdvanceDayButtonProps {
  currentDate: string;
  pendingCount: number;
}

export default function AdvanceDayButton({
  currentDate,
  pendingCount,
}: AdvanceDayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdvance = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/advance-day", { method: "POST" });
      const body: AdvanceResult = await res.json();

      if (!res.ok) {
        setError(body.error ?? `HTTP ${res.status}`);
        return;
      }

      setResult(body);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              Current Simulation Date
            </div>
            <div className="text-white font-black text-xl tabular-nums">
              {currentDate}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              Pending Parlays
            </div>
            <div className="text-[#F4D03F] font-black text-xl tabular-nums">
              {pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Advance button */}
      <button
        type="button"
        onClick={handleAdvance}
        disabled={loading}
        className="w-full rounded-lg bg-[#F4D03F] text-black font-black uppercase tracking-widest text-sm py-3 px-4 transition-colors hover:bg-[#F4D03F]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Grading & Advancing..." : "Advance Day"}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-black text-sm">Done</span>
            <span className="text-gray-500 text-xs">
              {result.from_date}
              {result.to_date
                ? ` → ${result.to_date}`
                : " (no future dates — end of season)"}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            <StatBlock label="Graded" value={result.graded} />
            <StatBlock label="Won" value={result.won} color="text-green-400" />
            <StatBlock label="Lost" value={result.lost} color="text-red-400" />
            <StatBlock
              label="Voided"
              value={result.voided}
              color="text-yellow-400"
            />
            <StatBlock
              label="Errors"
              value={result.errored}
              color={result.errored > 0 ? "text-red-400" : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div>
      <div
        className={`font-black text-lg tabular-nums leading-none ${color ?? "text-white"}`}
      >
        {value}
      </div>
      <div className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}
