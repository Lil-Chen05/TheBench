"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  active?: string;
}

export default function Sidebar({ active = "dashboard" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Changed from false to true

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
    <div 
      className={cn(
        "fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-gradient-to-b from-black via-gray-900 to-black border-r-2 border-yellow-400/30 shadow-2xl z-40 transition-all duration-300 ease-in-out group",
        isCollapsed ? "w-[60px]" : "w-[200px]"
      )}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full flex items-center justify-center font-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-black"
      >
        <span className={cn("text-sm transition-transform duration-300", isCollapsed ? "rotate-180" : "")}>
          ›
        </span>
      </button>

      {/* Athletic Header */}
      {!isCollapsed && (
        <div className="px-4 py-6 border-b border-yellow-400/20">
          <h2 className="text-yellow-400 font-black uppercase tracking-widest text-sm pixelated-text">
            Choose Your Sport
          </h2>
          <div className="w-8 h-1 bg-yellow-400 mt-2 rounded-full"></div>
        </div>
      )}

      {/* Sports Navigation */}
      <div className="flex flex-col py-6 space-y-3 px-3">
        {sportsItems.map((item) => {
          const isActive = active === item.id;
          
          return (
            <div key={item.id} className="relative group/item">
              {item.available ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg transition-all duration-300 ease-in-out relative overflow-hidden font-bold uppercase tracking-wide",
                    isCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-xl shadow-yellow-400/30 scale-105 border-2 border-yellow-500" 
                      : "text-yellow-400 hover:text-black hover:bg-gradient-to-r hover:from-yellow-400/90 hover:to-yellow-300/90 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-yellow-400"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-black rounded-r-full" />
                  )}
                  
                  {/* Icon */}
                  <span className={cn(
                    "text-2xl transition-all duration-300",
                    isActive ? "drop-shadow-sm animate-pulse" : "group-hover/item:scale-110"
                  )}>
                    {item.icon}
                  </span>
                  
                  {/* Label */}
                  {!isCollapsed && (
                    <span className={cn(
                      "ml-4 font-black text-sm transition-all duration-300",
                      isActive ? "text-black" : ""
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Championship Badge for Active */}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              ) : (
                <div className={cn(
                  "flex items-center rounded-lg cursor-not-allowed transition-all duration-300 relative overflow-hidden opacity-60",
                  isCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3",
                  "text-gray-500 bg-gray-800/50 border-2 border-gray-600/30"
                )}>
                  <span className="text-2xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-4 font-bold text-sm uppercase tracking-wide">
                      {item.label}
                    </span>
                  )}
                </div>
              )}
              
              {/* Enhanced Tooltip for collapsed state */}
              {isCollapsed && (
                <div className={cn(
                  "absolute left-16 top-1/2 -translate-y-1/2 bg-black border-2 border-yellow-400 text-yellow-400 text-sm px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-2xl",
                  "transform translate-x-2 group-hover/item:translate-x-0 font-black uppercase tracking-wide"
                )}>
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {!item.available && (
                      <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black">
                        SOON
                      </span>
                    )}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-3 h-3 bg-black border-l-2 border-t-2 border-yellow-400 transform rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Athletic footer accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5 pointer-events-none"></div>
    </div>
  );
}