"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import TeamSportSelectionModal from "@/components/modals/team-sport-selection-modal";
import { useParlayCart } from "@/components/parlay/parlay-context";
import type { Parlay } from "@/lib/database/parlays";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarDays, Mail, Clock } from "lucide-react";

interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface DashboardContentProps {
  user: User;
  profile: UserProfile | null;
  recentParlays: Parlay[];
  nextSimDate: string | null;
}

export default function DashboardContent({
  user,
  profile,
  recentParlays,
  nextSimDate,
}: DashboardContentProps) {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(profile);
  const [showModal, setShowModal] = useState(false);
  const { isDashboardShrunk } = useParlayCart();
  const supabase = createClient();

  const needsFavorites =
    currentProfile &&
    (!currentProfile.favorite_teams || currentProfile.favorite_teams.length === 0);

  useEffect(() => {
    if (needsFavorites) {
      setShowModal(true);
    }
  }, [needsFavorites]);

  const handleProfileUpdate = async () => {
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentProfile(profileData);
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <main
      className={cn(
        "min-h-screen bg-black text-white pl-[60px] pt-[60px] transition-all duration-300 ease-in-out",
        isDashboardShrunk ? "lg:pr-[400px] xl:pr-[460px]" : "pr-0",
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome + balance hero */}
        <WelcomeBalance
          firstName={firstName}
          balance={currentProfile?.balance ?? 0}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming simulation date */}
          <UpcomingSimDate date={nextSimDate} />

          {/* Account info */}
          <AccountInfo user={user} profile={currentProfile} />
        </div>

        {/* Recent parlays */}
        <RecentParlays parlays={recentParlays} />
      </div>

      {showModal && (
        <TeamSportSelectionModal
          isOpen={showModal}
          onClose={handleCloseModal}
          userProfile={currentProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function WelcomeBalance({
  firstName,
  balance,
}: {
  firstName: string;
  balance: number;
}) {
  return (
    <section className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="min-w-0">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
          Welcome back
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 truncate tracking-tight">
          {firstName}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Balance
        </p>
        <p className="text-[#F4D03F] text-3xl sm:text-4xl font-black tabular-nums leading-none mt-1">
          ${balance.toLocaleString()}
        </p>
      </div>

      <Link
        href="/dashboard/play"
        className="inline-flex items-center gap-2 self-start sm:self-auto bg-[#F4D03F] text-black font-bold px-5 py-2.5 rounded-md hover:bg-[#e6c200] transition-colors"
      >
        Place a Parlay
        <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}

function UpcomingSimDate({ date }: { date: string | null }) {
  return (
    <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-widest">
        <CalendarDays className="w-3.5 h-3.5" />
        Next simulation date
      </div>
      <p className="text-white text-xl font-bold mt-2 tracking-tight">
        {date ? formatSimDate(date) : "No upcoming games"}
      </p>
      {date && (
        <Link
          href="/dashboard/play"
          className="inline-flex items-center gap-1 text-[#F4D03F] text-sm font-semibold mt-3 hover:text-[#e6c200] transition-colors"
        >
          Go to play
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </section>
  );
}

function AccountInfo({
  user,
  profile,
}: {
  user: User;
  profile: UserProfile | null;
}) {
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "—";
  const teamCount = profile?.favorite_teams?.length ?? 0;

  return (
    <section className="rounded-xl bg-gray-900 border border-gray-800 p-5">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-widest">
        <Mail className="w-3.5 h-3.5" />
        Account
      </div>
      <p className="text-white text-sm font-semibold truncate mt-2">
        {user.email ?? "—"}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">
            Member since
          </dt>
          <dd className="text-gray-200 font-semibold mt-0.5">{memberSince}</dd>
        </div>
        <div>
          <dt className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">
            Favorite teams
          </dt>
          <dd className="text-gray-200 font-semibold mt-0.5 tabular-nums">
            {teamCount}
          </dd>
        </div>
      </dl>
      <Link
        href="/dashboard/account"
        className="inline-flex items-center gap-1 text-[#F4D03F] text-sm font-semibold mt-4 hover:text-[#e6c200] transition-colors"
      >
        Manage account
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </section>
  );
}

function RecentParlays({ parlays }: { parlays: Parlay[] }) {
  return (
    <section className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-widest">
          <Clock className="w-3.5 h-3.5" />
          Recent parlays
        </div>
        <Link
          href="/dashboard/history"
          className="text-[#F4D03F] text-xs font-semibold hover:text-[#e6c200] transition-colors inline-flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </header>

      {parlays.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-white text-sm font-semibold">No parlays yet</p>
          <p className="text-gray-500 text-xs mt-1">
            Head to Play to build your first parlay.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {parlays.map((parlay) => (
            <ParlaySummaryRow key={parlay.id} parlay={parlay} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ParlaySummaryRow({ parlay }: { parlay: Parlay }) {
  const pickCount = parlay.picks?.length ?? 0;
  return (
    <li className="px-5 py-3 flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <StatusPill status={parlay.status} />
          <span className="text-gray-400 text-xs font-semibold">
            {formatSimDate(parlay.simulation_date)}
          </span>
        </div>
        <p className="text-gray-500 text-[11px] mt-1">
          {pickCount} {pickCount === 1 ? "pick" : "picks"}
        </p>
      </div>
      <div className="text-right tabular-nums shrink-0">
        <div className="text-xs text-gray-500">
          ${parlay.bet_amount}{" "}
          <span className="text-gray-600">→</span>{" "}
          <span className="text-[#F4D03F] font-bold">
            ${parlay.potential_payout}
          </span>
        </div>
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: Parlay["status"] }) {
  const styles: Record<Parlay["status"], string> = {
    pending: "bg-gray-800 text-gray-300 border-gray-700",
    won: "bg-green-500/15 text-green-300 border-green-700/40",
    lost: "bg-red-500/15 text-red-300 border-red-700/40",
    voided: "bg-yellow-500/15 text-yellow-300 border-yellow-700/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest border",
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
