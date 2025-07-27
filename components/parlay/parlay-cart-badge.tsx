"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useParlayCart } from "./parlay-context";
import { cn } from "@/lib/utils";

export default function ParlayCartBadge() {
  const { getPickCount, openCart } = useParlayCart();
  const pickCount = getPickCount();

  if (pickCount === 0) {
    return null; // Don't show badge if no picks
  }

  return (
    <Button
      onClick={openCart}
      variant="ghost"
      size="sm"
      className={cn(
        "relative text-white hover:bg-gray-700/60 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-gray-800/20",
        "px-3 py-2 rounded-lg border border-transparent hover:border-gray-700"
      )}
    >
      <ShoppingCart size={20} className="transition-transform duration-200 group-hover:scale-110" />
      <Badge 
        className={cn(
          "absolute -top-2 -right-2 bg-[#F4D03F] text-black text-xs font-bold min-w-[20px] h-5 flex items-center justify-center",
          "shadow-lg shadow-[#F4D03F]/30 transition-all duration-200 hover:scale-110"
        )}
      >
        {pickCount}
      </Badge>
    </Button>
  );
} 