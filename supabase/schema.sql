-- ==============================================================================
-- ARTLANTIX PRODUCTION POSTGRESQL SCHEMA & STORAGE MIGRATION
-- Studio-Grade Vectorization & Artwork Reconstruction Platform
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. CORE DATABASE TABLES
-- ------------------------------------------------------------------------------

-- Profiles table (Customers and Production Operators / Admins)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  full_name TEXT CHECK (full_name IS NULL OR char_length(full_name) <= 120),
  account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'business')),
  company_name TEXT CHECK (company_name IS NULL OR char_length(company_name) <= 160),
  business_type TEXT CHECK (business_type IS NULL OR char_length(business_type) <= 120),
  vat_tax_id TEXT CHECK (vat_tax_id IS NULL OR char_length(vat_tax_id) <= 80),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL CHECK (char_length(order_number) BETWEEN 8 AND 80),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL CHECK (char_length(project_name) BETWEEN 1 AND 160),
  artwork_type TEXT NOT NULL CHECK (artwork_type IN ('ai_logo', 'lowres_logo', 'sketch_scan', 'lettering_typography', 'mascot_badge', 'apparel_signage')),
  agency_services TEXT[] NOT NULL DEFAULT '{}' CHECK (
    cardinality(agency_services) <= 3
    AND array_position(agency_services, NULL) IS NULL
    AND agency_services <@ ARRAY['brand-identity', 'alternative-logo', 'social-media-kit']::TEXT[]
  ),
  complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'standard', 'complex')),
  colors TEXT NOT NULL CHECK (colors IN ('1-2 colors', '3-5 colors', '6+ colors', 'gradient colors')),
  has_text BOOLEAN NOT NULL DEFAULT FALSE,
  reconstruction_needed BOOLEAN NOT NULL DEFAULT FALSE,
  reconstruction_level TEXT DEFAULT 'clean' CHECK (reconstruction_level IN ('clean', 'moderate', 'heavy')),
  turnaround TEXT DEFAULT 'standard' CHECK (turnaround IN ('standard', 'express')),
  estimated_price NUMERIC(10, 2) NOT NULL CHECK (estimated_price BETWEEN 0 AND 10000),
  final_price NUMERIC(10, 2) CHECK (final_price IS NULL OR final_price BETWEEN 0 AND 10000),
  status TEXT DEFAULT 'quote_requested' CHECK (
    status IN ('quote_requested', 'in_review', 'in_progress', 'preview_ready', 'approved', 'revision_requested', 'completed', 'cancelled')
  ),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 5000),
  needs_manual_review BOOLEAN DEFAULT FALSE,
  payment_method TEXT DEFAULT 'pay_after_quote_review' CHECK (payment_method = 'pay_after_quote_review'),
  expected_delivery_at TIMESTAMPTZ,
  assigned_artist TEXT CHECK (assigned_artist IS NULL OR char_length(assigned_artist) <= 160),
  source_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(status_history) = 'array' AND pg_column_size(status_history) <= 65536),
  revision_annotations JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(revision_annotations) = 'array' AND pg_column_size(revision_annotations) <= 32768),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Files (Uploads, Previews, Master Deliveries)
CREATE TABLE IF NOT EXISTS order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_category TEXT NOT NULL CHECK (file_category IN ('customer_upload', 'preview_watermarked', 'final_master', 'revision_ref')),
  format TEXT NOT NULL CHECK (format IN ('jpg', 'jpeg', 'png', 'ai', 'eps', 'svg', 'pdf', 'webp')),
  storage_path TEXT NOT NULL CHECK (char_length(storage_path) BETWEEN 1 AND 1024 AND position(chr(92) in storage_path) = 0 AND storage_path !~ '[[:cntrl:]]'),
  filename TEXT NOT NULL CHECK (char_length(filename) BETWEEN 1 AND 255 AND position('/' in filename) = 0 AND position(chr(92) in filename) = 0 AND filename !~ '[[:cntrl:]]'),
  size_bytes BIGINT CHECK (size_bytes IS NULL OR size_bytes BETWEEN 1 AND 52428800),
  scan_status TEXT NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'clean', 'infected', 'error')),
  scan_checked_at TIMESTAMPTZ,
  scan_result TEXT CHECK (scan_result IS NULL OR char_length(scan_result) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Messages / Revision Notes
CREATE TABLE IF NOT EXISTS order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'operator')),
  message TEXT NOT NULL CHECK (char_length(btrim(message)) BETWEEN 1 AND 5000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public marketing content, writable only by studio administrators.
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  hero_title TEXT NOT NULL CHECK (char_length(hero_title) BETWEEN 1 AND 200),
  hero_subtitle TEXT NOT NULL CHECK (char_length(hero_subtitle) BETWEEN 1 AND 1200),
  simple_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 25 CHECK (simple_tier_price BETWEEN 0 AND 10000),
  standard_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 45 CHECK (standard_tier_price BETWEEN 0 AND 10000),
  complex_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 75 CHECK (complex_tier_price BETWEEN 0 AND 10000),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 120),
  "clientType" TEXT CHECK ("clientType" IS NULL OR char_length("clientType") <= 160),
  badge TEXT CHECK (badge IS NULL OR char_length(badge) <= 120),
  "rasterUrl" TEXT NOT NULL CHECK (char_length("rasterUrl") <= 2048 AND "rasterUrl" ~ '^(https://|/[^/])' AND position(chr(92) in "rasterUrl") = 0 AND "rasterUrl" !~ '[[:cntrl:]]'),
  "vectorUrl" TEXT CHECK ("vectorUrl" IS NULL OR (char_length("vectorUrl") <= 2048 AND "vectorUrl" ~ '^(https://|/[^/])' AND position(chr(92) in "vectorUrl") = 0 AND "vectorUrl" !~ '[[:cntrl:]]')),
  "vectorSvgContent" TEXT CHECK ("vectorSvgContent" IS NULL OR char_length("vectorSvgContent") <= 100000),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 5000),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  stats JSONB CHECK (stats IS NULL OR (jsonb_typeof(stats) = 'object' AND pg_column_size(stats) <= 10000)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_files_scan_status ON order_files(scan_status);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATED PROFILE TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, account_type, company_name, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE WHEN new.raw_user_meta_data->>'account_type' = 'business' THEN 'business' ELSE 'individual' END,
    new.raw_user_meta_data->>'company_name',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Recalculate customer-submitted pricing and initial status in the database.
CREATE OR REPLACE FUNCTION public.enforce_order_insert_pricing()
RETURNS TRIGGER AS $$
DECLARE
  base_amount NUMERIC(10, 2);
  calculated_amount NUMERIC(10, 2);
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.user_id := auth.uid();
    NEW.assigned_artist := NULL;
  END IF;
  IF NEW.source_order_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.orders source_order
    WHERE source_order.id = NEW.source_order_id AND source_order.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Source order must belong to the same customer';
  END IF;
  NEW.order_number := 'ATX-' || replace(gen_random_uuid()::text, '-', '');
  SELECT CASE NEW.complexity
    WHEN 'simple' THEN simple_tier_price
    WHEN 'complex' THEN complex_tier_price
    ELSE standard_tier_price
  END INTO base_amount FROM public.site_settings WHERE id = 'current';

  base_amount := COALESCE(base_amount, CASE NEW.complexity WHEN 'simple' THEN 25 WHEN 'complex' THEN 75 ELSE 45 END);
  calculated_amount := base_amount;
  IF NEW.has_text THEN calculated_amount := calculated_amount + 15; END IF;
  IF NEW.reconstruction_level = 'heavy' THEN calculated_amount := calculated_amount + 35;
  ELSIF NEW.reconstruction_level = 'moderate' OR (NEW.reconstruction_level IS NULL AND NEW.reconstruction_needed) THEN
    calculated_amount := calculated_amount + 20;
  END IF;
  IF NEW.colors ILIKE '3-5%' THEN calculated_amount := calculated_amount + 5;
  ELSIF NEW.colors ILIKE '6+%' OR NEW.colors ILIKE 'gradient%' THEN calculated_amount := calculated_amount + 15;
  END IF;
  IF NEW.turnaround = 'express' THEN calculated_amount := ROUND(calculated_amount * 1.35); END IF;
  -- Canonical selection prevents duplicate charges; express applies only to vector work.
  NEW.agency_services := ARRAY(
    SELECT DISTINCT service FROM unnest(NEW.agency_services) AS service ORDER BY service
  );
  calculated_amount := calculated_amount + 50 * cardinality(NEW.agency_services);


  NEW.estimated_price := calculated_amount;
  NEW.final_price := calculated_amount;
  NEW.needs_manual_review := COALESCE(NEW.needs_manual_review, false)
    OR NEW.payment_method = 'pay_after_quote_review'
    OR (NEW.complexity = 'complex' AND NEW.reconstruction_needed AND NEW.has_text);
  -- Until a verified payment webhook exists, every new remote order requires studio review.
  NEW.status := 'quote_requested';
  NEW.revision_annotations := '[]'::jsonb;
  NEW.expected_delivery_at := COALESCE(NEW.created_at, NOW())
    + CASE WHEN NEW.turnaround = 'express' THEN INTERVAL '16 hours' ELSE INTERVAL '48 hours' END;
  NEW.status_history := jsonb_build_array(jsonb_build_object(
    'id', 'status_' || gen_random_uuid()::text, 'status', NEW.status,
    'created_at', COALESCE(NEW.created_at, NOW()), 'actor', 'customer'
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS enforce_order_insert_pricing ON public.orders;
CREATE TRIGGER enforce_order_insert_pricing BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_insert_pricing();

CREATE OR REPLACE FUNCTION public.append_order_status_history()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS zz_append_order_status_history ON public.orders;
CREATE TRIGGER zz_append_order_status_history BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.append_order_status_history();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) ON DATABASE TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Helper to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Client profile updates are limited to editable contact fields. Identity,
-- role, account classification, and audit timestamps are server-managed.
CREATE OR REPLACE FUNCTION public.protect_profile_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user = 'authenticated' AND NOT public.is_admin() AND
     (to_jsonb(NEW) - ARRAY['full_name', 'company_name', 'phone', 'vat_tax_id', 'updated_at']) IS DISTINCT FROM
     (to_jsonb(OLD) - ARRAY['full_name', 'company_name', 'phone', 'vat_tax_id', 'updated_at']) THEN
    RAISE EXCEPTION 'Only editable profile fields may be changed';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_profile_update ON public.profiles;
CREATE TRIGGER protect_profile_update BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_update();

-- Validate customer-controlled status changes and revision marker structure.
CREATE OR REPLACE FUNCTION public.protect_order_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE marker JSONB;
BEGIN
  IF NEW.revision_annotations IS NULL OR
     jsonb_typeof(NEW.revision_annotations) <> 'array' OR
     jsonb_array_length(NEW.revision_annotations) > 20 OR
     pg_column_size(NEW.revision_annotations) > 32768 THEN
    RAISE EXCEPTION 'Invalid revision annotations';
  END IF;
  FOR marker IN SELECT value FROM jsonb_array_elements(NEW.revision_annotations)
  LOOP
    IF jsonb_typeof(marker) <> 'object' OR
       jsonb_typeof(marker->'x') <> 'number' OR jsonb_typeof(marker->'y') <> 'number' OR
       (marker->>'x')::numeric < 0 OR (marker->>'x')::numeric > 100 OR
       (marker->>'y')::numeric < 0 OR (marker->>'y')::numeric > 100 OR
       char_length(btrim(COALESCE(marker->>'message', ''))) NOT BETWEEN 1 AND 1000 THEN
      RAISE EXCEPTION 'Invalid revision marker';
    END IF;
  END LOOP;

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

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON profiles;
CREATE POLICY "Users can view own profile or admins view all"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND (auth.uid() = id OR public.is_admin()));

DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON profiles;
CREATE POLICY "Users can update own profile or admins update all"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL AND (auth.uid() = id OR public.is_admin()))
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = id OR public.is_admin()));

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders or admins view all" ON orders;
CREATE POLICY "Users can view own orders or admins view all"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin()));

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders if pending or admins update any" ON orders;
CREATE POLICY "Users can update own orders if pending or admins update any"
  ON orders FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin()))
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR public.is_admin()));

-- Order Files Policies
DROP POLICY IF EXISTS "Users can view files for their orders or admins view all" ON order_files;
CREATE POLICY "Users can view files for their orders or admins view all"
  ON order_files FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_files.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users and admins can insert files for orders" ON order_files;
CREATE POLICY "Users and admins can insert files for orders"
  ON order_files FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin() OR (
      auth.uid() IS NOT NULL AND auth.uid() = user_id AND
      file_category IN ('customer_upload', 'revision_ref') AND
      storage_path LIKE auth.uid()::text || '/' || order_id::text || '/%' AND
      EXISTS (SELECT 1 FROM public.orders owned_order WHERE owned_order.id = order_id AND owned_order.user_id = auth.uid())
    )
  );

-- Order Messages Policies
DROP POLICY IF EXISTS "Users can view messages for their orders or admins view all" ON order_messages;
CREATE POLICY "Users can view messages for their orders or admins view all"
  ON order_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_messages.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users and admins can insert messages" ON order_messages;
CREATE POLICY "Users and admins can insert messages"
  ON order_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND sender_id = auth.uid() AND (
      public.is_admin() OR (
        sender_type = 'customer' AND
        EXISTS (SELECT 1 FROM public.orders owned_order WHERE owned_order.id = order_id AND owned_order.user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Anyone can read active portfolio items" ON portfolio_items;
CREATE POLICY "Anyone can read active portfolio items" ON portfolio_items FOR SELECT
  USING (active OR public.is_admin());
DROP POLICY IF EXISTS "Admins can manage portfolio items" ON portfolio_items;
CREATE POLICY "Admins can manage portfolio items" ON portfolio_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Commit customer order metadata and its uploaded file reference atomically.
CREATE OR REPLACE FUNCTION public.create_order_with_file(p_order JSONB, p_file JSONB DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  created_order public.orders;
  requested_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  requested_id := COALESCE((p_order->>'id')::UUID, gen_random_uuid());

  INSERT INTO public.orders (
    id, order_number, user_id, project_name, artwork_type, complexity, colors,
    has_text, reconstruction_needed, reconstruction_level, turnaround,
    estimated_price, final_price, status, notes, needs_manual_review,
    payment_method, source_order_id, agency_services
  ) VALUES (
    requested_id,
    'ATX-' || replace(requested_id::TEXT, '-', ''),
    auth.uid(),
    p_order->>'project_name',
    p_order->>'artwork_type',
    p_order->>'complexity',
    p_order->>'colors',
    COALESCE((p_order->>'has_text')::BOOLEAN, FALSE),
    COALESCE((p_order->>'reconstruction_needed')::BOOLEAN, FALSE),
    COALESCE(p_order->>'reconstruction_level', 'clean'),
    COALESCE(p_order->>'turnaround', 'standard'),
    COALESCE((p_order->>'estimated_price')::NUMERIC, 0),
    COALESCE((p_order->>'final_price')::NUMERIC, 0),
    'quote_requested',
    NULLIF(p_order->>'notes', ''),
    COALESCE((p_order->>'needs_manual_review')::BOOLEAN, FALSE),
    'pay_after_quote_review',
    NULLIF(p_order->>'source_order_id', '')::UUID,
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_order->'agency_services', '[]'::JSONB)))
  )
  RETURNING * INTO created_order;

  IF p_file IS NOT NULL THEN
    INSERT INTO public.order_files (
      order_id, user_id, file_category, format, storage_path, filename, size_bytes
    ) VALUES (
      created_order.id,
      auth.uid(),
      'customer_upload',
      p_file->>'format',
      p_file->>'storage_path',
      p_file->>'filename',
      (p_file->>'size_bytes')::BIGINT
    );
  END IF;

  RETURN created_order;
END;
$$;
REVOKE ALL ON FUNCTION public.create_order_with_file(JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_file(JSONB, JSONB) TO authenticated;

-- ==============================================================================
-- 6. STORAGE BUCKET CONFIGURATION & RLS POLICIES
-- ==============================================================================
-- Artlantix requires three distinct storage buckets:
-- 1. 'customer-assets': Private bucket for customer original uploads and revision references.
-- 2. 'previews': Private bucket for watermarked vector draft previews.
-- 3. 'master-deliveries': Private, strictly protected bucket. Master vector files (AI, EPS, SVG, PDF)
--    can only be accessed via temporary signed download URLs generated upon order completion.

-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('customer-assets', 'customer-assets', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('previews', 'previews', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']),
  ('master-deliveries', 'master-deliveries', false, 52428800, ARRAY['image/png', 'image/svg+xml', 'application/pdf', 'application/postscript', 'application/octet-stream']),
  ('portfolio', 'portfolio', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supabase owns storage.objects and already enforces RLS on this managed table.
-- Project roles must not attempt ALTER TABLE here.

-- ------------------------------------------------------------------------------
-- Bucket A: customer-assets (Private)
-- ------------------------------------------------------------------------------
-- Customers can upload their own artwork
DROP POLICY IF EXISTS "Authenticated users can upload customer-assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload customer-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'customer-assets' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

-- Customers can access their own originals. Operators can access only files
-- that a trusted malware scanner marked clean.
CREATE OR REPLACE FUNCTION public.can_admin_read_customer_asset(asset_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_admin() AND EXISTS (
    SELECT 1
    FROM public.order_files AS scanned
    WHERE scanned.storage_path = asset_path
      AND scanned.scan_status = 'clean'
  );
$$;
REVOKE ALL ON FUNCTION public.can_admin_read_customer_asset(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_admin_read_customer_asset(TEXT) TO authenticated;

DROP POLICY IF EXISTS "Users can read own customer-assets or admins read all" ON storage.objects;
CREATE POLICY "Users can read own customer-assets or admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'customer-assets' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.can_admin_read_customer_asset(name)
    )
  );

CREATE OR REPLACE FUNCTION public.customer_asset_is_attached(asset_path TEXT, owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT owner_id = auth.uid() AND EXISTS (
    SELECT 1
    FROM public.order_files AS attached
    WHERE attached.storage_path = asset_path
      AND attached.user_id = owner_id
  );
$$;
REVOKE ALL ON FUNCTION public.customer_asset_is_attached(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.customer_asset_is_attached(TEXT, UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can remove unattached customer uploads" ON storage.objects;
CREATE POLICY "Users can remove unattached customer uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'customer-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND NOT public.customer_asset_is_attached(name, auth.uid())
  );

-- ------------------------------------------------------------------------------
-- Bucket B: previews (Private / signed for watermarked drafts)
-- ------------------------------------------------------------------------------
-- Operators/Admins can upload previews
DROP POLICY IF EXISTS "Admins and operators can insert previews" ON storage.objects;
CREATE POLICY "Admins and operators can insert previews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'previews' AND public.is_admin()
  );

-- Clients can view previews stored below their own user-id folder; admins can view all.
DROP POLICY IF EXISTS "Users can read own previews or admins read all" ON storage.objects;
CREATE POLICY "Users can read own previews or admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'previews' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

-- ------------------------------------------------------------------------------
-- Bucket C: master-deliveries (Private, Strictly Protected)
-- Master vector files (AI, EPS, SVG, PDF) accessible ONLY via temporary signed URLs
-- generated upon order completion.
-- ------------------------------------------------------------------------------
-- Only operators/admins can upload final master packages
DROP POLICY IF EXISTS "Operators can upload master-deliveries" ON storage.objects;
CREATE POLICY "Operators can upload master-deliveries"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'master-deliveries' AND public.is_admin()
  );

-- Master files can only be accessed by the order owner if order is completed, or by an admin
CREATE OR REPLACE FUNCTION public.can_read_master_delivery(asset_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1
    FROM public.orders
    JOIN public.order_files ON public.order_files.order_id = public.orders.id
    WHERE public.orders.user_id = auth.uid()
      AND public.orders.status = 'completed'
      AND public.order_files.storage_path = asset_path
  );
$$;
REVOKE ALL ON FUNCTION public.can_read_master_delivery(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_master_delivery(TEXT) TO authenticated;

DROP POLICY IF EXISTS "Completed order clients or admins can read master-deliveries" ON storage.objects;
CREATE POLICY "Completed order clients or admins can read master-deliveries"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'master-deliveries'
    AND public.can_read_master_delivery(name)
  );

DROP POLICY IF EXISTS "Admins can upload portfolio media" ON storage.objects;
CREATE POLICY "Admins can upload portfolio media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
DROP POLICY IF EXISTS "Anyone can read portfolio media" ON storage.objects;
CREATE POLICY "Anyone can read portfolio media" ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Admins can update portfolio media" ON storage.objects;
CREATE POLICY "Admins can update portfolio media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin()) WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete portfolio media" ON storage.objects;
CREATE POLICY "Admins can delete portfolio media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());
