-- 013_parlay_status_voided.sql
-- Widen parlays.status CHECK constraint to allow 'voided'.
--
-- Context: grading (lib/database/grading.ts, migration 012's advance-day
-- flow) needs a third terminal status for parlays whose outcome cannot be
-- computed — specifically, any parlay where at least one pick references a
-- player/game with no player_game_stats row for the simulation date. Those
-- parlays are refunded in full and marked 'voided' to distinguish from
-- plain 'lost'.
--
-- Implementation: drop + recreate the CHECK constraint (there is no
-- ALTER CHECK constraint in PostgreSQL). The original constraint from
-- migration 003 is named via the implicit "<table>_<col>_check" pattern
-- (`parlays_status_check`).
--
-- Idempotent: DROP IF EXISTS + ADD with a fresh name.

BEGIN;

ALTER TABLE public.parlays
    DROP CONSTRAINT IF EXISTS parlays_status_check;

ALTER TABLE public.parlays
    ADD CONSTRAINT parlays_status_check
    CHECK (status IN ('pending', 'won', 'lost', 'voided'));

COMMENT ON COLUMN public.parlays.status IS
  'Lifecycle: pending → won | lost | voided. Voided = refunded because a pick had no stats row at grading time.';

COMMIT;
