"use client";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { usePathname } from "next/navigation";
import ParlayCartBadge from "@/components/parlay/parlay-cart-badge";

export default function TopNavbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 w-full h-[60px] bg-black text-white flex items-center justify-between px-8 z-50 border-b border-black shadow">
      {/* Left: Logo */}
      <Link href="/dashboard" className="text-2xl font-black pixelated-text text-[#F4D03F] select-none hover:opacity-80 transition">
        THE BENCH
      </Link>
      {/* Center: Nav links */}
      <div className="flex-1 flex justify-center gap-8">
        <Link href="/dashboard" className={`font-bold text-white px-3 py-1 rounded hover:bg-[#F4D03F] hover:text-black transition ${pathname === "/dashboard" ? "bg-[#F4D03F] text-black" : ""}`}>Home</Link>
        <Link href="/news" className={`font-bold text-white px-3 py-1 rounded hover:bg-[#F4D03F] hover:text-black transition ${pathname === "/news" ? "bg-[#F4D03F] text-black" : ""}`}>News</Link>
        <Link href="/contact" className={`font-bold text-white px-3 py-1 rounded hover:bg-[#F4D03F] hover:text-black transition ${pathname === "/contact" ? "bg-[#F4D03F] text-black" : ""}`}>Contact</Link>
      </div>
      {/* Right: Cart and Auth/User */}
      <div className="flex items-center gap-4">
        <ParlayCartBadge />
        <AuthButton />
      </div>
    </nav>
  );
} 