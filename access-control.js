import { currentUser, getEffectivePlan } from './auth.js';

const rank = { guest: -1, free: 0, starter: 1, pro: 2 };
const requirements = {
    portfolio: { plan: 'pro', name: 'GitHub Portfolio Integration' },
    linkedin: { plan: 'pro', name: 'LinkedIn AI Toolkit' },
    prompts: { plan: 'free', name: 'Career Prompt Builder' }
};

export async function getAccess() {
    const user = await currentUser();
    const plan = await getEffectivePlan(user);
    return { user, plan, rank: rank[plan] ?? -1 };
}

function gateMarkup(name, plan, signedIn) {
    const label = plan === 'pro' ? 'Pro' : plan === 'starter' ? 'Starter' : 'Free';
    const destination = signedIn ? `pricing.html?required=${plan}` : `login.html?next=pricing.html`;
    return `<section class="mx-auto my-16 max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl sm:p-12"><div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-2xl text-amber-700"><i class="fa-solid fa-lock"></i></div><p class="mt-6 text-xs font-black uppercase tracking-[.2em] text-amber-700">${label} access</p><h1 class="mt-3 text-3xl font-black text-blue-950">Unlock ${name}</h1><p class="mx-auto mt-4 max-w-xl leading-7 text-slate-600">This workspace is available to members with an active ${label} subscription${plan === 'starter' ? ' or higher' : ''}. Your access updates automatically after a successful payment.</p><a href="${destination}" class="mt-7 inline-flex rounded-xl bg-blue-950 px-6 py-3.5 font-bold text-white hover:bg-blue-900">${signedIn ? 'View plans' : 'Sign in to continue'}</a></section>`;
}

export async function requireFeature(feature) {
    const requirement = requirements[feature];
    const access = await getAccess();
    if (!requirement || access.rank >= rank[requirement.plan]) return access;
    const main = document.querySelector('main');
    if (main) main.innerHTML = gateMarkup(requirement.name, requirement.plan, Boolean(access.user));
    document.title = `${requirement.name} | Subscription required`;
    await new Promise(() => {});
}

export function canUseTemplate(plan, requiredPlan) {
    return (rank[plan] ?? -1) >= (rank[requiredPlan] ?? 0);
}

export async function applyTemplateAccess() {
    const access = await getAccess();
    document.querySelectorAll('[data-template-card]').forEach(card => {
        const required = card.dataset.templateTier || 'free';
        const allowed = canUseTemplate(access.plan, required);
        const button = card.querySelector('[data-template-action]');
        if (!button || allowed) return;
        button.textContent = `${required === 'pro' ? 'Pro' : 'Starter'} plan required`;
        button.disabled = true;
        button.classList.add('cursor-not-allowed', 'opacity-60');
        const badge = document.createElement('span');
        badge.className = 'mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-800';
        badge.innerHTML = '<i class="fa-solid fa-lock"></i> Locked';
        card.querySelector('div')?.prepend(badge);
    });
}
