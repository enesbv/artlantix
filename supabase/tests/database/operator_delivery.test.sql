-- record_operator_delivery writes the deliverable row and the order change atomically.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(13);

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'customer-a@example.test', '{"full_name":"Customer A"}'::jsonb),
  ('30000000-0000-0000-0000-000000000003', 'operator@example.test', '{"full_name":"Operator"}'::jsonb);
UPDATE public.profiles SET is_admin = true WHERE id = '30000000-0000-0000-0000-000000000003';

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT public.create_order_with_file(
  '{"id":"aaaaaaaa-0000-0000-0000-000000000001","project_name":"A logo","artwork_type":"lowres_logo","complexity":"standard","colors":"1-2 colors","has_text":false,"reconstruction_needed":false,"reconstruction_level":"clean","turnaround":"standard","estimated_price":45,"final_price":45,"needs_manual_review":false}'::jsonb,
  '{"format":"jpg","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/source.jpg","filename":"source.jpg","size_bytes":1024}'::jsonb
);

SELECT throws_ok($$
  SELECT public.record_operator_delivery('aaaaaaaa-0000-0000-0000-000000000001', 'completed', 1, NULL,
    '{"file_category":"final_master","format":"ai","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/m.ai","filename":"m.ai","size_bytes":10}'::jsonb)
$$, '42501', NULL, 'customers cannot record deliveries');

SET LOCAL "request.jwt.claims" = '{"sub":"30000000-0000-0000-0000-000000000003","role":"authenticated"}';

SELECT lives_ok($$
  SELECT public.record_operator_delivery('aaaaaaaa-0000-0000-0000-000000000001', 'preview_ready', 50, 'Studio',
    '{"file_category":"preview_watermarked","format":"png","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/p.png","filename":"p.png","size_bytes":10}'::jsonb)
$$, 'operator records a preview and status together');
SELECT is((SELECT status FROM public.orders WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'preview_ready', 'status changed with the preview');
SELECT is((SELECT final_price FROM public.orders WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'), 50::numeric, 'operator price saved with the preview');
SELECT is((SELECT count(*) FROM public.order_files WHERE file_category = 'preview_watermarked'), 1::bigint, 'preview row saved');
SELECT is((SELECT user_id FROM public.order_files WHERE file_category = 'preview_watermarked'), '10000000-0000-0000-0000-000000000001'::uuid, 'deliverable belongs to the order owner, not the operator');

SELECT throws_ok($$
  SELECT public.record_operator_delivery('aaaaaaaa-0000-0000-0000-000000000001', 'in_progress', NULL, NULL,
    '{"file_category":"final_master","format":"ai","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/m.ai","filename":"m.ai","size_bytes":10}'::jsonb)
$$, '22023', NULL, 'a master file requires completing the order');
SELECT throws_ok($$
  SELECT public.record_operator_delivery('aaaaaaaa-0000-0000-0000-000000000001', 'completed', NULL, NULL,
    '{"file_category":"final_master","format":"ai","storage_path":"20000000-0000-0000-0000-000000000002/other/m.ai","filename":"m.ai","size_bytes":10}'::jsonb)
$$, '22023', NULL, 'deliverables must live below the customer order folder');
SELECT throws_ok($$
  SELECT public.record_operator_delivery('aaaaaaaa-0000-0000-0000-000000000001', 'completed', NULL, NULL,
    '{"file_category":"final_master","format":"exe","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/m.exe","filename":"m.exe","size_bytes":10}'::jsonb)
$$, NULL, NULL, 'an invalid file aborts the whole update');
SELECT is((SELECT status FROM public.orders WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'preview_ready', 'failed delivery leaves the order status untouched');

SELECT lives_ok($$
  SELECT public.record_operator_delivery('aaaaaaaa-0000-0000-0000-000000000001', 'completed', NULL, NULL,
    '{"file_category":"final_master","format":"ai","storage_path":"10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/m.ai","filename":"m.ai","size_bytes":10}'::jsonb)
$$, 'operator delivers the master and completes the order in one call');

-- Compensation after a failed RPC: operators may remove only unattached deliverable objects.
RESET ROLE;
INSERT INTO storage.objects (bucket_id, name) VALUES
  ('master-deliveries', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/m.ai'),
  ('master-deliveries', '10000000-0000-0000-0000-000000000001/aaaaaaaa-0000-0000-0000-000000000001/failed.ai');
SET LOCAL ROLE authenticated;
SET LOCAL storage.allow_delete_query = 'true';
DELETE FROM storage.objects WHERE bucket_id = 'master-deliveries';
RESET ROLE;
SELECT is((SELECT count(*) FROM storage.objects WHERE name LIKE '%/failed.ai'), 0::bigint, 'operator can remove an unattached upload after a failed delivery');
SELECT is((SELECT count(*) FROM storage.objects WHERE name LIKE '%/m.ai'), 1::bigint, 'operator cannot remove a delivered master file');

SELECT * FROM finish();
ROLLBACK;
