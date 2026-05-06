-- 010_refactor_player_props.sql
-- Refactor player_props into the MVP ML-friendly shape used by
-- DataPipeline/04_generate_props.py.
--
-- Old shape (migration 006): prop_type / over_line / under_line / over_odds /
--   under_odds / is_active  — designed for an odds-based sportsbook model.
--
-- New shape: stores the three quantile predictions (low / median / high) per
--   player-game-stat, plus model traceability. The betting payout for MVP is
--   a fixed multiplier, so no per-prop odds are needed in this table.
--
-- Dependencies on the old table we must drop first:
--   - view  popular_picks_view            (references old columns)
--   - func  get_popular_picks_for_game    (references old columns)
--   - table pick_popularity               (FK → player_props.id; tracked
--                                          picks against old prop shape)
--   - col   parlay_picks.player_prop_id   (FK → player_props.id; the FK
--                                          constraint is dropped via CASCADE;
--                                          the column itself is kept but left
--                                          unconstrained for a later migration
--                                          to re-wire or remove)
--
-- This migration is DESTRUCTIVE for existing player_props / pick_popularity
-- data. Safe because those tables have no live rows.

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- 1. Drop dependents that reference the old column shape
-- ────────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.popular_picks_view;

DROP FUNCTION IF EXISTS public.get_popular_picks_for_game(integer, integer);

DROP TABLE IF EXISTS public.pick_popularity;

-- ────────────────────────────────────────────────────────────────
-- 2. Drop the legacy player_props (CASCADE handles parlay_picks FK)
-- ────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.player_props CASCADE;

-- ────────────────────────────────────────────────────────────────
-- 3. Recreate player_props with the MVP schema
-- ────────────────────────────────────────────────────────────────

CREATE TABLE public.player_props (
    id             bigint         PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    season_id      integer        NOT NULL REFERENCES public.seasons(id)         ON DELETE CASCADE,
    game_id        integer        NOT NULL REFERENCES public.games(id)           ON DELETE CASCADE,
    player_id      integer        NOT NULL REFERENCES public.players(id)         ON DELETE CASCADE,
    team_id        integer        NOT NULL REFERENCES public.basketballteams(id) ON DELETE CASCADE,
    stat_type      text           NOT NULL,                       -- e.g. 'points', 'rebounds'
    line           numeric        NOT NULL CHECK (line      >= 0),-- q50 prediction (the "line")
    low_pred       numeric        NOT NULL CHECK (low_pred  >= 0),-- q10 prediction
    high_pred      numeric        NOT NULL CHECK (high_pred >= 0),-- q90 prediction
    model_version  text           NOT NULL,
    is_active      boolean        NOT NULL DEFAULT true,
    created_at     timestamptz    NOT NULL DEFAULT now(),
    updated_at     timestamptz    NOT NULL DEFAULT now(),

    -- Monotone quantile sanity: low_pred <= line <= high_pred
    CONSTRAINT player_props_quantile_monotone_chk
        CHECK (low_pred <= line AND line <= high_pred)
);

COMMENT ON TABLE public.player_props IS
  'ML-generated prop lines. One row per (player, game, stat_type). Upserted by DataPipeline/04_generate_props.py.';

-- ────────────────────────────────────────────────────────────────
-- 4. Unique index (the upsert conflict key) + filter indexes
-- ────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX player_props_player_game_stat_uq
    ON public.player_props (player_id, game_id, stat_type);

CREATE INDEX idx_player_props_season ON public.player_props(season_id);
CREATE INDEX idx_player_props_game   ON public.player_props(game_id);
CREATE INDEX idx_player_props_active ON public.player_props(is_active);

-- ────────────────────────────────────────────────────────────────
-- 5. updated_at trigger
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_player_props_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_player_props_set_updated_at
    BEFORE UPDATE ON public.player_props
    FOR EACH ROW
    EXECUTE FUNCTION public.set_player_props_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 6. Row Level Security: read-only to authenticated users.
--    Writes happen via the service role (04_generate_props.py),
--    which bypasses RLS — no write policy needed.
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.player_props ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view player props"
    ON public.player_props
    FOR SELECT
    TO authenticated
    USING (true);

COMMIT;
