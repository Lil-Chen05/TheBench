"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/database/profiles";
import { Bell, Mail, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountSettingsProps {
  profile: UserProfile;
}

export default function AccountSettings({ profile }: AccountSettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const favoriteTeamsCount = profile.favorite_teams?.length || 0;

  return (
    <section className="rounded-xl bg-gray-900 border border-gray-800 p-6">
      <h2 className="text-base font-bold text-white tracking-tight mb-5">
        Account Settings
      </h2>

      <div className="space-y-3">
        {/* Notifications Toggle */}
        <SettingRow
          icon={<Bell className="w-4 h-4 text-gray-500" />}
          label="Push Notifications"
          description="Get notified about game updates and results"
        >
          <Toggle
            enabled={notifications}
            onToggle={() => setNotifications((v) => !v)}
            label={notifications ? "Disable push notifications" : "Enable push notifications"}
          />
        </SettingRow>

        {/* Email Updates Toggle */}
        <SettingRow
          icon={<Mail className="w-4 h-4 text-gray-500" />}
          label="Email Updates"
          description="Receive weekly betting summaries and promotions"
        >
          <Toggle
            enabled={emailUpdates}
            onToggle={() => setEmailUpdates((v) => !v)}
            label={emailUpdates ? "Disable email updates" : "Enable email updates"}
          />
        </SettingRow>

        {/* Favorite Teams */}
        <SettingRow
          icon={<Users className="w-4 h-4 text-gray-500" />}
          label="Favorite Teams"
          description={
            favoriteTeamsCount === 0
              ? "No teams selected"
              : `${favoriteTeamsCount} team${favoriteTeamsCount !== 1 ? "s" : ""} selected`
          }
        >
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Edit
          </Button>
        </SettingRow>

        {/* Privacy Settings */}
        <SettingRow
          icon={<Settings className="w-4 h-4 text-gray-500" />}
          label="Privacy Settings"
          description="Manage your data and privacy preferences"
        >
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Manage
          </Button>
        </SettingRow>
      </div>
    </section>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-950 border border-gray-800 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{label}</p>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-[#F4D03F]" : "bg-gray-700",
      )}
      aria-label={label}
      title={label}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
