/**
 * Supabase client (D4/D5: accounts + backend ratified 2026-07-15).
 * Only the publishable key ships to the client - the secret key must
 * never appear in this repo or bundle. Dessert logs remain on-device;
 * the backend currently handles auth only (sync scope still open).
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://fmqdojgjxjtlkusxqnur.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_-7NtINFQPnbmZVwne3s-QQ_PQaPd_lx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}
