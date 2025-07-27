import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/dashboard-content";
import { getUserProfile } from "@/lib/database/profiles";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

  const profile = await getUserProfile(user.id);
  
  return <DashboardContent user={user} profile={profile} />;
} 