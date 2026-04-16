-- 012_simulation_state_and_admin.sql
-- Phase 3: temporal mechanism for the parlay replay.
--
-- Introduces:
--   1. simulation_state  — a single-row settings table holding the globally
--      active game date that all users build parlays against.
--   2. profiles.is_admin — flag gating /api/admin/advance-day and the
--      /dashboard/admin UI. Flip to true manually via the Supabase dashboard
--      for the test account.
--
-- Design intent: simulation_state.sim_date maps 1:1 to a real "today" in
-- a future live version. Only the trigger for advancing it differs — in this
-- MVP it is an admin button; in production it would be a nightly cron that
-- runs right after the day's games are graded.
--
-- Named `sim_date` (not `current_date`) to sidestep the PostgreSQL reserved
-- keyword CURRENT_DATE — using the reserved word works through PostgREST's
-- quoting, but breaks plain psql queries and is a sharp edge for nothing.
--
-- This migration is idempotent — safe to re-run. The seed INSERT is a no-op
-- when the row already exists thanks to the single-row primary key.

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- 1. simulation_state (exactly one row, enforced by the PK check)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.simulation_state (
    id          boolean     PRIMARY KEY DEFAULT true CHECK (id = true),
    sim_date    date        NOT NULL,
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.simulation_state IS
  'Single-row global settings. Holds the current simulation_date — the only date users may build parlays for.';

-- updated_at bookkeeping
CREATE OR REPLACE FUNCTION public.set_simulation_state_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_simulation_state_set_updated_at
    ON public.simulation_state;
CREATE TRIGGER trg_simulation_state_set_updated_at
    BEFORE UPDATE ON public.simulation_state
    FOR EACH ROW
    EXECUTE FUNCTION public.set_simulation_state_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 2. Seed sim_date from the earliest game_date with active props.
--    Joins player_props → games because player_props has no date column.
--    ON CONFLICT DO NOTHING so re-running this migration is harmless.
-- ────────────────────────────────────────────────────────────────

INSERT INTO public.simulation_state (id, sim_date)
SELECT
    true,
    MIN(g.game_date)
FROM public.player_props pp
JOIN public.games g ON g.id = pp.game_id
WHERE pp.is_active = true
-- Guard against an empty player_props table at seed time: if there are no
-- active props, MIN() returns NULL and we'd violate NOT NULL. Skip the
-- INSERT entirely in that case — the admin can set a date manually later.
HAVING MIN(g.game_date) IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 3. Row Level Security: any authenticated user can READ the current
--    simulation date (the play page needs it). Writes go through the
--    service role only — no write policy is defined, which implicitly
--    blocks INSERT/UPDATE/DELETE for anon + authenticated roles.
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.simulation_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "simulation_state readable by authenticated"
    ON public.simulation_state;
CREATE POLICY "simulation_state readable by authenticated"
    ON public.simulation_state
    FOR SELECT
    TO authenticated
    USING (true);

-- ────────────────────────────────────────────────────────────────
-- 4. profiles.is_admin flag (idempotent)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_admin IS
  'Gates /api/admin/* routes and the /dashboard/admin UI. Flip manually in the Supabase dashboard for test accounts.';

COMMIT;
