"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/database/profiles";
import { Wallet, Plus } from "lucide-react";
import AddCreditsModal from "./add-credits-modal";

interface BalancePanelProps {
  profile: UserProfile;
  userId: string;
  isAdmin: boolean;
}

export default function BalancePanel({ profile, userId, isAdmin }: BalancePanelProps) {
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(profile.balance);

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currentBalance);

  const openModal = () => setShowAddCreditsModal(true);
  const closeModal = () => setShowAddCreditsModal(false);
  const handleBalanceUpdate = (newBalance: number) => setCurrentBalance(newBalance);

  return (
    <>
      {/* Desktop/Tablet Balance Panel */}
      <section className="hidden md:block rounded-xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-widest">
          <Wallet className="w-3.5 h-3.5" />
          Account Balance
        </div>
        <p className="text-[#F4D03F] text-4xl font-black tabular-nums leading-none mt-3">
          {formattedBalance}
        </p>
        <p className="text-gray-500 text-xs mt-2">Available credits</p>

        {isAdmin && (
          <Button
            onClick={openModal}
            className="mt-5 w-full bg-[#F4D03F] text-black font-semibold hover:bg-[#e6c200] transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Credits
          </Button>
        )}
      </section>

      {/* Mobile Bottom Sticky Balance Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Balance
            </p>
            <p className="text-[#F4D03F] text-xl font-bold tabular-nums">
              {formattedBalance}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={openModal}
              className="bg-[#F4D03F] text-black font-semibold hover:bg-[#e6c200] transition-colors"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Credits
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <AddCreditsModal
          isOpen={showAddCreditsModal}
          onClose={closeModal}
          currentBalance={currentBalance}
          userId={userId}
          onBalanceUpdate={handleBalanceUpdate}
        />
      )}
    </>
  );
}
