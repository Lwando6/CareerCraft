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
        window.location.href = 'profile.html';
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
        window.location.href = 'profile.html';
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
        const plan = profile.selected_plan || readLocal(PLAN_KEY);
        document.getElementById('profileName').value = profile.full_name;
        document.getElementById('profileEmail').value = profile.email;
        document.getElementById('profileEmail').readOnly = true;
        document.getElementById('profileRole').value = profile.role;
        document.getElementById('profileBio').value = profile.bio;
        document.getElementById('profileLocation').value = profile.location;
        document.getElementById('selectedTemplateSummary').textContent =
            template ? `${template.name} (${template.category})` : 'No template selected yet';
        document.getElementById('selectedPlanSummary').textContent =
            plan ? `${plan.name} — ${plan.price}` : 'No subscription selected yet';

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const { error } = await supabase.from('profiles').update({
                full_name: document.getElementById('profileName').value.trim(),
                role: document.getElementById('profileRole').value.trim(),
                bio: document.getElementById('profileBio').value.trim(),
                location: document.getElementById('profileLocation').value.trim(),
                selected_template: readLocal(TEMPLATE_KEY) || template,
                selected_plan: readLocal(PLAN_KEY) || plan,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
            showStatus(
                status,
                error ? error.message : 'Your secure profile has been updated successfully.',
                !error
            );
        });
    } catch (error) {
        showStatus(status, `Could not load your profile: ${error.message}`);
    }
}

function bindSelections(user) {
    document.querySelectorAll('[data-template-card]').forEach((card) => {
        card.querySelector('[data-template-action]')?.addEventListener('click', async () => {
            if (!user) return window.location.href = 'login.html';
            const value = {
                name: card.dataset.templateName,
                category: card.dataset.templateCategory,
                description: card.dataset.templateDescription
            };
            writeLocal(TEMPLATE_KEY, value);
            await loadProfile(user);
            await supabase.from('profiles').update({
                selected_template: value,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
            window.location.href = 'profile.html';
        });
    });

    document.querySelectorAll('[data-plan-card]').forEach((card) => {
        card.querySelector('[data-plan-action]')?.addEventListener('click', async () => {
            if (!user) return window.location.href = 'login.html';
            const value = { name: card.dataset.planName, price: card.dataset.planPrice };
            writeLocal(PLAN_KEY, value);
            await loadProfile(user);
            await supabase.from('profiles').update({
                selected_plan: value,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
            window.location.href = 'profile.html';
        });
    });
}

async function initialise() {
    const user = await currentUser();
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (user && ['login.html', 'signup.html'].includes(page)) {
        return window.location.replace('profile.html');
    }
    updateAuthUI(user);
    bindLogout();
    bindLogin();
    bindSignup();
    await bindProfile(user);
    bindSelections(user);
}

supabase.auth.onAuthStateChange((_event, session) => updateAuthUI(session?.user || null));
initialise();

window.CareerCraftAuth = { supabase, currentUser };
