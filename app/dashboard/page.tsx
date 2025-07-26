import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Get user profile to check if they need to select favorites
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.claims.sub)
    .single();

  return <DashboardContent user={data.claims} profile={profile} />;
} 