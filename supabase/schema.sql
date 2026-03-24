-- ============================================================
-- CoSolar - Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables.
-- ============================================================

-- Installer profiles
CREATE TABLE IF NOT EXISTS installer_profiles (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  created_by                  TEXT,                        -- user email
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
  -- Aggregated stats (updated on approve/reject)
  total_kva                   FLOAT DEFAULT 0,
  total_panels                INTEGER DEFAULT 0,
  total_batteries             INTEGER DEFAULT 0,
  total_installations         INTEGER DEFAULT 0,
  total_carbon_offset_tons    FLOAT DEFAULT 0,
  total_carbon_offset_lifetime FLOAT DEFAULT 0,
  carbon_credit_value_usd     FLOAT DEFAULT 0
);

-- Solar installations
CREATE TABLE IF NOT EXISTS installations (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  created_by                  TEXT,                        -- user email
  installer_profile_id        UUID REFERENCES installer_profiles(id),
  country                     TEXT NOT NULL,
  state                       TEXT,
  city                        TEXT,
  installation_type           TEXT,
  installation_date           DATE,
  -- System specs
  system_size_kva             FLOAT DEFAULT 0,
  number_of_inverters         INTEGER DEFAULT 0,
  inverter_capacity_kva       FLOAT DEFAULT 0,
  number_of_panels            INTEGER DEFAULT 0,
  panel_wattage               INTEGER DEFAULT 0,
  -- Battery storage
  battery_type                TEXT,
  number_of_batteries         INTEGER DEFAULT 0,
  battery_capacity_each       FLOAT DEFAULT 0,
  battery_capacity_kwh        FLOAT DEFAULT 0,
  -- Carbon
  carbon_offset_tons_annual   FLOAT DEFAULT 0,
  carbon_offset_lifetime      FLOAT DEFAULT 0,
  -- Admin review
  status                      TEXT DEFAULT 'pending',      -- pending | approved | rejected
  rejection_reason            TEXT
);

-- Contact form messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE installer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- installer_profiles: anyone can read; only owner can insert/update their own
CREATE POLICY "Public read installer_profiles"
  ON installer_profiles FOR SELECT USING (true);

CREATE POLICY "Users insert own profile"
  ON installer_profiles FOR INSERT
  WITH CHECK (created_by = auth.email());

CREATE POLICY "Users update own profile"
  ON installer_profiles FOR UPDATE
  USING (created_by = auth.email() OR (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- installations: approved ones are public; owner can see all theirs; admins see all
CREATE POLICY "Public read approved installations"
  ON installations FOR SELECT
  USING (status = 'approved' OR created_by = auth.email() OR (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Users insert own installations"
  ON installations FOR INSERT
  WITH CHECK (created_by = auth.email());

CREATE POLICY "Admin update installations"
  ON installations FOR UPDATE
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- contact_messages: insert only
CREATE POLICY "Anyone can submit contact"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contacts"
  ON contact_messages FOR SELECT
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- ============================================================
-- Grant admin role (run after creating your admin user):
--
--   SELECT set_claim('USER_UUID_HERE', 'role', '"admin"');
--
-- Or from Supabase Dashboard → Auth → Users → Edit user →
-- set app_metadata: {"role": "admin"}
-- ============================================================
