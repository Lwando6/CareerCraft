const supabaseUrl = () => Netlify.env.get('SUPABASE_URL') || '';
const publishableKey = () => Netlify.env.get('SUPABASE_PUBLISHABLE_KEY') || '';
const serviceKey = () => Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function requireUser(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) throw new Error('AUTH_REQUIRED');
  const response = await fetch(`${supabaseUrl()}/auth/v1/user`, { headers: { apikey: publishableKey(), authorization } });
  if (!response.ok) throw new Error('AUTH_REQUIRED');
  return response.json();
}

export async function adminUpsert(table: string, body: unknown, onConflict?: string) {
  const suffix = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}${suffix}`, {
    method: 'POST',
    headers: { apikey: serviceKey(), authorization: `Bearer ${serviceKey()}`, 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Database update failed: ${await response.text()}`);
  return response.json();
}

export async function adminPatch(table: string, filter: string, body: unknown) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { apikey: serviceKey(), authorization: `Bearer ${serviceKey()}`, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Database update failed: ${await response.text()}`);
}
