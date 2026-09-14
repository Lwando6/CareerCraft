import { json, requireUser, adminUpsert } from './_shared.ts';

const plans = {
  starter: { amount: 4900, codeEnv: 'PAYSTACK_STARTER_PLAN_CODE' },
  pro: { amount: 9900, codeEnv: 'PAYSTACK_PRO_PLAN_CODE' }
} as const;

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const user = await requireUser(request);
    const { plan: slug } = await request.json();
    const plan = plans[slug as keyof typeof plans];
    if (!plan) return json({ error: 'Choose a valid paid plan.' }, 400);
    const secret = Netlify.env.get('PAYSTACK_SECRET_KEY');
    const planCode = Netlify.env.get(plan.codeEnv);
    if (!secret || !planCode) return json({ error: 'Checkout is not configured yet. Please contact CareerCraft support.' }, 503);
    const callback = `${new URL(request.url).origin}/payment-callback.html`;
    const paystack = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
      body: JSON.stringify({ email: user.email, plan: planCode, callback_url: callback, metadata: { user_id: user.id, plan_slug: slug } })
    });
    const payload = await paystack.json();
    if (!paystack.ok || !payload.status) return json({ error: payload.message || 'Paystack could not start checkout.' }, 502);
    await adminUpsert('subscriptions', { user_id: user.id, plan_slug: slug, status: 'pending', provider: 'paystack', updated_at: new Date().toISOString() }, 'user_id');
    return json({ authorization_url: payload.data.authorization_url, reference: payload.data.reference });
  } catch (error) {
    return json({ error: error instanceof Error && error.message === 'AUTH_REQUIRED' ? 'Please sign in again.' : 'Unable to start checkout.' }, error instanceof Error && error.message === 'AUTH_REQUIRED' ? 401 : 500);
  }
};
