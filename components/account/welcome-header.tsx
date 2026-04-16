import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/database/profiles";

interface WelcomeHeaderProps {
  user: User;
  profile?: UserProfile;
}

export default function WelcomeHeader({ user, profile }: WelcomeHeaderProps) {
  const memberSince = profile
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
        Account
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight truncate">
        {user.email}
      </h1>
      {memberSince && (
        <p className="text-gray-400 text-sm mt-1">
          Member since {memberSince}
        </p>
      )}
    </div>
  );
}
