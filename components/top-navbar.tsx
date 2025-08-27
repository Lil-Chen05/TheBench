"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ParlayCartBadge from "@/components/parlay/parlay-cart-badge";
import { useState, useEffect } from "react";
import { ChevronDown, Settings, LogOut, Loader2, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function TopNavbar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
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
    <nav className="fixed top-0 left-0 w-full h-[60px] bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-between px-8 z-50 border-b border-gray-800 shadow-xl backdrop-blur-sm">
      {/* Enhanced Logo */}
      <Link 
        href="/dashboard" 
        className="text-2xl font-black pixelated-text text-[#F4D03F] select-none hover:opacity-90 transition-all duration-200 hover:scale-105 drop-shadow-lg"
        style={{
          textShadow: '0 0 20px rgba(244, 208, 63, 0.4), 0 0 40px rgba(244, 208, 63, 0.2), 0 4px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        THE BENCH
      </Link>

      {/* Enhanced Navigation Links */}
      <div className="flex-1 flex justify-center gap-3">
        <Link 
          href="/dashboard" 
          className={cn(
            "font-bold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 relative overflow-hidden",
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
            "font-bold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 relative overflow-hidden",
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
            "font-bold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 relative overflow-hidden",
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

      {/* Enhanced Cart, Theme Toggle, and User Section */}
      <div className="flex items-center gap-4">
        <ParlayCartBadge />
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-200 border border-gray-700 hover:border-[#F4D03F]/50 hover:shadow-lg hover:shadow-gray-800/20 hover:scale-105 group"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200" />
          ) : (
            <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
          )}
        </button>
        
        {/* Enhanced User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-200 border border-gray-700 hover:border-[#F4D03F]/50 hover:shadow-lg hover:shadow-gray-800/20 hover:scale-105"
          >
            {loading ? (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-[#F4D03F] rounded-full flex items-center justify-center shadow-lg shadow-[#F4D03F]/20">
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

          {/* Enhanced User Dropdown Menu */}
          {showUserMenu && !loading && (
            <div className="absolute right-0 top-full mt-3 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
              <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
                <p className="text-sm text-gray-400 mb-1">Signed in as</p>
                <p className="text-white font-semibold truncate">
                  {user?.email || "No email available"}
                </p>
                {user?.user_metadata?.full_name && (
                  <p className="text-gray-300 text-sm truncate mt-1">
                    {user.user_metadata.full_name}
                  </p>
                )}
              </div>
              
              <div className="p-2">
                <Link href="/account" className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 hover:scale-[1.02]">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Account Settings</span>
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-200 hover:scale-[1.02] mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Sign Out Confirmation Modal */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Sign Out</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to sign out?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-all duration-200 hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-lg"
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