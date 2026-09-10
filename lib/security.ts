const INTERNAL_ORIGIN = 'https://artlantix.invalid';

const AUTHENTICATED_DESTINATIONS = ['/dashboard', '/admin'] as const;

export const INPUT_LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  project: 160,
  notes: 5000,
  message: 5000,
  filename: 255,
  revisionMarkers: 20,
  revisionMessage: 1000,
  heroTitle: 200,
  heroSubtitle: 1200,
  portfolioTitle: 200,
  portfolioCategory: 120,
  portfolioClientType: 160,
  portfolioBadge: 120,
  portfolioDescription: 5000,
  mediaUrl: 2048,
  portfolioStats: 10000,
} as const;

export const PUBLIC_AUTH_ERRORS = {
  signIn: 'Unable to sign in. Check your credentials and try again.',
  signUp: 'Unable to create the account. Check your details or sign in instead.',
  oauth: 'Unable to start Google sign-in. Please try again.',
  profile: 'Your profile could not be updated. Please try again.',
  passwordUpdate: 'Your password could not be updated. Request a new recovery link and try again.',
} as const;

export const PASSWORD_RESET_RESPONSE =
  'If an account exists for that email, a password reset link has been sent.';

function isAllowedDestination(pathname: string): boolean {
  return AUTHENTICATED_DESTINATIONS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Converts a user-controlled post-authentication destination into an allowlisted
 * same-origin path. URL parsing is intentional: browsers normalize backslashes in
 * special URLs, so string-prefix checks alone are not sufficient.
 */
export function getSafePostAuthRedirect(
  requestedPath: string | null | undefined,
  fallback = '/dashboard/orders'
): string {
  if (!requestedPath || /[\\\u0000-\u001F\u007F]/.test(requestedPath)) return fallback;

  try {
    const base = new URL(INTERNAL_ORIGIN);
    const target = new URL(requestedPath, base);
    let decodedPathname = target.pathname;

    for (let index = 0; index < 2; index += 1) {
      const decoded = decodeURIComponent(decodedPathname);
      if (decoded === decodedPathname) break;
      decodedPathname = decoded;
    }

    if (
      target.origin !== base.origin ||
      !requestedPath.startsWith('/') ||
      requestedPath.startsWith('//') ||
      /[\\\u0000-\u001F\u007F]/.test(decodedPathname) ||
      !isAllowedDestination(decodedPathname)
    ) {
      return fallback;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export function normalizeRequiredText(value: string, field: string, maxLength: number): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required.`);
  if (normalized.length > maxLength) throw new Error(`${field} is too long.`);
  return normalized;
}

export function normalizeOptionalText(value: string | undefined, field: string, maxLength: number): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${field} is too long.`);
  return normalized || undefined;
}

export function normalizeEmail(value: string): string {
  const email = normalizeRequiredText(value, 'Email', INPUT_LIMITS.email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  return email;
}

export function normalizeFilename(value: string): string {
  const filename = normalizeRequiredText(value, 'Filename', INPUT_LIMITS.filename);
  if (filename === '.' || filename === '..' || /[\/\\\u0000-\u001F\u007F]/.test(filename)) {
    throw new Error('The filename contains unsafe characters.');
  }
  return filename;
}

export function normalizePrice(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 10000) {
    throw new Error(`${field} must be between 0 and 10,000.`);
  }
  return Math.round(value * 100) / 100;
}

export function normalizeMediaUrl(value: string, allowDataImage = false): string {
  const url = normalizeRequiredText(value, 'Media URL', INPUT_LIMITS.mediaUrl);
  if (/[\\\u0000-\u001F\u007F]/.test(url)) throw new Error('The media URL is invalid.');
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (allowDataImage && /^data:image\/(?:jpeg|png|webp);base64,/i.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return parsed.toString();
  } catch {
    // Handled by the generic public validation error below.
  }
  throw new Error('Media URLs must use HTTPS or an internal path.');
}
