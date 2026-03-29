ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS admin_review_comment TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  installation_id UUID REFERENCES public.installations(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  read_at TIMESTAMPTZ
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (user_email = auth.email() OR public.is_admin());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_email = auth.email() OR public.is_admin())
  WITH CHECK (user_email = auth.email() OR public.is_admin());

DROP POLICY IF EXISTS "Admins insert notifications" ON public.notifications;
CREATE POLICY "Admins insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.review_installation(
  p_installation_id UUID,
  p_status TEXT,
  p_comment TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT NULL
)
RETURNS public.installations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_installation public.installations%ROWTYPE;
  v_result public.installations%ROWTYPE;
  v_status TEXT := LOWER(TRIM(COALESCE(p_status, '')));
  v_comment TEXT := NULLIF(TRIM(COALESCE(p_comment, '')), '');
  v_title TEXT;
  v_message TEXT;
  v_location TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can review installations';
  END IF;

  IF v_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid installation status: %', p_status;
  END IF;

  SELECT *
  INTO v_installation
  FROM public.installations
  WHERE id = p_installation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Installation not found';
  END IF;

  UPDATE public.installations
  SET status = v_status,
      rejection_reason = CASE
        WHEN v_status = 'rejected' THEN COALESCE(v_comment, rejection_reason, 'Rejected by admin')
        ELSE NULL
      END,
      admin_review_comment = v_comment,
      reviewed_at = NOW(),
      reviewed_by = COALESCE(NULLIF(TRIM(COALESCE(p_admin_email, '')), ''), auth.email())
  WHERE id = p_installation_id
  RETURNING *
  INTO v_result;

  v_location := CONCAT_WS(', ', NULLIF(v_installation.city, ''), NULLIF(v_installation.state, ''), NULLIF(v_installation.country, ''));
  v_title := CASE
    WHEN v_status = 'approved' THEN 'Installation approved'
    ELSE 'Installation rejected'
  END;
  v_message := CASE
    WHEN v_status = 'approved' AND v_comment IS NOT NULL THEN
      FORMAT('Your %s installation in %s was approved. Admin comment: %s', COALESCE(v_installation.installation_type, 'solar'), COALESCE(NULLIF(v_location, ''), 'your submitted location'), v_comment)
    WHEN v_status = 'approved' THEN
      FORMAT('Your %s installation in %s was approved.', COALESCE(v_installation.installation_type, 'solar'), COALESCE(NULLIF(v_location, ''), 'your submitted location'))
    WHEN v_comment IS NOT NULL THEN
      FORMAT('Your %s installation in %s was rejected. Admin comment: %s', COALESCE(v_installation.installation_type, 'solar'), COALESCE(NULLIF(v_location, ''), 'your submitted location'), v_comment)
    ELSE
      FORMAT('Your %s installation in %s was rejected.', COALESCE(v_installation.installation_type, 'solar'), COALESCE(NULLIF(v_location, ''), 'your submitted location'))
  END;

  INSERT INTO public.notifications (
    user_email,
    type,
    title,
    message,
    installation_id,
    metadata
  )
  VALUES (
    v_installation.created_by,
    'installation_review',
    v_title,
    v_message,
    v_installation.id,
    jsonb_build_object(
      'status', v_status,
      'comment', v_comment,
      'reviewed_by', COALESCE(NULLIF(TRIM(COALESCE(p_admin_email, '')), ''), auth.email())
    )
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_installation(UUID, TEXT, TEXT, TEXT) TO authenticated;
