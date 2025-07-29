"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  userId: string;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function AddCreditsModal({
  isOpen,
  onClose,
  currentBalance,
  userId,
  onBalanceUpdate,
}: AddCreditsModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  const handleAddCredits = async () => {
    if (isAdding) return;

    setIsAdding(true);

    try {
      // Get current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch current balance');
      }

      // Calculate new balance
      const newBalance = profile.balance + 10;

      // Update balance in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update balance');
      }

      // Update local state
      onBalanceUpdate(newBalance);

      // Show success toast
      showToast(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>10 credits added successfully!</span>
        </div>,
        "success"
      );

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error adding credits:', error);
      
      showToast(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>Failed to add credits. Please try again.</span>
        </div>,
        "error"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isAdding) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isAdding) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-credits-title"
    >
      <Card className="w-full max-w-md mx-4 bg-gray-900 border border-gray-800 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-yellow-400" />
              </div>
              <CardTitle 
                id="add-credits-title"
                className="text-xl font-semibold text-yellow-400"
              >
                Add Credits
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isAdding}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              Add credits to your account balance to place more parlays.
            </p>
            <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <p className="text-yellow-400 text-xs font-medium">
                Test Mode: This will add 10 credits to your account for testing purposes.
              </p>
            </div>
          </div>

          {/* Current Balance Display */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Current Balance</p>
            <p className="text-lg font-bold text-white">
              {formatBalance(currentBalance)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleAddCredits}
              disabled={isAdding}
              className={cn(
                "flex-1 bg-yellow-400 text-black font-semibold hover:bg-yellow-300",
                "transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-yellow-400/20",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              )}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add 10 Credits"
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 