import { json, requireUser, adminUpsert } from './_shared.ts';

const amounts = { starter: 4900, pro: 9900 } as const;

export default async (request: Request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  try {
    const user = await requireUser(request);
    const reference = new URL(request.url).searchParams.get('reference');
    if (!reference || !/^[A-Za-z0-9._=-]{5,100}$/.test(reference)) return json({ error: 'Invalid payment reference.' }, 400);
    const secret = Netlify.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) return json({ error: 'Payment verification is not configured.' }, 503);
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { authorization: `Bearer ${secret}` } });
    const payload = await response.json();
    const transaction = payload.data;
    const metadata = typeof transaction?.metadata === 'string' ? JSON.parse(transaction.metadata) : transaction?.metadata;
    const slug = metadata?.plan_slug as keyof typeof amounts;
    const valid = response.ok && payload.status && transaction?.status === 'success' && transaction?.currency === 'ZAR' && transaction?.amount === amounts[slug] && metadata?.user_id === user.id;
    if (!valid) return json({ error: 'Payment details did not match the selected subscription.' }, 400);
    const now = new Date();
    const periodEnd = new Date(now); periodEnd.setMonth(periodEnd.getMonth() + 1);
    await adminUpsert('payment_events', { reference, user_id: user.id, plan_slug: slug, amount: transaction.amount, currency: transaction.currency, status: transaction.status, provider_payload: transaction }, 'reference');
    await adminUpsert('subscriptions', { user_id: user.id, plan_slug: slug, status: 'active', provider: 'paystack', provider_customer_code: transaction.customer?.customer_code || null, current_period_end: periodEnd.toISOString(), updated_at: now.toISOString() }, 'user_id');
    return json({ success: true, plan: slug });
  } catch (error) {
    return json({ error: error instanceof Error && error.message === 'AUTH_REQUIRED' ? 'Please sign in again.' : 'Payment verification failed.' }, error instanceof Error && error.message === 'AUTH_REQUIRED' ? 401 : 500);
  }
};
