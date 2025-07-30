"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/database/profiles";
import { DollarSign, Plus, Clock } from "lucide-react";
import AddCreditsModal from "./add-credits-modal";

interface BalancePanelProps {
  profile: UserProfile;
  userId: string;
}

export default function BalancePanel({ profile, userId }: BalancePanelProps) {
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(profile.balance);

  // Format the balance with proper currency formatting
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(currentBalance);

  const handleAddCredits = () => {
    setShowAddCreditsModal(true);
  };

  const handleCloseModal = () => {
    setShowAddCreditsModal(false);
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setCurrentBalance(newBalance);
  };

  return (
    <>
      {/* Desktop/Tablet Balance Panel */}
      <div className="hidden md:block">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Balance Display */}
            <div className="space-y-3">
              <div className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                Account Balance
              </div>
              <div className="text-4xl font-bold text-white leading-none">
                {formattedBalance}
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Available Credits</span>
              </div>
            </div>

            {/* Add Credits Button */}
            <Button 
              onClick={handleAddCredits}
              className="bg-[#F4D03F] text-black font-bold px-6 py-3 text-base hover:bg-[#e6c200] hover:scale-105 transition-all duration-200 shadow-lg shadow-[#F4D03F]/20 w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Credits
            </Button>

            {/* Last Updated */}
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>Updated just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sticky Balance Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 shadow-2xl z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-gray-400 text-xs uppercase tracking-wide">Balance</div>
              <div className="text-xl font-bold text-white">{formattedBalance}</div>
            </div>
          </div>
          <Button 
            onClick={handleAddCredits}
            className="bg-[#F4D03F] text-black font-bold px-4 py-2 text-sm hover:bg-[#e6c200] hover:scale-105 transition-all duration-200 shadow-lg shadow-[#F4D03F]/20"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Credits
          </Button>
        </div>
      </div>

      {/* Add Credits Modal */}
      <AddCreditsModal
        isOpen={showAddCreditsModal}
        onClose={handleCloseModal}
        currentBalance={currentBalance}
        userId={userId}
        onBalanceUpdate={handleBalanceUpdate}
      />
    </>
  );
} 