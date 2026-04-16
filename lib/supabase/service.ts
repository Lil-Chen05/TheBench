import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Build a Supabase client authenticated with the **service role** key.
 *
 * This client bypasses Row Level Security — use it only in trusted
 * server-side contexts (admin routes, grading engine, cron jobs).
 *
 * Reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from the
 * environment. Throws at startup if either is missing so the error is
 * loud and obvious rather than a silent 401 at query time.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY — " +
        "cannot create service-role Supabase client.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
