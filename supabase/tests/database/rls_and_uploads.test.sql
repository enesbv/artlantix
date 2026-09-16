BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(13);

SELECT has_table('public', 'orders', 'orders table exists');
SELECT has_table('public', 'order_files', 'order_files table exists');
SELECT has_column('public', 'order_files', 'scan_status', 'order files carry malware scan state');
SELECT has_function('public', 'create_order_with_file', ARRAY['jsonb', 'jsonb'], 'atomic order creation RPC exists');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.orders'::regclass), 'orders RLS is enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.order_files'::regclass), 'order_files RLS is enabled');
SELECT is((SELECT public FROM storage.buckets WHERE id = 'customer-assets'), false, 'customer assets bucket is private');

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'customer-a@example.test', '{"full_name":"Customer A"}'::jsonb),
  ('20000000-0000-0000-0000-000000000002', 'customer-b@example.test', '{"full_name":"Customer B"}'::jsonb),
  ('30000000-0000-0000-0000-000000000003', 'operator@example.test', '{"full_name":"Operator"}'::jsonb);
UPDATE public.profiles SET is_admin = true WHERE id = '30000000-0000-0000-0000-000000000003';

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';

SELECT lives_ok($test$
  SELECT public.create_order_with_file(
    '{
      "id":"aaaaaaaa-0000-0000-0000-000000000001",
      "project_name":"Tenant isolation test",
      "artwork_type":"lowres_logo",
      "complexity":"standard",
      "colors":"3-5 colors",
      "has_text":true,
      "reconstruction_needed":true,
      "reconstruction_level":"moderate",
      "turnaround":"standard",
      "estimated_price":45,
      "final_price":45,
      "needs_manual_review":true
    }'::jsonb,
    '{
      "format":"jpg",
      "storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/source.jpg",
      "filename":"source.jpg",
      "size_bytes":1024
    }'::jsonb
  )
$test$, 'customer can atomically create an owned quote and file row');
SELECT is((SELECT count(*) FROM public.orders), 1::bigint, 'customer sees the owned order');
SELECT is((SELECT count(*) FROM public.order_files), 1::bigint, 'customer sees the owned file row');
SELECT is((SELECT scan_status FROM public.order_files LIMIT 1), 'pending', 'customer upload starts quarantined');

SET LOCAL "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.orders), 0::bigint, 'second customer cannot see the first customer order');
SELECT is((SELECT count(*) FROM public.order_files), 0::bigint, 'second customer cannot see the first customer file row');

SET LOCAL "request.jwt.claims" = '{"sub":"30000000-0000-0000-0000-000000000003","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.orders), 1::bigint, 'administrator can see the production queue');

SELECT * FROM finish();
ROLLBACK;
