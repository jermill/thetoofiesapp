import { describe, expect, it } from 'vitest';

import {
  DISPLAY_NAME_MAX,
  EMAIL_MAX,
  isValidEmail,
  isValidPassword,
  normalizeDisplayName,
  normalizeEmail,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from './validate';

describe('email', () => {
  it('accepts normal addresses', () => {
    expect(isValidEmail('danny@toofies.app')).toBe(true);
    expect(isValidEmail('  spaced@mail.co  ')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a b@mail.com')).toBe(false);
  });

  it('caps length', () => {
    const long = `${'a'.repeat(EMAIL_MAX)}@mail.com`;
    expect(normalizeEmail(long).length).toBe(EMAIL_MAX);
  });
});

describe('password', () => {
  it('enforces 8..128', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('a'.repeat(PASSWORD_MIN))).toBe(true);
    expect(isValidPassword('a'.repeat(PASSWORD_MAX))).toBe(true);
    expect(isValidPassword('a'.repeat(PASSWORD_MAX + 1))).toBe(false);
  });
});

describe('display name', () => {
  it('trims, caps, and falls back', () => {
    expect(normalizeDisplayName('  Danny  ')).toBe('Danny');
    expect(normalizeDisplayName('')).toBe('Friend');
    expect(normalizeDisplayName('x'.repeat(100)).length).toBe(DISPLAY_NAME_MAX);
  });
});
