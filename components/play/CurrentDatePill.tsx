"use client";

interface CurrentDatePillProps {
  /** ISO YYYY-MM-DD simulation date. */
  date: string;
  loading?: boolean;
}

/**
 * Non-interactive pill showing the current simulation date. Styled to
 * match the "selected" state of the old DateStrip capsule — yellow fill,
 * weekday stacked above month+day — but without click/scroll behaviour.
 */
export default function CurrentDatePill({
  date,
  loading = false,
}: CurrentDatePillProps) {
  if (loading) {
    return (
      <div className="h-[58px] w-[76px] rounded-lg bg-gray-900 border border-gray-800 animate-pulse" />
    );
  }

  const { weekday, monthDay } = formatDateParts(date);

  return (
    <div
      className="inline-flex flex-col items-center justify-center min-w-[76px] px-4 py-2 rounded-lg border text-sm bg-[#F4D03F] text-black border-[#F4D03F] shadow-[0_4px_0_0_rgba(244,208,63,0.25)]"
      aria-label={`Current game date: ${weekday} ${monthDay}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 text-black/70">
        {weekday}
      </span>
      <span className="font-bold leading-none">{monthDay}</span>
    </div>
  );
}

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
