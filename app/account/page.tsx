import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/database/profiles";
import WelcomeHeader from "@/components/account/welcome-header";
import AccountInformation from "@/components/account/account-information";
import AccountSettings from "@/components/account/account-settings";
import BalancePanel from "@/components/account/balance-panel";
import TopNavbar from "@/components/top-navbar";
import Sidebar from "@/components/sidebar";
import { ParlayCartProvider } from "@/components/parlay/parlay-context";
import { ToastProvider } from "@/components/ui/toast";
import ParlayCart from "@/components/parlay/parlay-cart";

export default async function AccountPage() {
  const supabase = await createClient();
  
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      redirect('/auth/login');
    }

    // Fetch user profile data
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      // If no profile exists, redirect to dashboard to trigger profile creation
      redirect('/dashboard');
    }

    return (
      <ToastProvider>
        <ParlayCartProvider>
          <div className="flex h-screen bg-black text-white">
            {/* Left Sidebar Navigation */}
            <Sidebar active="dashboard" />
            
            <div className="flex-1 flex flex-col">
              {/* Top Navigation Bar */}
              <TopNavbar />
              
              {/* Main Content Area */}
              <main className="flex-1 overflow-auto ml-[50px] mt-[60px]">
                <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
                  {/* Full-width welcome section */}
                  <WelcomeHeader user={user} />
                  
                  {/* Split layout container */}
                  <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    {/* Left/Main content area (70% on desktop, full width on mobile) */}
                    <div className="flex-1 space-y-6">
                      <AccountInformation user={user} profile={profile} />
                      <AccountSettings profile={profile} />
                      {/* Placeholder for future sections */}
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-yellow-400 mb-4">Coming Soon</h3>
                        <p className="text-gray-400">Statistics dashboard and betting history will be added here.</p>
                      </div>
                    </div>
                    
                    {/* Right sticky balance panel (30% on desktop, bottom sticky on mobile) */}
                    <div className="lg:w-80 lg:sticky lg:top-8 lg:self-start">
                      <BalancePanel profile={profile} userId={user.id} />
                    </div>
                  </div>
                </div>
              </main>
            </div>
            
            {/* Parlay Cart */}
            <ParlayCart />
          </div>
        </ParlayCartProvider>
      </ToastProvider>
    );
  } catch (error) {
    console.error('Error loading account page:', error);
    redirect('/dashboard');
  }
} 