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
    <div className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-[50px] bg-black border-r border-gray-800 shadow-lg z-40">
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
                      ? "bg-[#F4D03F] text-black shadow-lg shadow-[#F4D03F]/30 scale-105" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105 hover:shadow-lg hover:shadow-gray-800/20"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-[#F4D03F] rounded-r-full shadow-sm" />
                  )}
                  
                  {/* Icon with enhanced styling */}
                  <span className={cn(
                    "text-xl transition-all duration-200",
                    isActive ? "drop-shadow-sm" : "group-hover:drop-shadow-sm"
                  )}>
                    {item.icon}
                  </span>
                </Link>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 cursor-not-allowed transition-all duration-200 opacity-50">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                </div>
              )}
              
              {/* Enhanced Tooltip for all items */}
              <div className={cn(
                "absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 border border-gray-700 shadow-xl",
                "transform -translate-x-2 group-hover:translate-x-0"
              )}>
                <div className="font-medium">
                  {item.available ? item.label : `${item.label}`}
                </div>
                {!item.available && (
                  <div className="text-yellow-400 text-xs mt-1 font-semibold">
                    Coming Soon
                  </div>
                )}
                {/* Tooltip arrow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none" />
    </div>
  );
} 