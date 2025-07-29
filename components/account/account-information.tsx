"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/database/profiles";
import { Lock, Mail, Calendar } from "lucide-react";
import ChangePasswordModal from "./change-password-modal";

interface AccountInformationProps {
  user: User;
  profile: UserProfile;
}

export default function AccountInformation({ user, profile }: AccountInformationProps) {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Format the member since date
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-yellow-400 mb-6">Account Information</h2>
        
        <div className="space-y-4">
          {/* Email Address */}
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="text-sm text-gray-400">Email Address</label>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="text-sm text-gray-400">Member Since</label>
              <p className="text-white font-medium">{memberSince}</p>
            </div>
          </div>

          {/* Password Field - Secure Implementation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1">
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••••••••••••••"
                  readOnly
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-gray-300 cursor-default"
                  tabIndex={-1}
                  aria-label="Password (hidden for security)"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                className="bg-[#F4D03F] text-black font-bold hover:bg-[#e6c200] hover:scale-105 transition-all duration-200 shadow-lg shadow-[#F4D03F]/20 whitespace-nowrap"
                aria-label="Open change password dialog"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={handleCloseChangePasswordModal}
      />
    </>
  );
} 