import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/database/profiles";

interface WelcomeHeaderProps {
  user: User;
  profile?: UserProfile;
}

export default function WelcomeHeader({ user, profile }: WelcomeHeaderProps) {
  // Format the member since date if profile is provided
  const memberSince = profile ? new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold text-white">
        Welcome back, {user.email}
      </h1>
      {memberSince && (
        <p className="text-gray-400 text-sm">
          Member since {memberSince}
        </p>
      )}
    </div>
  );
} 