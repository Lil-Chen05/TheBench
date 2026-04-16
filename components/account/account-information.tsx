"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/database/profiles";
import { Mail, Calendar, Lock } from "lucide-react";
import ChangePasswordModal from "./change-password-modal";

interface AccountInformationProps {
  user: User;
  profile: UserProfile;
}

export default function AccountInformation({ user, profile }: AccountInformationProps) {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="text-base font-bold text-white tracking-tight mb-5">
          Account Information
        </h2>

        <div className="space-y-3">
          <InfoRow
            icon={<Mail className="w-4 h-4 text-gray-500" />}
            label="Email Address"
            value={user.email ?? "—"}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4 text-gray-500" />}
            label="Member Since"
            value={memberSince}
          />

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              <Lock className="w-3.5 h-3.5" />
              Password
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="password"
                value="••••••••••••••••"
                readOnly
                className="flex-1 bg-gray-950 border border-gray-800 rounded-md px-3 py-2.5 text-gray-400 text-sm cursor-default tabular-nums"
                tabIndex={-1}
                aria-label="Password (hidden for security)"
              />
              <Button
                onClick={() => setShowChangePasswordModal(true)}
                className="bg-[#F4D03F] text-black font-semibold hover:bg-[#e6c200] transition-colors"
                aria-label="Open change password dialog"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-950 border border-gray-800 rounded-lg">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-white text-sm font-semibold truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
