import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function scannerConfiguration() {
  const url = process.env.MALWARE_SCANNER_URL;
  const token = process.env.MALWARE_SCANNER_TOKEN;
  if (!url || !token) throw new Error('Malware scanner is not configured.');
  const parsed = new URL(url);
  const localHost = ['127.0.0.1', 'localhost', 'scanner'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !localHost) {
    throw new Error('Malware scanner must use HTTPS unless it is on the private local network.');
  }
  return { url: parsed.toString(), token };
}

export async function POST(request: NextRequest) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return NextResponse.json({ error: 'Unsupported request.' }, { status: 415 });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Upload security service is unavailable.' }, { status: 503 });
  }

  let orderId = '';
  try {
    const body = await request.json() as { orderId?: unknown };
    orderId = typeof body.orderId === 'string' ? body.orderId : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => undefined,
    },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { data: file, error: fileError } = await userClient
    .from('order_files')
    .select('id, order_id, storage_path, filename, scan_status')
    .eq('order_id', orderId)
    .eq('file_category', 'customer_upload')
    .single();
  if (fileError || !file) return NextResponse.json({ error: 'Upload not found.' }, { status: 404 });
  if (file.scan_status === 'clean') return NextResponse.json({ status: 'clean' });

  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const scanner = scannerConfiguration();
    await admin.from('order_files').update({ scan_status: 'pending', scan_result: null }).eq('id', file.id);
    const { data: object, error: downloadError } = await admin.storage.from('customer-assets').download(file.storage_path);
    if (downloadError || !object) throw new Error('Quarantined object could not be read.');
    if (object.size > 2 * 1024 * 1024) throw new Error('Quarantined object exceeds the upload limit.');

    const scanResponse = await fetch(scanner.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${scanner.token}`,
        'Content-Type': 'application/octet-stream',
        'X-Upload-Filename': encodeURIComponent(file.filename),
      },
      body: Buffer.from(await object.arrayBuffer()),
      signal: AbortSignal.timeout(30_000),
    });
    if (!scanResponse.ok) throw new Error('Scanner rejected the request.');
    const result = await scanResponse.json() as { clean?: unknown; threat?: unknown };
    if (typeof result.clean !== 'boolean') throw new Error('Scanner returned an invalid result.');
    const checkedAt = new Date().toISOString();
    const scanResult = typeof result.threat === 'string'
      ? result.threat.slice(0, 500)
      : (result.clean ? 'clamav-clean' : 'malware-detected');

    if (!result.clean) {
      await admin.storage.from('customer-assets').remove([file.storage_path]);
      await admin.from('order_files').update({
        scan_status: 'infected', scan_checked_at: checkedAt, scan_result: scanResult,
      }).eq('id', file.id);
      return NextResponse.json({ status: 'infected' }, { status: 422 });
    }

    await admin.from('order_files').update({
      scan_status: 'clean', scan_checked_at: checkedAt, scan_result: scanResult,
    }).eq('id', file.id);
    return NextResponse.json({ status: 'clean' });
  } catch {
    await admin.from('order_files').update({
      scan_status: 'error',
      scan_checked_at: new Date().toISOString(),
      scan_result: 'scan-unavailable',
    }).eq('id', file.id);
    return NextResponse.json({ error: 'The upload remains quarantined because scanning failed.' }, { status: 502 });
  }
}
