BEGIN;

-- Trigger-only functions must never be callable through the Data API.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Supabase creates this function when automatic RLS is enabled for new tables.
-- Keep the event trigger operational while removing direct Data API execution.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END;
$$;

-- These policy helpers intentionally remain executable. They derive identity
-- exclusively from auth.uid(), expose only booleans, and cannot mutate data.
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_admin_read_customer_asset(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.customer_asset_is_attached(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_master_delivery(TEXT) TO authenticated;

COMMIT;
