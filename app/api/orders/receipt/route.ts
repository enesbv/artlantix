import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const reply = (status: string, code: number) => NextResponse.json({ status }, { status: code, headers: { 'Cache-Control': 'no-store' } });
  if (request.headers.get('origin') !== request.nextUrl.origin) return reply('forbidden', 403);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.ORDER_EMAIL_FROM;
  if (!url || !publicKey || !apiKey || !sender || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return reply('unavailable', 503);
  try {
    if (Number(request.headers.get('content-length') || 0) > 1024) return reply('invalid', 413);
    const raw = await request.text();
    if (raw.length > 1024) return reply('invalid', 413);
    const { orderId } = JSON.parse(raw);
    if (typeof orderId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) return reply('invalid', 400);
    const cookieStore = await cookies();
    const supabase = createServerClient(url, publicKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email || !user.email_confirmed_at) return reply('unauthorized', 401);
    const { data: order, error } = await supabase.from('orders')
      .select('id, order_number, user_id, created_at').eq('id', orderId).eq('user_id', user.id).single();
    if (error || !order) return reply('not_found', 404);
    // Provider idempotency lasts 24 hours. Only allow this automatic receipt window.
    const age = Date.now() - Date.parse(order.created_at);
    if (!Number.isFinite(age) || age < 0 || age > 23 * 60 * 60 * 1000) return reply('expired', 409);
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin);
    const trackingUrl = new URL(`/dashboard/orders/${order.id}`, appUrl).toString();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `order-receipt/${order.id}` },
      body: JSON.stringify({
        from: sender, to: [user.email], subject: `Artlantix — ${order.order_number}`,
        text: `Sipariş talebinizi aldık.\n\nSipariş numaranız: ${order.order_number}\n\nSiparişinizi takip edin: ${trackingUrl}\n\nStüdyomuz dosyanızı inceleyip kapsam ve fiyatı onayınıza sunacaktır. Bu aşamada ödeme alınmamıştır.`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? reply('queued', 200) : reply('failed', 502);
  } catch {
    return reply('failed', 502);
  }
}
