BEGIN;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS agency_services TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_agency_services_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_agency_services_check CHECK (
  cardinality(agency_services) <= 3
  AND array_position(agency_services, NULL) IS NULL
  AND agency_services <@ ARRAY['brand-identity', 'alternative-logo', 'social-media-kit']::TEXT[]
);
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
COMMIT;
