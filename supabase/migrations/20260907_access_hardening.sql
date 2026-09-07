-- Apply after schema.sql. This migration is not executed by the application.
BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, account_type, company_name, is_admin)
  VALUES (new.id, new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE WHEN new.raw_user_meta_data->>'account_type' = 'business' THEN 'business' ELSE 'individual' END,
    new.raw_user_meta_data->>'company_name', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.is_admin() SET search_path = '';

-- User-controlled metadata and profile updates must never grant admin rights.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') AND
     (NEW.is_admin IS DISTINCT FROM OLD.is_admin OR NEW.id IS DISTINCT FROM OLD.id) THEN
    RAISE EXCEPTION 'Profile identity and role must be managed by the server';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

DROP POLICY IF EXISTS "Users and admins can insert files for orders" ON public.order_files;
CREATE POLICY "Users and admins can insert files for orders" ON public.order_files FOR INSERT TO authenticated
WITH CHECK (public.is_admin() OR (
  user_id = auth.uid() AND file_category IN ('customer_upload', 'revision_ref') AND
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
));

DROP POLICY IF EXISTS "Users and admins can insert messages" ON public.order_messages;
CREATE POLICY "Users and admins can insert messages" ON public.order_messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND (public.is_admin() OR (
  sender_type = 'customer' AND
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
)));

-- Customer approval is only allowed from a preview; pricing and ownership remain fixed.
CREATE OR REPLACE FUNCTION public.protect_order_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user = 'authenticated' AND NOT public.is_admin() THEN
    IF (to_jsonb(NEW) - ARRAY['status', 'updated_at']) IS DISTINCT FROM
       (to_jsonb(OLD) - ARRAY['status', 'updated_at']) THEN
      RAISE EXCEPTION 'Only the production team may change order details';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT
       (OLD.status = 'preview_ready' AND NEW.status IN ('completed', 'revision_requested')) THEN
      RAISE EXCEPTION 'A preview is required before approval or revision';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_order_update ON public.orders;
CREATE TRIGGER protect_order_update BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_order_update();

COMMIT;
