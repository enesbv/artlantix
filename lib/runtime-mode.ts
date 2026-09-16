/**
 * Demo data is a development aid, never an implicit production fallback.
 * Set NEXT_PUBLIC_DEMO_MODE=true only for a deliberately isolated demo build.
 */
export function isDemoModeEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  }

  return process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
}

export const BACKEND_NOT_CONFIGURED_ERROR =
  'The service is not configured yet. Connect Supabase before accepting customer work.';
