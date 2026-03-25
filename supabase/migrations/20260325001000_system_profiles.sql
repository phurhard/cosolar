-- ============================================================
-- Hide internal bootstrap profiles from public leaderboard views
-- ============================================================

ALTER TABLE public.installer_profiles
ADD COLUMN IF NOT EXISTS is_system_profile BOOLEAN NOT NULL DEFAULT FALSE;
