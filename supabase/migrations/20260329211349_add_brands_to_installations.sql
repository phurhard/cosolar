ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS inverter_brand TEXT,
  ADD COLUMN IF NOT EXISTS solar_panel_brand TEXT,
  ADD COLUMN IF NOT EXISTS battery_brand TEXT;
