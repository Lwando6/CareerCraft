import { supabase } from './auth.js';

async function verify() {
  const reference = new URLSearchParams(location.search).get('reference') || new URLSearchParams(location.search).get('trxref');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return location.replace(`login.html?next=payment-callback.html`);
  if (!reference) return show(false, 'Payment reference missing', 'Return to pricing and try again.');
  try {
    const response = await fetch(`/.netlify/functions/verify-payment?reference=${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Payment could not be confirmed.');
    show(true, 'Subscription activated', `Your ${result.plan} plan is ready. Welcome to CareerCraft.`);
  } catch (error) { show(false, 'We could not confirm payment', `${error.message} If you were charged, contact support with your reference: ${reference}`); }
}

function show(success, title, text) {
  document.getElementById('paymentIcon').textContent = success ? '✓' : '!';
  document.getElementById('paymentIcon').className = `mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`;
  document.getElementById('paymentTitle').textContent = title;
  document.getElementById('paymentMessage').textContent = text;
  document.getElementById('paymentAction').classList.remove('hidden');
  document.getElementById('paymentAction').classList.add('inline-block');
}
verify();
