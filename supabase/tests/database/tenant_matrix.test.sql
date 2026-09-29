-- Allow/deny matrix for two customers and one operator across tables and private buckets.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(26);

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'customer-a@example.test', '{"full_name":"Customer A"}'::jsonb),
  ('20000000-0000-0000-0000-000000000002', 'customer-b@example.test', '{"full_name":"Customer B"}'::jsonb),
  ('30000000-0000-0000-0000-000000000003', 'operator@example.test', '{"full_name":"Operator"}'::jsonb);
UPDATE public.profiles SET is_admin = true WHERE id = '30000000-0000-0000-0000-000000000003';

-- Each customer creates one quote with an uploaded source file.
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT public.create_order_with_file(
  '{"id":"aaaaaaaa-0000-0000-0000-000000000001","project_name":"A logo","artwork_type":"lowres_logo","complexity":"standard","colors":"3-5 colors","has_text":true,"reconstruction_needed":true,"reconstruction_level":"moderate","turnaround":"standard","estimated_price":45,"final_price":45,"needs_manual_review":false}'::jsonb,
  '{"format":"jpg","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/source.jpg","filename":"source.jpg","size_bytes":1024}'::jsonb
);
SET LOCAL "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT public.create_order_with_file(
  '{"id":"bbbbbbbb-0000-0000-0000-000000000002","project_name":"B logo","artwork_type":"ai_logo","complexity":"simple","colors":"1-2 colors","has_text":false,"reconstruction_needed":false,"reconstruction_level":"clean","turnaround":"standard","estimated_price":25,"final_price":25,"needs_manual_review":false}'::jsonb,
  '{"format":"png","storage_path":"20000000-0000-0000-0000-000000000002/bbbbbbbb-0000-0000-0000-000000000002/source.png","filename":"source.png","size_bytes":2048}'::jsonb
);
RESET ROLE;

-- Storage objects that the uploads and deliveries would have created.
INSERT INTO storage.objects (bucket_id, name) VALUES
  ('customer-assets', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/source.jpg'),
  ('customer-assets', '20000000-0000-0000-0000-000000000002/bbbbbbbb-0000-0000-0000-000000000002/source.png'),
  ('customer-assets', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/orphan.jpg'),
  ('previews', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/preview.png'),
  ('master-deliveries', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/master.ai');
INSERT INTO public.order_files (order_id, user_id, file_category, format, storage_path, filename, size_bytes)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'final_master', 'ai',
        '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/master.ai', 'master.ai', 4096);

-- Anonymous visitors see nothing private.
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" = '{"role":"anon"}';
SELECT is((SELECT count(*) FROM public.orders), 0::bigint, 'anon cannot list orders');
SELECT is((SELECT count(*) FROM public.profiles), 0::bigint, 'anon cannot list profiles');
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id <> 'portfolio'), 0::bigint, 'anon cannot list private objects');
RESET ROLE;

-- Customer A.
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.profiles), 1::bigint, 'customer sees only their own profile');
SELECT throws_ok($$ UPDATE public.profiles SET is_admin = true WHERE id = auth.uid() $$, NULL, NULL, 'customer cannot grant themselves admin');
SELECT is((SELECT final_price FROM public.orders WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'), 85::numeric, 'database recalculates the client-sent price (45 -> 85)');
SELECT throws_ok($$ UPDATE public.orders SET final_price = 1 WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001' $$, NULL, NULL, 'customer cannot change the agreed price');
SELECT throws_ok($$ UPDATE public.orders SET status = 'completed' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001' $$, NULL, NULL, 'customer cannot mark their order completed');
SELECT is((SELECT count(*) FROM public.orders WHERE id = 'bbbbbbbb-0000-0000-0000-000000000002'), 0::bigint, 'customer cannot read another tenant order');
UPDATE public.orders SET project_name = 'hijacked' WHERE id = 'bbbbbbbb-0000-0000-0000-000000000002';
SELECT lives_ok($$ INSERT INTO public.order_messages (order_id, sender_id, sender_type, message) VALUES ('aaaaaaaa-0000-0000-0000-000000000001', auth.uid(), 'customer', 'Hello studio') $$, 'customer can message the studio on their own order');
SELECT throws_ok($$ INSERT INTO public.order_messages (order_id, sender_id, sender_type, message) VALUES ('bbbbbbbb-0000-0000-0000-000000000002', auth.uid(), 'customer', 'Snooping') $$, '42501', NULL, 'customer cannot message on another tenant order');
SELECT throws_ok($$ INSERT INTO public.order_messages (order_id, sender_id, sender_type, message) VALUES ('aaaaaaaa-0000-0000-0000-000000000001', auth.uid(), 'operator', 'Fake operator') $$, '42501', NULL, 'customer cannot post as the studio');
SELECT throws_ok($$ INSERT INTO public.order_files (order_id, user_id, file_category, format, storage_path, filename, size_bytes) VALUES ('bbbbbbbb-0000-0000-0000-000000000002', auth.uid(), 'customer_upload', 'jpg', '10000000-0000-0000-0000-000000000001/bbbbbbbb-0000-0000-0000-000000000002/x.jpg', 'x.jpg', 10) $$, '42501', NULL, 'customer cannot attach files to another tenant order');
SELECT throws_ok($$ INSERT INTO public.order_files (order_id, user_id, file_category, format, storage_path, filename, size_bytes) VALUES ('aaaaaaaa-0000-0000-0000-000000000001', auth.uid(), 'final_master', 'ai', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/fake.ai', 'fake.ai', 10) $$, '42501', NULL, 'customer cannot register a master deliverable');
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'customer-assets'), 2::bigint, 'customer lists only their own uploads');
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'previews'), 1::bigint, 'customer can read their own preview');
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'master-deliveries'), 0::bigint, 'master file stays locked until the order is completed');
-- The Storage API sets this flag and then relies on RLS for the delete.
SET LOCAL storage.allow_delete_query = 'true';
DELETE FROM storage.objects WHERE bucket_id = 'customer-assets' AND name LIKE '%/source.jpg';
DELETE FROM storage.objects WHERE bucket_id = 'customer-assets' AND name LIKE '%/orphan.jpg';
RESET ROLE;
SELECT is((SELECT count(*) FROM storage.objects WHERE name LIKE '%/aaaaaaaa-0000-0000-0000-000000000001/source.jpg'), 1::bigint, 'customer cannot delete an upload attached to an order');
SELECT is((SELECT count(*) FROM storage.objects WHERE name LIKE '%/orphan.jpg'), 0::bigint, 'customer can clean up an unattached failed upload');
SELECT is((SELECT project_name FROM public.orders WHERE id = 'bbbbbbbb-0000-0000-0000-000000000002'), 'B logo', 'cross-tenant order update is silently filtered');

-- Customer B.
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT is((SELECT count(*) FROM public.order_messages), 0::bigint, 'second customer cannot read the first customer messages');
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id IN ('previews', 'master-deliveries')), 0::bigint, 'second customer cannot read the first customer previews or masters');
RESET ROLE;

-- Operator: quarantined uploads stay closed until the scan is clean.
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"30000000-0000-0000-0000-000000000003","role":"authenticated"}';
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'customer-assets'), 0::bigint, 'operator cannot open uploads that are still pending a scan');
RESET ROLE;
UPDATE public.order_files SET scan_status = 'clean' WHERE storage_path LIKE '%/source.jpg';
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'customer-assets'), 1::bigint, 'operator can open an upload once it is scanned clean');
RESET ROLE;

-- Completing the order unlocks the master file for its owner only.
UPDATE public.orders SET status = 'completed' WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001';
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'master-deliveries'), 1::bigint, 'owner can read the master file after completion');
SET LOCAL "request.jwt.claims" = '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}';
SELECT is((SELECT count(*) FROM storage.objects WHERE bucket_id = 'master-deliveries'), 0::bigint, 'other customers still cannot read the master file');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
