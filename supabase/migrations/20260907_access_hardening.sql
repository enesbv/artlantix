-- Apply after schema.sql. This migration is not executed by the application.
BEGIN;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expected_delivery_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS assigned_artist TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS revision_annotations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reconstruction_level TEXT DEFAULT 'clean';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS needs_manual_review BOOLEAN DEFAULT FALSE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card_simulated';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_reconstruction_level_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_reconstruction_level_check CHECK (reconstruction_level IN ('clean', 'moderate', 'heavy'));
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('card_simulated', 'invoice_b2b', 'pay_after_quote_review'));

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current', hero_title TEXT NOT NULL, hero_subtitle TEXT NOT NULL,
  simple_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 25,
  standard_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 45,
  complex_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 75,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, "clientType" TEXT, badge TEXT,
  "rasterUrl" TEXT NOT NULL, "vectorUrl" TEXT, "vectorSvgContent" TEXT, description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE, stats JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS "vectorUrl" TEXT;
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Anyone can read active portfolio items" ON public.portfolio_items;
CREATE POLICY "Anyone can read active portfolio items" ON public.portfolio_items FOR SELECT USING (active OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage portfolio items" ON public.portfolio_items;
CREATE POLICY "Admins can manage portfolio items" ON public.portfolio_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
DROP POLICY IF EXISTS "Admins can upload portfolio media" ON storage.objects;
CREATE POLICY "Admins can upload portfolio media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
DROP POLICY IF EXISTS "Anyone can read portfolio media" ON storage.objects;
CREATE POLICY "Anyone can read portfolio media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Admins can update portfolio media" ON storage.objects;
CREATE POLICY "Admins can update portfolio media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND public.is_admin()) WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete portfolio media" ON storage.objects;
CREATE POLICY "Admins can delete portfolio media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.enforce_order_insert_pricing()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE base_amount NUMERIC(10, 2); calculated_amount NUMERIC(10, 2);
BEGIN
  SELECT CASE NEW.complexity WHEN 'simple' THEN simple_tier_price WHEN 'complex' THEN complex_tier_price ELSE standard_tier_price END
    INTO base_amount FROM public.site_settings WHERE id = 'current';
  base_amount := COALESCE(base_amount, CASE NEW.complexity WHEN 'simple' THEN 25 WHEN 'complex' THEN 75 ELSE 45 END);
  calculated_amount := base_amount;
  IF NEW.has_text THEN calculated_amount := calculated_amount + 15; END IF;
  IF NEW.reconstruction_level = 'heavy' THEN calculated_amount := calculated_amount + 35;
  ELSIF NEW.reconstruction_level = 'moderate' OR (NEW.reconstruction_level IS NULL AND NEW.reconstruction_needed) THEN calculated_amount := calculated_amount + 20; END IF;
  IF NEW.colors ILIKE '3-5%' THEN calculated_amount := calculated_amount + 5;
  ELSIF NEW.colors ILIKE '6+%' OR NEW.colors ILIKE 'gradient%' THEN calculated_amount := calculated_amount + 15; END IF;
  IF NEW.turnaround = 'express' THEN calculated_amount := ROUND(calculated_amount * 1.35); END IF;
  NEW.estimated_price := calculated_amount; NEW.final_price := calculated_amount;
  NEW.needs_manual_review := COALESCE(NEW.needs_manual_review, false) OR (NEW.complexity = 'complex' AND NEW.reconstruction_needed AND NEW.has_text);
  -- Until a verified payment webhook exists, every new remote order requires studio review.
  NEW.status := 'quote_requested';
  NEW.expected_delivery_at := COALESCE(NEW.created_at, NOW()) + CASE WHEN NEW.turnaround = 'express' THEN INTERVAL '16 hours' ELSE INTERVAL '48 hours' END;
  NEW.status_history := jsonb_build_array(jsonb_build_object('id', 'status_' || gen_random_uuid()::text, 'status', NEW.status, 'created_at', COALESCE(NEW.created_at, NOW()), 'actor', 'customer'));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_order_insert_pricing ON public.orders;
CREATE TRIGGER enforce_order_insert_pricing BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.enforce_order_insert_pricing();

CREATE OR REPLACE FUNCTION public.append_order_status_history()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_history := COALESCE(OLD.status_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
      'id', 'status_' || gen_random_uuid()::text, 'status', NEW.status,
      'created_at', COALESCE(NEW.updated_at, NOW()),
      'actor', CASE WHEN public.is_admin() THEN 'studio' ELSE 'customer' END
    ));
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zz_append_order_status_history ON public.orders;
CREATE TRIGGER zz_append_order_status_history BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.append_order_status_history();
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN ('quote_requested', 'in_review', 'in_progress', 'preview_ready', 'approved', 'revision_requested', 'completed', 'cancelled')
);

UPDATE storage.buckets SET public = false WHERE id = 'previews';
DROP POLICY IF EXISTS "Anyone can view watermarked previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own previews or admins read all" ON storage.objects;
CREATE POLICY "Users can read own previews or admins read all" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'previews' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

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
    IF (to_jsonb(NEW) - ARRAY['status', 'updated_at', 'revision_annotations']) IS DISTINCT FROM
       (to_jsonb(OLD) - ARRAY['status', 'updated_at', 'revision_annotations']) THEN
      RAISE EXCEPTION 'Only the production team may change order details';
    END IF;
    IF NEW.revision_annotations IS DISTINCT FROM OLD.revision_annotations AND NOT
       (OLD.status = 'preview_ready' AND NEW.status = 'revision_requested') THEN
      RAISE EXCEPTION 'Revision markers may only be submitted with a preview revision request';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT
       (OLD.status = 'preview_ready' AND NEW.status IN ('approved', 'revision_requested')) THEN
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
