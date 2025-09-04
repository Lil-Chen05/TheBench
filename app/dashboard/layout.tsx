"use client";

import { usePathname } from "next/navigation";
import ModernNavbar from "@/components/modern-navbar";
import { ParlayCartProvider } from "@/components/parlay/parlay-context";
import { ToastProvider } from "@/components/ui/toast";
import ParlayCart from "@/components/parlay/parlay-cart";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that should not have any navbar
  const noNavbarPages = [
    '/dashboard/basketball',
    '/dashboard/basketball/games',
    '/dashboard/basketball/players'
  ];
  
  const shouldShowNavbar = !noNavbarPages.some(page => pathname.startsWith(page));

  return (
    <ToastProvider>
      <ParlayCartProvider>
        <div>
          {shouldShowNavbar && <ModernNavbar />}
          {children}
          <ParlayCart />
        </div>
      </ParlayCartProvider>
    </ToastProvider>
  );
} 