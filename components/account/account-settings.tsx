"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/database/profiles";
import { Bell, Mail, Users, Settings } from "lucide-react";

interface AccountSettingsProps {
  profile: UserProfile;
}

export default function AccountSettings({ profile }: AccountSettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Get favorite teams count
  const favoriteTeamsCount = profile.favorite_teams?.length || 0;

  const handleEditFavoriteTeams = () => {
    // TODO: Implement favorite teams editing modal
    console.log('Edit favorite teams clicked');
  };

  const handlePrivacySettings = () => {
    // TODO: Implement privacy settings modal
    console.log('Privacy settings clicked');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-yellow-400 mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Notifications Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-white font-medium">Push Notifications</label>
              <p className="text-sm text-gray-400">Get notified about game updates and results</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? 'bg-[#F4D03F]' : 'bg-gray-600'
            }`}
            aria-label={notifications ? 'Disable push notifications' : 'Enable push notifications'}
            title={notifications ? 'Disable push notifications' : 'Enable push notifications'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Email Updates Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-white font-medium">Email Updates</label>
              <p className="text-sm text-gray-400">Receive weekly betting summaries and promotions</p>
            </div>
          </div>
          <button
            onClick={() => setEmailUpdates(!emailUpdates)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailUpdates ? 'bg-[#F4D03F]' : 'bg-gray-600'
            }`}
            aria-label={emailUpdates ? 'Disable email updates' : 'Enable email updates'}
            title={emailUpdates ? 'Disable email updates' : 'Enable email updates'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailUpdates ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Favorite Teams */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-white font-medium">Favorite Teams</label>
              <p className="text-sm text-gray-400">
                {favoriteTeamsCount === 0 
                  ? 'No teams selected' 
                  : `${favoriteTeamsCount} team${favoriteTeamsCount !== 1 ? 's' : ''} selected`
                }
              </p>
            </div>
          </div>
          <Button
            onClick={handleEditFavoriteTeams}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Edit
          </Button>
        </div>

        {/* Privacy Settings */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <div>
              <label className="text-white font-medium">Privacy Settings</label>
              <p className="text-sm text-gray-400">Manage your data and privacy preferences</p>
            </div>
          </div>
          <Button
            onClick={handlePrivacySettings}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
} 