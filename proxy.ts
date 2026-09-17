import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

const handleI18n = createMiddleware(routing);

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/tr1') return NextResponse.next();
  return handleI18n(request);
}

export const config = {
  matcher: [
    // Match root
    '/',
    // Match locales explicitly
    '/(en|de|tr)/:path*',
    // Match all pathnames except for static files, api, admin, dashboard, etc.
    '/((?!api|_next|_vercel|admin|dashboard|login|signup|reset-password|auth|mock-assets|.*\\..*).*)',
  ],
};
