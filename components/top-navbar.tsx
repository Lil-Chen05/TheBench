"use client";
import Link from "next/link";
import ParlayCartBadge from "@/components/parlay/parlay-cart-badge";
import { useState, useEffect } from "react";
import { ChevronDown, Settings, LogOut, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function TopNavbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single();
        if (data) setBalance(data.balance ?? 0);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    setShowSignOutConfirm(false);
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.email || user.user_metadata?.full_name || "User";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.user_metadata?.full_name || user.email || "User";
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-[60px] bg-[#0a0a0a] text-white flex items-center justify-between pl-[76px] pr-4 sm:pr-6 z-50 border-b border-gray-800">
      {/* Wordmark — aligned with content column (60px sidebar + 16px gutter) */}
      <Link
        href="/dashboard"
        className="text-[#F4D03F] font-bold text-lg sm:text-xl tracking-tight hover:text-[#e6c200] transition-colors select-none"
      >
        The Bench
      </Link>

      {/* Right cluster: balance chip + cart badge (mobile) + user dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Balance chip */}
        {!loading && balance !== null && (
          <Link
            href="/dashboard/account"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 hover:border-[#F4D03F]/50 transition-colors"
            aria-label="Account balance"
          >
            <Wallet className="w-3.5 h-3.5 text-[#F4D03F]" />
            <span className="text-[#F4D03F] text-sm font-bold tabular-nums">
              ${balance.toLocaleString()}
            </span>
          </Link>
        )}

        <ParlayCartBadge />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 sm:gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-md bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800"
            aria-label="User menu"
          >
            {loading ? (
              <div className="w-7 h-7 bg-gray-800 rounded-md flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
              </div>
            ) : (
              <div className="w-7 h-7 bg-[#F4D03F] rounded-md flex items-center justify-center">
                <span className="text-black text-xs font-bold">
                  {getUserInitials()}
                </span>
              </div>
            )}
            <span className="hidden sm:inline text-sm font-medium text-gray-300 max-w-[160px] truncate">
              {loading ? "…" : getUserDisplayName()}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                showUserMenu && "rotate-180",
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && !loading && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-0.5">Signed in as</p>
                <p className="text-white font-semibold text-sm truncate">
                  {user?.email || "No email available"}
                </p>
                {user?.user_metadata?.full_name && (
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {user.user_metadata.full_name}
                  </p>
                )}
              </div>

              <div className="p-1.5">
                <Link
                  href="/dashboard/account"
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Account Settings</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-md transition-colors mt-0.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Confirmation Modal */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-2">Sign Out</h3>
              <p className="text-gray-400 text-sm mb-6">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
