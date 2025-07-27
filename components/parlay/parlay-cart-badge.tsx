"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useParlayCart } from "./parlay-context";

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
      className="relative text-white hover:bg-gray-700"
    >
      <ShoppingCart size={20} />
      <Badge 
        className="absolute -top-2 -right-2 bg-[#F4D03F] text-black text-xs font-bold min-w-[20px] h-5 flex items-center justify-center"
      >
        {pickCount}
      </Badge>
    </Button>
  );
} 