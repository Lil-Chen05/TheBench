"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ParlayCartBadge from "@/components/parlay/parlay-cart-badge";
import { useState, useEffect } from "react";
import { ChevronDown, Settings, LogOut, Loader2, Sun, Moon, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function TopNavbar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
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

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    <nav className="fixed top-0 left-0 w-full h-[60px] bg-gradient-to-r from-black via-gray-900 to-black text-white z-50 border-b border-gray-800 shadow-xl backdrop-blur-sm">
      <div className="w-full h-full px-8 flex items-center">
        {/* Logo Section - Fixed Width */}
        <div className="w-48 flex-shrink-0">
          <Link 
            href="/dashboard" 
            className="text-2xl font-black pixelated-text text-[#F4D03F] select-none hover:opacity-90 transition-all duration-200 hover:scale-105 drop-shadow-lg inline-block"
            style={{
              textShadow: '0 0 20px rgba(244, 208, 63, 0.4), 0 0 40px rgba(244, 208, 63, 0.2), 0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            THE BENCH
          </Link>
        </div>

        {/* Navigation Links - Centered and Flexible */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex gap-6">
            <Link 
              href="/dashboard" 
              className={cn(
                "font-bold text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 relative overflow-hidden",
                pathname === "/dashboard" 
                  ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/30 scale-105" 
                  : "hover:bg-gray-800/80 hover:shadow-lg hover:shadow-gray-800/20 hover:border hover:border-gray-700"
              )}
            >
              <span className="relative z-10">Home</span>
              {pathname === "/dashboard" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F] to-[#e6c200] opacity-90"></div>
              )}
            </Link>
            <Link 
              href="/news" 
              className={cn(
                "font-bold text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 relative overflow-hidden",
                pathname === "/news" 
                  ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/30 scale-105" 
                  : "hover:bg-gray-800/80 hover:shadow-lg hover:shadow-gray-800/20 hover:border hover:border-gray-700"
              )}
            >
              <span className="relative z-10">News</span>
              {pathname === "/news" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F] to-[#e6c200] opacity-90"></div>
              )}
            </Link>

            <Link 
              href="/contact" 
              className={cn(
                "font-bold text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 relative overflow-hidden",
                pathname === "/contact" 
                  ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/30 scale-105" 
                  : "hover:bg-gray-800/80 hover:shadow-lg hover:shadow-gray-800/20 hover:border hover:border-gray-700"
              )}
            >
              <span className="relative z-10">Contact</span>
              {pathname === "/contact" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F] to-[#e6c200] opacity-90"></div>
              )}
            </Link>
          </div>
        </div>

        {/* Right Section - Fixed Width */}
        <div className="w-80 flex items-center justify-end gap-4">
          <ParlayCartBadge />
          
          {/* Enhanced Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 border border-gray-600 hover:border-[#F4D03F]/50 hover:shadow-lg hover:shadow-[#F4D03F]/20 hover:scale-110 group relative overflow-hidden"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-all duration-300 group-hover:rotate-180 relative z-10" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-all duration-300 group-hover:rotate-12 relative z-10" />
            )}
          </button>
          
          {/* Enhanced User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 border border-gray-600 hover:border-[#F4D03F]/50 hover:shadow-lg hover:shadow-[#F4D03F]/20 hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {loading ? (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center relative z-10">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#F4D03F] to-[#e6c200] rounded-full flex items-center justify-center shadow-lg shadow-[#F4D03F]/30 relative z-10 group-hover:shadow-[#F4D03F]/50 transition-all duration-300">
                  <span className="text-black text-xs font-bold">
                    {getUserInitials()}
                  </span>
                </div>
              )}
              
              <div className="relative z-10">
                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                  {loading ? "Loading..." : getUserDisplayName().split('@')[0]}
                </span>
              </div>
              
              {/* Stylish Chevron with Animation */}
              <div className="relative z-10 ml-1">
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 text-gray-400 group-hover:text-[#F4D03F] transition-all duration-300",
                    showUserMenu && "rotate-180 text-[#F4D03F]"
                  )} 
                />
                {/* Glowing dot indicator */}
                <div className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 bg-[#F4D03F] rounded-full opacity-0 transition-all duration-300",
                  showUserMenu && "opacity-100 animate-pulse"
                )}></div>
              </div>
            </button>

            {/* Enhanced User Dropdown Menu */}
            {showUserMenu && !loading && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-gradient-to-br from-gray-900/95 to-black/95 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {/* Header with gradient */}
                <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F4D03F]/5 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F4D03F] to-[#e6c200] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-black text-sm font-bold">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Signed in as</p>
                        <p className="text-white font-semibold text-lg">
                          {user?.user_metadata?.full_name || "User"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm truncate bg-gray-800/50 px-3 py-1 rounded-lg">
                      {user?.email || "No email available"}
                    </p>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="p-2">
                  <Link 
                    href="/account" 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white rounded-lg transition-all duration-200 hover:scale-[1.02] group"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="p-1.5 bg-gray-700/50 rounded-lg group-hover:bg-[#F4D03F]/20 transition-colors duration-200">
                      <Settings className="w-4 h-4 group-hover:text-[#F4D03F] transition-colors duration-200" />
                    </div>
                    <span className="font-medium">Account Settings</span>
                    <ChevronDown className="w-4 h-4 ml-auto rotate-[-90deg] opacity-50 group-hover:opacity-100 transition-all duration-200" />
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20 hover:text-red-300 rounded-lg transition-all duration-200 hover:scale-[1.02] mt-1 group"
                  >
                    <div className="p-1.5 bg-red-900/30 rounded-lg group-hover:bg-red-900/50 transition-colors duration-200">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                    <ChevronDown className="w-4 h-4 ml-auto rotate-[-90deg] opacity-50 group-hover:opacity-100 transition-all duration-200" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-gray-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl backdrop-blur-md animate-in zoom-in-90 duration-200">
            <h3 className="text-lg font-semibold text-white mb-3">Sign Out</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-all duration-200 hover:bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}