import { json, adminPatch } from './_shared.ts';

const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
const same = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
};

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  const secret = Netlify.env.get('PAYSTACK_SECRET_KEY');
  if (!secret) return json({ error: 'Webhook is not configured.' }, 503);
  const raw = await request.text();
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const signature = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)));
  if (!same(signature, request.headers.get('x-paystack-signature') || '')) return json({ error: 'Invalid signature.' }, 401);
  const event = JSON.parse(raw);
  const customerCode = event.data?.customer?.customer_code || event.data?.customer?.code;
  if (!customerCode) return json({ received: true });
  const filter = `provider_customer_code=eq.${encodeURIComponent(customerCode)}`;
  if (event.event === 'invoice.payment_failed') await adminPatch('subscriptions', filter, { status: 'past_due', updated_at: new Date().toISOString() });
  if (event.event === 'subscription.disable') await adminPatch('subscriptions', filter, { status: 'cancelled', updated_at: new Date().toISOString() });
  if (event.event === 'subscription.create') await adminPatch('subscriptions', filter, { status: 'active', provider_subscription_code: event.data.subscription_code || null, updated_at: new Date().toISOString() });
  if (event.event === 'charge.success') {
    const periodEnd = new Date(); periodEnd.setMonth(periodEnd.getMonth() + 1);
    await adminPatch('subscriptions', filter, { status: 'active', current_period_end: periodEnd.toISOString(), updated_at: new Date().toISOString() });
  }
  return json({ received: true });
};
