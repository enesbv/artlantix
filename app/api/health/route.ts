import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isDemoModeEnabled } from '@/lib/runtime-mode';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendConfigured = isSupabaseConfigured();
  const demoMode = isDemoModeEnabled();
  const scannerConfigured = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.MALWARE_SCANNER_URL &&
    process.env.MALWARE_SCANNER_TOKEN
  );
  let scannerReachable = false;
  if (scannerConfigured) {
    try {
      const healthUrl = new URL(process.env.MALWARE_SCANNER_URL!);
      healthUrl.pathname = healthUrl.pathname.replace(/\/scan\/?$/, '/health');
      const response = await fetch(healthUrl, { cache: 'no-store', signal: AbortSignal.timeout(2_000) });
      scannerReachable = response.ok;
    } catch {
      scannerReachable = false;
    }
  }
  const productionReady = backendConfigured && scannerReachable && !demoMode;

  return NextResponse.json({
    status: productionReady ? 'ok' : 'configuration_required',
    backend: backendConfigured ? 'configured' : 'missing',
    uploadScanning: !scannerConfigured ? 'missing' : scannerReachable ? 'ready' : 'unreachable',
    demoMode,
    checkedAt: new Date().toISOString(),
  }, {
    status: productionReady ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
