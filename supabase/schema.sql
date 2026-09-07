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
  turnaround TEXT DEFAULT 'standard',
  estimated_price NUMERIC(10, 2) NOT NULL,
  final_price NUMERIC(10, 2),
  status TEXT DEFAULT 'quote_requested' CHECK (
    status IN ('quote_requested', 'in_review', 'in_progress', 'preview_ready', 'revision_requested', 'completed', 'cancelled')
  ),
  notes TEXT,
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

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) ON DATABASE TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;

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

-- ==============================================================================
-- 6. STORAGE BUCKET CONFIGURATION & RLS POLICIES
-- ==============================================================================
-- Artlantix requires three distinct storage buckets:
-- 1. 'customer-assets': Private bucket for customer original uploads and revision references.
-- 2. 'previews': Public or signed-access bucket for watermarked vector draft previews.
-- 3. 'master-deliveries': Private, strictly protected bucket. Master vector files (AI, EPS, SVG, PDF)
--    can only be accessed via temporary signed download URLs generated upon order completion.

-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('customer-assets', 'customer-assets', false),
  ('previews', 'previews', true),
  ('master-deliveries', 'master-deliveries', false)
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
-- Bucket B: previews (Public / Signed for watermarked drafts)
-- ------------------------------------------------------------------------------
-- Operators/Admins can upload previews
CREATE POLICY "Admins and operators can insert previews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'previews' AND public.is_admin()
  );

-- Clients can view watermarked previews
CREATE POLICY "Anyone can view watermarked previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'previews');

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
