import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm';

const supabase = createClient(
    'https://okbjpiltbbodvrhitowh.supabase.co',
    'sb_publishable__GtF6JOwGeAh75WXjEv-_g_bfVkm6P4',
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
const TEMPLATE_KEY = 'careercraft-selected-template';
const PLAN_KEY = 'careercraft-selected-plan';

// Permanently remove records created by the old insecure browser-only login.
['careercraft-users', 'careercraft-current-user', 'careercraft-profiles']
    .forEach((key) => localStorage.removeItem(key));

function readLocal(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (_) {
        return null;
    }
}

function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function showStatus(element, message, success = false) {
    if (!element) return;
    const colors = success
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-red-200 bg-red-50 text-red-700';
    element.textContent = message;
    element.className = `mt-3 rounded-lg border px-3 py-2 text-sm ${colors}`;
}

function safeNext(fallback = 'profile.html') {
    const value = new URLSearchParams(window.location.search).get('next');
    return value && /^[a-z0-9-]+\.html$/i.test(value) ? value : fallback;
}

async function currentUser() {
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
}

function updateAuthUI(user) {
    document.getElementById('navLoginLink')?.classList.toggle('hidden', Boolean(user));
    document.getElementById('navSignupLink')?.classList.toggle('hidden', Boolean(user));
    document.getElementById('navProfileLink')?.classList.toggle('hidden', !user);
    document.getElementById('navLogoutButton')?.classList.toggle('hidden', !user);
}

function bindLogout() {
    ['navLogoutButton', 'logoutButton'].forEach((id) => {
        document.getElementById(id)?.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    });
}

function bindLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const status = document.getElementById('loginStatus');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Signing in…';
        const { error } = await supabase.auth.signInWithPassword({
            email: document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value
        });
        button.disabled = false;
        button.textContent = 'Sign In Securely';
        if (error) return showStatus(status, error.message);
        window.location.href = safeNext();
    });
}

function bindSignup() {
    const form = document.getElementById('signupForm');
    if (!form) return;
    const status = document.getElementById('signupStatus');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const role = document.getElementById('signupRole').value.trim();
        const password = document.getElementById('signupPassword').value;
        if (password.length < 8) {
            return showStatus(status, 'Use at least 8 characters for your password.');
        }
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Creating secure account…';
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name, target_role: role },
                emailRedirectTo: `${window.location.origin}/profile.html`
            }
        });
        button.disabled = false;
        button.textContent = 'Create Account';
        if (error) return showStatus(status, error.message);
        if (!data.session) {
            form.reset();
            return showStatus(
                status,
                'Account created. Check your email and confirm your address before signing in.',
                true
            );
        }
        window.location.href = safeNext();
    });
}

async function loadProfile(user) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
    if (error) throw error;
    if (data) return data;
    const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: user.user_metadata?.target_role || ''
        })
        .select()
        .single();
    if (createError) throw createError;
    return created;
}

async function bindProfile(user) {
    const form = document.getElementById('profileForm');
    if (!form) return;
    if (!user) return window.location.replace('login.html');
    const status = document.getElementById('profileStatus');
    try {
        const profile = await loadProfile(user);
        const template = profile.selected_template || readLocal(TEMPLATE_KEY);
        const { data: subscription } = await supabase.from('subscriptions').select('plan_slug,status,current_period_end').eq('user_id', user.id).maybeSingle();
        const chosenPlan = profile.selected_plan || readLocal(PLAN_KEY);
        const plan = subscription?.status === 'active'
            ? { name: subscription.plan_slug === 'pro' ? 'Pro' : 'Starter', price: `Active${subscription.current_period_end ? ` until ${new Date(subscription.current_period_end).toLocaleDateString()}` : ''}` }
            : chosenPlan;
        document.getElementById('profileName').value = profile.full_name;
        document.getElementById('profileEmail').value = profile.email;
        document.getElementById('profileEmail').readOnly = true;
        document.getElementById('profileRole').value = profile.role;
        document.getElementById('profileBio').value = profile.bio;
        document.getElementById('profileLocation').value = profile.location;
        const githubField = document.getElementById('profileGithub');
        if (githubField) githubField.value = profile.github_username || '';
        document.getElementById('selectedTemplateSummary').textContent =
            template ? `${template.name} (${template.category})` : 'No template selected yet';
        document.getElementById('selectedPlanSummary').textContent =
            plan ? `${plan.name} — ${plan.price}` : 'No subscription selected yet';
        updateChecklist(profile, template, plan);
        const { data: resumes } = await supabase.from('resumes').select('id,title,template_slug,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(6);
        const resumeList = document.getElementById('savedResumes');
        if (resumeList) resumeList.innerHTML = resumes?.length
            ? resumes.map(resume => `<a href="editor.html?id=${encodeURIComponent(resume.id)}" class="rounded-xl border border-gray-200 p-4 transition hover:border-blue-400"><strong class="block text-blue-950">${escapeHTML(resume.title)}</strong><span class="mt-1 block text-xs text-gray-500">${escapeHTML(resume.template_slug.replaceAll('-', ' '))} · Updated ${new Date(resume.updated_at).toLocaleDateString()}</span></a>`).join('')
            : '<p class="text-sm text-gray-500">No CVs saved yet. Choose a template to create your first one.</p>';

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const { error } = await supabase.from('profiles').update({
                full_name: document.getElementById('profileName').value.trim(),
                role: document.getElementById('profileRole').value.trim(),
                bio: document.getElementById('profileBio').value.trim(),
                location: document.getElementById('profileLocation').value.trim(),
                github_username: document.getElementById('profileGithub')?.value.trim() || null,
                selected_template: readLocal(TEMPLATE_KEY) || template,
                selected_plan: readLocal(PLAN_KEY) || plan,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
            showStatus(
                status,
                error ? error.message : 'Your secure profile has been updated successfully.',
                !error
            );
            if (!error) updateChecklist({ ...profile, ...{
                full_name: document.getElementById('profileName').value.trim(),
                role: document.getElementById('profileRole').value.trim(),
                bio: document.getElementById('profileBio').value.trim(),
                location: document.getElementById('profileLocation').value.trim()
            } }, readLocal(TEMPLATE_KEY) || template, readLocal(PLAN_KEY) || plan);
        });
    } catch (error) {
        showStatus(status, `Could not load your profile: ${error.message}`);
    }
}

function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function updateChecklist(profile, template, plan) {
    const basicsComplete = Boolean(
        profile.full_name?.trim() && profile.role?.trim() &&
        profile.bio?.trim() && profile.location?.trim()
    );
    const states = [true, basicsComplete, Boolean(template), Boolean(plan)];
    const completed = states.filter(Boolean).length;
    const percent = completed * 25;
    const bar = document.getElementById('onboardingProgressBar');
    const label = document.getElementById('onboardingProgressLabel');
    if (bar) bar.style.width = `${percent}%`;
    if (label) label.textContent = `${completed} of 4 steps complete`;
    states.forEach((done, index) => {
        const item = document.getElementById(`onboardingStep${index + 1}`);
        const icon = item?.querySelector('[data-step-icon]');
        item?.classList.toggle('border-emerald-200', done);
        item?.classList.toggle('bg-emerald-50', done);
        if (icon) {
            icon.textContent = done ? '✓' : String(index + 1);
            icon.className = done
                ? 'w-7 h-7 rounded-full bg-emerald-500 text-white grid place-items-center text-sm font-bold'
                : 'w-7 h-7 rounded-full bg-gray-200 text-gray-600 grid place-items-center text-sm font-bold';
        }
    });
    const nextAction = document.getElementById('onboardingNextAction');
    if (!nextAction) return;
    if (!basicsComplete) {
        nextAction.href = '#profileForm';
        nextAction.textContent = 'Complete profile details';
    } else if (!template) {
        nextAction.href = 'resumes.html';
        nextAction.textContent = 'Choose a resume template';
    } else if (!plan) {
        nextAction.href = 'pricing.html';
        nextAction.textContent = 'Choose a plan';
    } else {
        nextAction.href = 'portfolio.html';
        nextAction.textContent = 'Explore your portfolio tools';
    }
}

function bindSelections(user) {
    document.querySelectorAll('[data-template-card]').forEach((card) => {
        card.querySelector('[data-template-action]')?.addEventListener('click', async () => {
            const value = {
                slug: card.dataset.templateSlug,
                name: card.dataset.templateName,
                category: card.dataset.templateCategory,
                description: card.dataset.templateDescription
            };
            writeLocal(TEMPLATE_KEY, value);
            if (!user) return window.location.href = 'signup.html?next=editor.html&saved=template';
            if (card.dataset.templateTier !== 'free') {
                const { data: entitlement } = await supabase.from('subscriptions').select('status,current_period_end').eq('user_id', user.id).maybeSingle();
                const active = entitlement?.status === 'active' && (!entitlement.current_period_end || new Date(entitlement.current_period_end) > new Date());
                if (!active) return window.location.href = 'pricing.html?required=starter';
            }
            await loadProfile(user);
            await supabase.from('profiles').update({
                selected_template: value,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
            window.location.href = `editor.html?template=${encodeURIComponent(value.slug)}`;
        });
    });

    document.querySelectorAll('[data-plan-card]').forEach((card) => {
        card.querySelector('[data-plan-action]')?.addEventListener('click', async () => {
            const value = { slug: card.dataset.planSlug, name: card.dataset.planName, price: card.dataset.planPrice };
            writeLocal(PLAN_KEY, value);
            if (!user) return window.location.href = 'signup.html?next=checkout.html&saved=plan';
            await loadProfile(user);
            await supabase.from('profiles').update({
                selected_plan: value,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
            window.location.href = value.slug === 'free' ? 'profile.html' : `checkout.html?plan=${value.slug}`;
        });
    });
}

async function initialise() {
    const user = await currentUser();
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (user && ['login.html', 'signup.html'].includes(page)) {
        return window.location.replace(safeNext());
    }
    const saved = new URLSearchParams(window.location.search).get('saved');
    if (saved && document.getElementById('signupStatus')) {
        showStatus(
            document.getElementById('signupStatus'),
            `Your ${saved} choice is saved. Create your free account to continue.`,
            true
        );
    }
    updateAuthUI(user);
    if (new URLSearchParams(window.location.search).has('required')) {
        const panel = document.getElementById('selectedPlanPanel');
        if (panel) {
            panel.textContent = 'This template is included with Starter or Pro. Choose a plan to continue.';
            panel.className = 'mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800';
        }
    }
    bindLogout();
    bindLogin();
    bindSignup();
    await bindProfile(user);
    bindSelections(user);
}

supabase.auth.onAuthStateChange((_event, session) => updateAuthUI(session?.user || null));
initialise();

window.CareerCraftAuth = { supabase, currentUser };
export { supabase, currentUser };
