BEGIN;

-- Retire the old simulated card/invoice values. The launch product is an honest
-- quote-request workflow and never records an unverified payment as successful.
UPDATE public.orders
SET payment_method = 'pay_after_quote_review'
WHERE payment_method IS DISTINCT FROM 'pay_after_quote_review';
ALTER TABLE public.orders ALTER COLUMN payment_method SET DEFAULT 'pay_after_quote_review';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = 'pay_after_quote_review');

ALTER TABLE public.order_files ADD COLUMN IF NOT EXISTS scan_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.order_files ADD COLUMN IF NOT EXISTS scan_checked_at TIMESTAMPTZ;
ALTER TABLE public.order_files ADD COLUMN IF NOT EXISTS scan_result TEXT;
ALTER TABLE public.order_files DROP CONSTRAINT IF EXISTS order_files_scan_status_check;
ALTER TABLE public.order_files ADD CONSTRAINT order_files_scan_status_check
  CHECK (scan_status IN ('pending', 'clean', 'infected', 'error'));
ALTER TABLE public.order_files DROP CONSTRAINT IF EXISTS order_files_scan_result_check;
ALTER TABLE public.order_files ADD CONSTRAINT order_files_scan_result_check
  CHECK (scan_result IS NULL OR char_length(scan_result) <= 500);
CREATE INDEX IF NOT EXISTS idx_order_files_scan_status ON public.order_files(scan_status);
UPDATE public.order_files
SET scan_status = 'clean', scan_checked_at = COALESCE(scan_checked_at, NOW()), scan_result = 'trusted-studio-upload'
WHERE file_category IN ('preview_watermarked', 'final_master');

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
DROP POLICY IF EXISTS "Customers read own assets and admins read clean assets" ON storage.objects;
CREATE POLICY "Customers read own assets and admins read clean assets"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'customer-assets'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.can_admin_read_customer_asset(name)
  )
);

-- Customer upload cleanup is allowed only while no order_files row references it.
-- This lets the client compensate a failed transactional order creation without
-- letting customers remove source artwork already attached to an order.
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
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'customer-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND NOT public.customer_asset_is_attached(name, auth.uid())
);

-- Rebuild every storage rule so this migration can safely finish a partially
-- applied fresh-project bootstrap as well as upgrade an existing project.
DROP POLICY IF EXISTS "Authenticated users can upload customer-assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload customer-assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'customer-assets'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

DROP POLICY IF EXISTS "Admins and operators can insert previews" ON storage.objects;
CREATE POLICY "Admins and operators can insert previews"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'previews' AND public.is_admin());

DROP POLICY IF EXISTS "Users can read own previews or admins read all" ON storage.objects;
CREATE POLICY "Users can read own previews or admins read all"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'previews'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);

DROP POLICY IF EXISTS "Operators can upload master-deliveries" ON storage.objects;
CREATE POLICY "Operators can upload master-deliveries"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'master-deliveries' AND public.is_admin());

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
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'master-deliveries'
  AND public.can_read_master_delivery(name)
);

DROP POLICY IF EXISTS "Admins can upload portfolio media" ON storage.objects;
CREATE POLICY "Admins can upload portfolio media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
DROP POLICY IF EXISTS "Anyone can read portfolio media" ON storage.objects;
CREATE POLICY "Anyone can read portfolio media"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Admins can update portfolio media" ON storage.objects;
CREATE POLICY "Admins can update portfolio media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio' AND public.is_admin())
WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());
DROP POLICY IF EXISTS "Admins can delete portfolio media" ON storage.objects;
CREATE POLICY "Admins can delete portfolio media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
  RETURN new;
END;
$$;

-- Order metadata and its uploaded file reference are committed atomically. The
-- object upload happens first; callers remove that unattached object if this RPC
-- fails, using the narrowly-scoped policy above.
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
    payment_method, source_order_id
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
    NULLIF(p_order->>'source_order_id', '')::UUID
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

COMMIT;
