-- Migration 009: Add simulation_date to parlays and remove odds-based payout trigger
--
-- Changes:
-- 1. Add simulation_date column to parlays for historical replay tracking
-- 2. Drop the American odds payout trigger — payout is now calculated
--    in app code using fixed multipliers based on pick count

-- Add simulation_date to parlays
ALTER TABLE public.parlays ADD COLUMN simulation_date date;
CREATE INDEX idx_parlays_simulation_date ON public.parlays(simulation_date);

-- Drop the old American odds payout trigger and function
-- Payout is now computed server-side in createParlay():
--   2 picks = 3x, 3 picks = 5x, 4 picks = 10x, 5 picks = 20x
DROP TRIGGER IF EXISTS calculate_payout_trigger ON public.parlays;
DROP FUNCTION IF EXISTS calculate_potential_payout();
