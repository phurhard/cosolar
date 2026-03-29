-- Allow users to update their own installations to resubmit if rejected
CREATE POLICY "Users update own installations"
  ON public.installations FOR UPDATE
  USING (created_by = auth.email() OR public.is_admin())
  WITH CHECK (created_by = auth.email() OR public.is_admin());
