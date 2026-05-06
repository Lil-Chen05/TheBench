import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserParlays } from "@/lib/database/parlays";
import ParlayHistoryList from "@/components/history/ParlayHistoryList";

/**
 * /dashboard/history — user-facing parlay history page.
 *
 * Server component. Fetches parlays directly via the database helper
 * (no API round-trip) ordered by simulation_date DESC, placed_at DESC.
 */
export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const parlays = await getUserParlays(user.id);

  return (
    <main className="min-h-screen bg-black text-white pl-[60px] pt-[60px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-[#F4D03F]">
            History
          </h1>
          <p className="text-gray-500 text-xs mt-1.5">
            Every parlay you&rsquo;ve placed, newest first.
          </p>
        </header>

        <ParlayHistoryList parlays={parlays} />

        {/* TODO: account statistics */}
      </div>
    </main>
  );
}
