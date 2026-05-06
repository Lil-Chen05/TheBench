"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Trophy, History, User as UserIcon, Shield, type LucideIcon } from "lucide-react";

interface SidebarProps {
  /** Optional override — when set, this id takes precedence over pathname-based detection. */
  active?: string;
}

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
  /** When true, only highlight on an exact pathname match. */
  exact?: boolean;
}

export default function Sidebar({ active }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (data?.is_admin) setIsAdmin(true);
    })();
  }, []);

  const navItems: NavItem[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", exact: true },
    { id: "play", icon: Trophy, label: "Play", href: "/dashboard/play" },
    { id: "history", icon: History, label: "History", href: "/dashboard/history" },
    { id: "account", icon: UserIcon, label: "Account", href: "/dashboard/account" },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", icon: Shield, label: "Admin", href: "/dashboard/admin" });
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-[#0a0a0a] border-r border-gray-800 z-40 transition-all duration-200 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[220px]",
      )}
    >
      {/* Collapse/Expand Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-4 w-6 h-6 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full flex items-center justify-center shadow border border-gray-700 transition-colors"
      >
        <span
          className={cn(
            "text-xs leading-none transition-transform duration-200",
            isCollapsed ? "rotate-180" : "",
          )}
        >
          ›
        </span>
      </button>

      {/* Wordmark header */}
      <div
        className={cn(
          "h-[64px] border-b border-gray-800 flex items-center",
          isCollapsed ? "justify-center" : "px-4 gap-3",
        )}
      >
        <div className="w-8 h-8 rounded-md bg-[#F4D03F] flex items-center justify-center shrink-0">
          <Image
            src="/opengraph-image.png"
            alt="The Bench"
            width={32}
            height={32}
            className="w-8 h-8 rounded-md object-cover"
          />
        </div>
        {!isCollapsed && (
          <span className="text-white font-bold text-sm tracking-tight truncate">
            The Bench
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col py-3 px-2 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active
            ? active === item.id
            : item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.id} className="relative group/item">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  isCollapsed ? "w-11 h-11 justify-center mx-auto" : "w-full px-3 py-2.5 gap-3",
                  isActive
                    ? "bg-[#F4D03F] text-black"
                    : "text-gray-400 hover:text-white hover:bg-gray-900",
                )}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
                {!isCollapsed && (
                  <span className="text-sm font-semibold truncate">{item.label}</span>
                )}
              </Link>

              {/* Tooltip on collapsed state */}
              {isCollapsed && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 border border-gray-800 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg font-semibold">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
