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

const planRank = { free: 0, starter: 1, pro: 2 } as const;

export async function requirePlan(request: Request, minimum: keyof typeof planRank) {
  const user = await requireUser(request);
  const authorization = request.headers.get('authorization') || '';
  const response = await fetch(`${supabaseUrl()}/rest/v1/subscriptions?select=plan_slug,status,current_period_end&user_id=eq.${encodeURIComponent(user.id)}&limit=1`, {
    headers: { apikey: publishableKey(), authorization }
  });
  if (!response.ok) throw new Error('SUBSCRIPTION_LOOKUP_FAILED');
  const [subscription] = await response.json();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const isActive = subscription?.status === 'active' && (!periodEnd || periodEnd.getTime() > Date.now());
  const plan = isActive && (subscription.plan_slug === 'starter' || subscription.plan_slug === 'pro') ? subscription.plan_slug : 'free';
  if (planRank[plan] < planRank[minimum]) throw new Error(`PLAN_REQUIRED:${minimum}`);
  return { user, plan };
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
