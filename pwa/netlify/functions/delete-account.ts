/**
 * Server-side account deletion (GDPR / Apple in-app deletion requirement).
 *
 * The caller must present their own valid Supabase access token; we verify it
 * against the auth server, then delete exactly that user with the service
 * key. SUPABASE_SECRET_KEY lives only in Netlify env - never in the client.
 */

const SUPABASE_URL = 'https://fmqdojgjxjtlkusxqnur.supabase.co';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'deletion not configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return new Response(JSON.stringify({ error: 'missing bearer token' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Whose token is this? (Verifies signature + expiry server-side.)
  const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: secret, authorization: `Bearer ${token}` },
  });
  if (!who.ok) {
    return new Response(JSON.stringify({ error: 'invalid session' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  const user = (await who.json()) as { id?: string };
  if (!user.id) {
    return new Response(JSON.stringify({ error: 'invalid session' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const del = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'DELETE',
    headers: { apikey: secret, authorization: `Bearer ${secret}` },
  });
  if (!del.ok) {
    const detail = await del.text();
    return new Response(JSON.stringify({ error: 'deletion failed', detail }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export const config = { path: '/api/delete-account' };
