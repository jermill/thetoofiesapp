/** Client-side auth input validation. Server-side enforcement is Supabase's. */

export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const DISPLAY_NAME_MAX = 40;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().slice(0, EMAIL_MAX);
}

export function isValidEmail(raw: string): boolean {
  return EMAIL_RE.test(normalizeEmail(raw));
}

export function isValidPassword(pw: string): boolean {
  return pw.length >= PASSWORD_MIN && pw.length <= PASSWORD_MAX;
}

export function normalizeDisplayName(raw: string, fallback = 'Friend'): string {
  const name = raw.trim().slice(0, DISPLAY_NAME_MAX);
  return name || fallback;
}
