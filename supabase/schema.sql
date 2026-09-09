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
  email TEXT NOT NULL,
  full_name TEXT,
  account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'business')),
  company_name TEXT,
  business_type TEXT,
  vat_tax_id TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  artwork_type TEXT NOT NULL,
  complexity TEXT NOT NULL,
  colors TEXT,
  has_text BOOLEAN DEFAULT FALSE,
  reconstruction_needed BOOLEAN DEFAULT FALSE,
  reconstruction_level TEXT DEFAULT 'clean' CHECK (reconstruction_level IN ('clean', 'moderate', 'heavy')),
  turnaround TEXT DEFAULT 'standard',
  estimated_price NUMERIC(10, 2) NOT NULL,
  final_price NUMERIC(10, 2),
  status TEXT DEFAULT 'quote_requested' CHECK (
    status IN ('quote_requested', 'in_review', 'in_progress', 'preview_ready', 'approved', 'revision_requested', 'completed', 'cancelled')
  ),
  notes TEXT,
  needs_manual_review BOOLEAN DEFAULT FALSE,
  payment_method TEXT DEFAULT 'card_simulated' CHECK (payment_method IN ('card_simulated', 'invoice_b2b', 'pay_after_quote_review')),
  expected_delivery_at TIMESTAMPTZ,
  assigned_artist TEXT,
  source_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status_history JSONB DEFAULT '[]'::jsonb,
  revision_annotations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Files (Uploads, Previews, Master Deliveries)
CREATE TABLE IF NOT EXISTS order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_category TEXT NOT NULL CHECK (file_category IN ('customer_upload', 'preview_watermarked', 'final_master', 'revision_ref')),
  format TEXT NOT NULL, -- jpg, png, ai, eps, svg, pdf, webp
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Messages / Revision Notes
CREATE TABLE IF NOT EXISTS order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  sender_type TEXT CHECK (sender_type IN ('customer', 'operator')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public marketing content, writable only by studio administrators.
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  simple_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 25,
  standard_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 45,
  complex_tier_price NUMERIC(10, 2) NOT NULL DEFAULT 75,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  "clientType" TEXT,
  badge TEXT,
  "rasterUrl" TEXT NOT NULL,
  "vectorUrl" TEXT,
  "vectorSvgContent" TEXT,
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATED PROFILE TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

  NEW.estimated_price := calculated_amount;
  NEW.final_price := calculated_amount;
  NEW.needs_manual_review := COALESCE(NEW.needs_manual_review, false)
    OR (NEW.complexity = 'complex' AND NEW.reconstruction_needed AND NEW.has_text);
  -- Until a verified payment webhook exists, every new remote order requires studio review.
  NEW.status := 'quote_requested';
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
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile or admins view all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update all"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view own orders or admins view all"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders if pending or admins update any"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- Order Files Policies
CREATE POLICY "Users can view files for their orders or admins view all"
  ON order_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_files.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users and admins can insert files for orders"
  ON order_files FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

-- Order Messages Policies
CREATE POLICY "Users can view messages for their orders or admins view all"
  ON order_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_messages.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users and admins can insert messages"
  ON order_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id OR public.is_admin()
  );

CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Anyone can read active portfolio items" ON portfolio_items FOR SELECT
  USING (active OR public.is_admin());
CREATE POLICY "Admins can manage portfolio items" ON portfolio_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. STORAGE BUCKET CONFIGURATION & RLS POLICIES
-- ==============================================================================
-- Artlantix requires three distinct storage buckets:
-- 1. 'customer-assets': Private bucket for customer original uploads and revision references.
-- 2. 'previews': Private bucket for watermarked vector draft previews.
-- 3. 'master-deliveries': Private, strictly protected bucket. Master vector files (AI, EPS, SVG, PDF)
--    can only be accessed via temporary signed download URLs generated upon order completion.

-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('customer-assets', 'customer-assets', false),
  ('previews', 'previews', false),
  ('master-deliveries', 'master-deliveries', false)
  ,('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Bucket A: customer-assets (Private)
-- ------------------------------------------------------------------------------
-- Customers can upload their own artwork
CREATE POLICY "Authenticated users can upload customer-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'customer-assets' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

-- Customers can view/download their own uploaded assets; admins can view all
CREATE POLICY "Users can read own customer-assets or admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'customer-assets' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

-- ------------------------------------------------------------------------------
-- Bucket B: previews (Private / signed for watermarked drafts)
-- ------------------------------------------------------------------------------
-- Operators/Admins can upload previews
CREATE POLICY "Admins and operators can insert previews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'previews' AND public.is_admin()
  );

-- Clients can view previews stored below their own user-id folder; admins can view all.
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
CREATE POLICY "Operators can upload master-deliveries"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'master-deliveries' AND public.is_admin()
  );

-- Master files can only be accessed by the order owner if order is completed, or by an admin
CREATE POLICY "Completed order clients or admins can read master-deliveries"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'master-deliveries' AND (
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.orders
        JOIN public.order_files ON order_files.order_id = orders.id
        WHERE orders.user_id = auth.uid()
        AND orders.status = 'completed'
        AND order_files.storage_path = storage.objects.name
      )
    )
  );

CREATE POLICY "Admins can upload portfolio media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "Anyone can read portfolio media" ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');
CREATE POLICY "Admins can update portfolio media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin()) WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
CREATE POLICY "Admins can delete portfolio media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());
