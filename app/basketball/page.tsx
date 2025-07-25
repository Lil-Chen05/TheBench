import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNavbar from "@/components/top-navbar";
import Sidebar from "@/components/sidebar";

export default async function BasketballPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNavbar />
      <Sidebar active="basketball" />
      <main className="ml-[50px] mt-[60px] flex flex-col gap-12 p-10">
        <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">Basketball Dashboard</div>
        <div className="bg-black text-white p-4 rounded border border-black">
          {/* Add basketball dashboard content here */}
          <p className="text-white">Welcome to the Basketball Dashboard!</p>
        </div>
      </main>
    </div>
  );
} 