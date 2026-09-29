BEGIN;

-- Operators record a deliverable and the matching status/price change in one
-- transaction, so a network failure can no longer leave a file row without the
-- status change (or the reverse). Runs as the caller, so RLS and the order
-- triggers still apply.
CREATE OR REPLACE FUNCTION public.record_operator_delivery(
  p_order_id UUID,
  p_status TEXT,
  p_final_price NUMERIC DEFAULT NULL,
  p_assigned_artist TEXT DEFAULT NULL,
  p_file JSONB DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  order_owner UUID;
  file_category TEXT;
  updated_order public.orders;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only the production team may record deliveries' USING ERRCODE = '42501';
  END IF;

  SELECT user_id INTO order_owner FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF order_owner IS NULL THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_file IS NOT NULL THEN
    file_category := p_file->>'file_category';
    IF file_category IS NULL OR file_category NOT IN ('preview_watermarked', 'final_master') THEN
      RAISE EXCEPTION 'Operators may only deliver previews or master files' USING ERRCODE = '22023';
    END IF;
    IF file_category = 'final_master' AND p_status <> 'completed' THEN
      RAISE EXCEPTION 'A master file is delivered together with completing the order' USING ERRCODE = '22023';
    END IF;
    IF (p_file->>'storage_path') NOT LIKE order_owner::TEXT || '/' || p_order_id::TEXT || '/%' THEN
      RAISE EXCEPTION 'Deliverable must be stored below the customer order folder' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.order_files (order_id, user_id, file_category, format, storage_path, filename, size_bytes, scan_status)
    VALUES (
      p_order_id,
      order_owner,
      file_category,
      p_file->>'format',
      p_file->>'storage_path',
      p_file->>'filename',
      NULLIF(p_file->>'size_bytes', '')::BIGINT,
      'clean'
    );
  END IF;

  UPDATE public.orders
  SET status = p_status,
      final_price = COALESCE(p_final_price, final_price),
      assigned_artist = COALESCE(p_assigned_artist, assigned_artist),
      updated_at = NOW()
  WHERE id = p_order_id
  RETURNING * INTO updated_order;

  RETURN updated_order;
END;
$$;
REVOKE ALL ON FUNCTION public.record_operator_delivery(UUID, TEXT, NUMERIC, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_operator_delivery(UUID, TEXT, NUMERIC, TEXT, JSONB) TO authenticated;

-- Compensation: when the RPC fails after the upload, the operator client removes
-- the stored object. Only objects that no order_files row references may go.
DROP POLICY IF EXISTS "Admins can remove unattached deliverables" ON storage.objects;
CREATE POLICY "Admins can remove unattached deliverables"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('previews', 'master-deliveries')
    AND public.is_admin()
    AND NOT EXISTS (SELECT 1 FROM public.order_files AS attached WHERE attached.storage_path = name)
  );

COMMIT;
