"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarProps {
  active?: string;
}

export default function Sidebar({ active = "dashboard" }: SidebarProps) {
  const sportsItems = [
    {
      id: "basketball",
      icon: "🏀",
      label: "Basketball",
      href: "/basketball",
      available: true,
    },
    {
      id: "football",
      icon: "🏈",
      label: "Football",
      href: "#",
      available: false,
    },
    {
      id: "hockey",
      icon: "🏒",
      label: "Hockey",
      href: "#",
      available: false,
    },
    {
      id: "soccer",
      icon: "⚽",
      label: "Soccer",
      href: "#",
      available: false,
    },
  ];

  return (
    <div className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-[50px] bg-black border-r border-gray-800 z-40">
      <div className="flex flex-col items-center py-6 space-y-6">
        {sportsItems.map((item) => {
          const isActive = active === item.id;
          
          return (
            <div key={item.id} className="relative group">
              {item.available ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ease-in-out relative overflow-hidden",
                    isActive
                      ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-[#F4D03F] rounded-r-full" />
                  )}
                  
                  {/* Icon */}
                  <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                </Link>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 cursor-not-allowed transition-all duration-200">
                    <span className="text-xl opacity-50">{item.icon}</span>
                  </div>
                </div>
              )}
              
              {/* Tooltip for all items */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-gray-700 shadow-lg">
                {item.available ? item.label : `${item.label} - Coming Soon`}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
    </div>
  );
} 