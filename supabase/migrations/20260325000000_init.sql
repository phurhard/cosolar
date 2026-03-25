-- ============================================================
-- CoSolar - Initial Migration
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', FALSE);
$$;

CREATE TABLE IF NOT EXISTS installer_profiles (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  created_by                  TEXT,
  company_name                TEXT NOT NULL,
  country                     TEXT NOT NULL,
  state                       TEXT,
  city                        TEXT,
  years_of_experience         INTEGER DEFAULT 0,
  phone                       TEXT,
  website                     TEXT,
  bio                         TEXT,
  certifications              TEXT[] DEFAULT '{}',
  verified                    BOOLEAN DEFAULT FALSE,
  total_kva                   FLOAT DEFAULT 0,
  total_panels                INTEGER DEFAULT 0,
  total_batteries             INTEGER DEFAULT 0,
  total_installations         INTEGER DEFAULT 0,
  total_carbon_offset_tons    FLOAT DEFAULT 0,
  total_carbon_offset_lifetime FLOAT DEFAULT 0,
  carbon_credit_value_usd     FLOAT DEFAULT 0
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'installer_profiles_years_non_negative'
  ) THEN
    ALTER TABLE installer_profiles
      ADD CONSTRAINT installer_profiles_years_non_negative
      CHECK (years_of_experience >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'installer_profiles_created_by_key'
  ) THEN
    ALTER TABLE installer_profiles
      ADD CONSTRAINT installer_profiles_created_by_key UNIQUE (created_by);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS installations (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  created_by                  TEXT,
  installer_profile_id        UUID REFERENCES installer_profiles(id),
  country                     TEXT NOT NULL,
  state                       TEXT,
  city                        TEXT,
  installation_type           TEXT,
  installation_date           DATE,
  system_size_kva             FLOAT DEFAULT 0,
  number_of_inverters         INTEGER DEFAULT 0,
  inverter_capacity_kva       FLOAT DEFAULT 0,
  number_of_panels            INTEGER DEFAULT 0,
  panel_wattage               INTEGER DEFAULT 0,
  battery_type                TEXT,
  number_of_batteries         INTEGER DEFAULT 0,
  battery_capacity_each       FLOAT DEFAULT 0,
  battery_capacity_kwh        FLOAT DEFAULT 0,
  carbon_offset_tons_annual   FLOAT DEFAULT 0,
  carbon_offset_lifetime      FLOAT DEFAULT 0,
  status                      TEXT DEFAULT 'pending',
  rejection_reason            TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'installations_status_valid'
  ) THEN
    ALTER TABLE installations
      ADD CONSTRAINT installations_status_valid
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL
);

ALTER TABLE installer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read installer_profiles" ON installer_profiles;
CREATE POLICY "Public read installer_profiles"
  ON installer_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON installer_profiles;
CREATE POLICY "Users insert own profile"
  ON installer_profiles FOR INSERT
  WITH CHECK (created_by = auth.email());

DROP POLICY IF EXISTS "Users update own profile" ON installer_profiles;
CREATE POLICY "Users update own profile"
  ON installer_profiles FOR UPDATE
  USING (created_by = auth.email() OR public.is_admin());

DROP POLICY IF EXISTS "Public read approved installations" ON installations;
CREATE POLICY "Public read approved installations"
  ON installations FOR SELECT
  USING (status = 'approved' OR created_by = auth.email() OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own installations" ON installations;
CREATE POLICY "Users insert own installations"
  ON installations FOR INSERT
  WITH CHECK (created_by = auth.email());

DROP POLICY IF EXISTS "Admin update installations" ON installations;
CREATE POLICY "Admin update installations"
  ON installations FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit contact" ON contact_messages;
CREATE POLICY "Anyone can submit contact"
  ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read contacts" ON contact_messages;
CREATE POLICY "Admin read contacts"
  ON contact_messages FOR SELECT
  USING (public.is_admin());
