import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSimulationDate } from "@/lib/database/simulation";
import type { PropDatesResponse } from "@/types/props";

/**
 * GET /api/props/dates
 *
 * Returns the current simulation date as a single-element array.
 * The play page is locked to this date — users may only build parlays
 * against the globally active simulation date.
 *
 * Response: { dates: ["2024-10-25"] }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const simDate = await getCurrentSimulationDate(supabase);

    const body: PropDatesResponse = { dates: [simDate] };
    return NextResponse.json(body);
  } catch (err) {
    console.error("Unexpected error in GET /api/props/dates:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
