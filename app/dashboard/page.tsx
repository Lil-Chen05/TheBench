import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfileOrCreate } from "@/lib/database/profiles";
import { getUserParlays } from "@/lib/database/parlays";
import { getCurrentSimulationDate } from "@/lib/database/simulation";
import DashboardContent from "@/components/dashboard-content";

/**
 * /dashboard — server-rendered home for authed users.
 *
 * Fetches the user, their profile, their three most recent parlays, and
 * the current simulation date in parallel. Non-user-specific failures
 * (e.g. simulation_state not seeded) degrade gracefully to `null` so the
 * rest of the page still renders.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profile, recentParlays, nextSimDate] = await Promise.all([
    getUserProfileOrCreate(user.id),
    getUserParlays(user.id).then((p) => p.slice(0, 3)),
    getCurrentSimulationDate(supabase).catch(() => null),
  ]);

  return (
    <DashboardContent
      user={user}
      profile={profile}
      recentParlays={recentParlays}
      nextSimDate={nextSimDate}
    />
  );
}
