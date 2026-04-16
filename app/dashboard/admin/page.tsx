import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSimulationDate } from "@/lib/database/simulation";
import AdvanceDayButton from "@/components/admin/AdvanceDayButton";

/**
 * /dashboard/admin — server component.
 *
 * Gates on session + profiles.is_admin. Non-admins are redirected to
 * /dashboard. Reads the current simulation date and pending parlay
 * count, then hands them to the client-side AdvanceDayButton.
 */
export default async function AdminPage() {
  const supabase = await createClient();

  // ── Auth gate ───────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  // ── Data for the UI ─────────────────────────────────────────────
  const currentDate = await getCurrentSimulationDate(supabase);

  const { count } = await supabase
    .from("parlays")
    .select("id", { count: "exact", head: true })
    .eq("simulation_date", currentDate)
    .eq("status", "pending");

  return (
    <main className="min-h-screen bg-black text-white pl-[60px] pt-[60px]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#F4D03F] mb-6">
          Admin
        </h1>

        <AdvanceDayButton
          currentDate={currentDate}
          pendingCount={count ?? 0}
        />
      </div>
    </main>
  );
}
