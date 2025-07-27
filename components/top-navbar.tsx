"use client";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { usePathname } from "next/navigation";
import ParlayCartBadge from "@/components/parlay/parlay-cart-badge";
import { useState, useEffect } from "react";
import { ChevronDown, Settings, LogOut, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function TopNavbar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
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
    <nav className="fixed top-0 left-0 w-full h-[60px] bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-between px-8 z-50 border-b border-gray-800 shadow-lg backdrop-blur-sm">
      {/* Left: Enhanced Logo */}
      <Link 
        href="/dashboard" 
        className="text-2xl font-black pixelated-text text-[#F4D03F] select-none hover:opacity-80 transition-all duration-200 hover:scale-105 drop-shadow-lg"
        style={{
          textShadow: '0 0 20px rgba(244, 208, 63, 0.3), 0 0 40px rgba(244, 208, 63, 0.1)'
        }}
      >
        THE BENCH
      </Link>

      {/* Center: Enhanced Navigation Links */}
      <div className="flex-1 flex justify-center gap-2">
        <Link 
          href="/dashboard" 
          className={cn(
            "font-bold text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#F4D03F] hover:text-black hover:scale-105",
            pathname === "/dashboard" 
              ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/20" 
              : "hover:shadow-lg hover:shadow-[#F4D03F]/10"
          )}
        >
          Home
        </Link>
        <Link 
          href="/news" 
          className={cn(
            "font-bold text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#F4D03F] hover:text-black hover:scale-105",
            pathname === "/news" 
              ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/20" 
              : "hover:shadow-lg hover:shadow-[#F4D03F]/10"
          )}
        >
          News
        </Link>
        <Link 
          href="/contact" 
          className={cn(
            "font-bold text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#F4D03F] hover:text-black hover:scale-105",
            pathname === "/contact" 
              ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/20" 
              : "hover:shadow-lg hover:shadow-[#F4D03F]/10"
          )}
        >
          Contact
        </Link>
      </div>

      {/* Right: Cart and Enhanced User Section */}
      <div className="flex items-center gap-4">
        <ParlayCartBadge />
        
        {/* Enhanced User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 border border-gray-700 hover:border-[#F4D03F]/50"
          >
            {loading ? (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-[#F4D03F] rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">
                  {getUserInitials()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-200">
              {loading ? "Loading..." : getUserDisplayName()}
            </span>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-gray-400 transition-transform duration-200",
                showUserMenu && "rotate-180"
              )} 
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && !loading && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
              <div className="p-4 border-b border-gray-700">
                <p className="text-sm text-gray-400">Signed in as</p>
                <p className="text-white font-medium truncate">
                  {user?.email || "No email available"}
                </p>
                {user?.user_metadata?.full_name && (
                  <p className="text-gray-300 text-sm truncate">
                    {user.user_metadata.full_name}
                  </p>
                )}
              </div>
              
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-md transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Confirmation Modal */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-white mb-2">Sign Out</h3>
              <p className="text-gray-300 mb-4">Are you sure you want to sign out?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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