import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { advanceDay } from "@/lib/database/grading";

/**
 * POST /api/admin/advance-day
 *
 * Grades all pending parlays on the current simulation date and advances
 * the date to the next day with active props. Admin-only — requires a
 * session whose profile has `is_admin = true`.
 *
 * Auth flow:
 *   1. Read session via the cookie-based server client (validates the
 *      user is logged in).
 *   2. Check `profiles.is_admin` for that user.
 *   3. Run the grading engine with the service-role client (bypasses
 *      RLS for writes to parlays, simulation_state, and balances).
 */
export async function POST() {
  try {
    // ── Auth: session check ───────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Auth: admin check ─────────────────────────────────────────
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Grade + advance ───────────────────────────────────────────
    const serviceClient = createServiceClient();
    const result = await advanceDay(serviceClient);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("advance-day error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
