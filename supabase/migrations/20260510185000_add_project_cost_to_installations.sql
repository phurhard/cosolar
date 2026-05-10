-- Add project cost fields to installations table for Africa-wide cost tracking
ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS project_cost NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS project_cost_currency TEXT DEFAULT 'NGN';
