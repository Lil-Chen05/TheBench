"use client";

import WelcomeHeader from "@/components/account/welcome-header";
import AccountInformation from "@/components/account/account-information";
import AccountSettings from "@/components/account/account-settings";
import BalancePanel from "@/components/account/balance-panel";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function AccountPage() {
  const { user, profile, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pl-[60px] pt-[60px]">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white pl-[60px] pt-[60px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-8 space-y-6">
        <WelcomeHeader user={user} profile={profile} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AccountInformation user={user} profile={profile} />
            <AccountSettings profile={profile} />
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <BalancePanel
              profile={profile}
              userId={user.id}
              isAdmin={profile.is_admin}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
