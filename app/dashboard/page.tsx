import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="ml-[50px] mt-[60px] flex flex-col gap-12 p-10">
        <div className="w-full">
          <div className="bg-black text-white text-sm p-3 px-5 rounded-md border border-black flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} className="text-[#F4D03F]" />
            This is a protected page that you can only see as an authenticated user
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">Your user details</div>
          <pre className="text-xs text-white bg-black p-3 rounded border border-black max-h-32 overflow-auto">
            {JSON.stringify(data.claims, null, 2)}
          </pre>
        </div>
        <div>
          <div className="bg-black text-[#F4D03F] text-2xl font-black p-4 rounded border border-black mb-2">Next steps</div>
          <div className="bg-black text-white p-4 rounded border border-black">
            <FetchDataSteps />
          </div>
        </div>
      </main>
    </div>
  );
} 