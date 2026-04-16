-- 011_wire_picks_to_props.sql
-- Wire parlay_picks to the new player_props table (from migration 010).
--
-- Migration 010 dropped the FK constraint parlay_picks.player_prop_id →
-- player_props.id (via DROP TABLE … CASCADE) but left the column behind as
-- an unconstrained integer. The new player_props.id is bigint, so we need
-- to widen the column and re-add the FK.
--
-- Also adds a composite index on parlays(user_id, simulation_date DESC) for
-- the primary replay query pattern: "show me this user's parlays for a date."
-- (Migration 009 added a single-column simulation_date index, which we keep
-- for cross-user grading-job queries.)
--
-- Already done elsewhere (do NOT duplicate here):
--   - parlays.simulation_date column + idx_parlays_simulation_date    (migration 009)
--   - DROP calculate_payout_trigger / calculate_potential_payout()   (migration 009)
--
-- This migration is idempotent — safe to re-run.

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- 1. Widen parlay_picks.player_prop_id to bigint (only if still integer)
--    ALTER COLUMN TYPE rewrites the table + rebuilds dependent indexes
--    automatically, so idx_parlay_picks_prop_id (from 006) survives.
-- ────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'parlay_picks'
          AND column_name  = 'player_prop_id'
          AND data_type    = 'integer'
    ) THEN
        ALTER TABLE public.parlay_picks
            ALTER COLUMN player_prop_id TYPE bigint;
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────
-- 2. Re-add the FK to the new player_props.
--    ON DELETE SET NULL so graded pick history survives if a prop row
--    is ever deleted (e.g. after a model re-run wipes + regenerates).
-- ────────────────────────────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'parlay_picks_player_prop_id_fkey'
          AND conrelid = 'public.parlay_picks'::regclass
    ) THEN
        ALTER TABLE public.parlay_picks
            ADD CONSTRAINT parlay_picks_player_prop_id_fkey
            FOREIGN KEY (player_prop_id)
            REFERENCES public.player_props(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- ────────────────────────────────────────────────────────────────
-- 3. Composite index for user-scoped replay queries.
--    The single-column idx_parlays_simulation_date (migration 009) stays
--    for cross-user queries like the grading job.
-- ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_parlays_user_sim_date
    ON public.parlays (user_id, simulation_date DESC);

COMMIT;
