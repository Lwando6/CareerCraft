import { supabase } from './auth.js';

const plans = {
  starter: { name: 'Starter', price: 'R49 / month', benefits: ['All six CV templates', 'Saved CVs and PDF export', 'Full career prompt library'] },
  pro: { name: 'Pro', price: 'R99 / month', benefits: ['Everything in Starter', 'Tech CV and portfolio tools', 'LinkedIn and personal-brand resources'] }
};
const saved = JSON.parse(localStorage.getItem('careercraft-selected-plan') || 'null');
const slug = new URLSearchParams(location.search).get('plan') || saved?.slug;
const plan = plans[slug];
const button = document.getElementById('payButton');
const status = document.getElementById('checkoutStatus');

function message(text, success = false) {
  status.textContent = text;
  status.className = `mt-4 rounded-lg border px-3 py-2 text-sm ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`;
}

async function initialise() {
  if (!plan) return location.replace('pricing.html');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return location.replace('login.html?next=checkout.html');
  document.getElementById('checkoutPlanName').textContent = plan.name;
  document.getElementById('checkoutPlanPrice').textContent = plan.price;
  document.getElementById('checkoutEmail').textContent = session.user.email;
  document.getElementById('checkoutBenefits').innerHTML = plan.benefits.map(item => `<li>✓ ${item}</li>`).join('');

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Opening Paystack…';
    try {
      const response = await fetch('/.netlify/functions/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan: slug })
      });
      const result = await response.json();
      if (!response.ok || !result.authorization_url) throw new Error(result.error || 'Could not start checkout.');
      location.href = result.authorization_url;
    } catch (error) {
      message(error.message);
      button.disabled = false;
      button.textContent = 'Try secure payment again';
    }
  });
}

initialise();
