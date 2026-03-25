-- ============================================================
-- CoSolar - Seed Data
-- Run after migrations. Safe to execute multiple times.
-- ============================================================

DO $$
DECLARE
  seeded_admin_email CONSTANT TEXT := 'admin@cosolar.local';
  seeded_admin_password CONSTANT TEXT := 'ChangeMe123!';
  seeded_admin_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE email = seeded_admin_email LIMIT 1),
    seeded_admin_id
  )
  INTO seeded_admin_id;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = seeded_admin_id
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      seeded_admin_id,
      'authenticated',
      'authenticated',
      seeded_admin_email,
      crypt(seeded_admin_password, gen_salt('bf')),
      NOW(),
      jsonb_build_object(
        'provider', 'email',
        'providers', jsonb_build_array('email'),
        'role', 'admin'
      ),
      jsonb_build_object(
        'display_name', 'CoSolar Super Admin',
        'seeded', TRUE
      ),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;

  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', 'admin'
    ),
    updated_at = NOW()
  WHERE id = seeded_admin_id;

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    seeded_admin_id,
    jsonb_build_object(
      'sub', seeded_admin_id::text,
      'email', seeded_admin_email,
      'email_verified', TRUE,
      'phone_verified', FALSE
    ),
    'email',
    seeded_admin_email,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;
END $$;

-- Optional bootstrap profile for the seeded admin account.
INSERT INTO public.installer_profiles (
  created_by,
  company_name,
  country,
  state,
  city,
  years_of_experience,
  bio,
  verified,
  is_system_profile
)
VALUES (
  'admin@cosolar.local',
  'CoSolar Platform Admin',
  'Nigeria',
  'Lagos',
  'Lagos',
  10,
  'Seeded super-admin profile for initial project bootstrap.',
  TRUE,
  TRUE
)
ON CONFLICT (created_by) DO UPDATE
SET
  company_name = EXCLUDED.company_name,
  country = EXCLUDED.country,
  state = EXCLUDED.state,
  city = EXCLUDED.city,
  years_of_experience = EXCLUDED.years_of_experience,
  bio = EXCLUDED.bio,
  verified = EXCLUDED.verified,
  is_system_profile = EXCLUDED.is_system_profile;
