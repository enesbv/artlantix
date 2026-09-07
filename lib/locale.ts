export function persistLocale(locale: string): void {
  document.cookie = `NEXT_LOCALE=${encodeURIComponent(locale)};path=/;max-age=31536000;SameSite=Lax`;
}
