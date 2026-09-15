import { supabase } from './auth.js';

const form = document.getElementById('resumeForm');
const status = document.getElementById('editorStatus');
const params = new URLSearchParams(location.search);
let selected = null;
try { selected = JSON.parse(localStorage.getItem('careercraft-selected-template') || 'null'); } catch (_) { selected = null; }
let templateSlug = params.get('template') || selected?.slug || 'corporate-accountant';
let resumeId = params.get('id');

function message(text, success = false) {
    status.textContent = text;
    status.className = `mt-4 rounded-lg border px-3 py-2 text-sm ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`;
}

function values() {
    return {
        ...Object.fromEntries(new FormData(form).entries()),
        theme: document.getElementById('themePicker').value,
        sections: Object.fromEntries([...document.querySelectorAll('[data-section-toggle]')].map(input => [input.dataset.sectionToggle, input.checked]))
    };
}

function render() {
    const data = values();
    document.getElementById('previewName').textContent = data.fullName || 'Your Name';
    document.getElementById('previewHeadline').textContent = data.headline || 'Professional Headline';
    document.getElementById('previewContact').textContent = [data.email, data.phone, data.location].filter(Boolean).join(' · ') || 'email@example.com · Cape Town';
    document.getElementById('previewSummary').textContent = data.summary || 'Add a focused summary that explains the value you bring.';
    document.getElementById('previewExperience').textContent = data.experience || 'Add your experience and measurable achievements.';
    document.getElementById('previewEducation').textContent = data.education || 'Add your qualifications and training.';
    document.getElementById('previewSkills').innerHTML = (data.skills || '').split(',').map(s => s.trim()).filter(Boolean)
        .map(skill => `<span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">${skill.replace(/[<>&"]/g, '')}</span>`).join('');
    const colors = { navy: ['border-blue-950', 'text-blue-950'], emerald: ['border-emerald-700', 'text-emerald-800'], slate: ['border-slate-700', 'text-slate-800'] };
    const [border, text] = colors[data.theme] || colors.navy;
    const header = document.querySelector('#resumePreview > header');
    header.classList.remove('border-blue-950', 'border-emerald-700', 'border-slate-700'); header.classList.add(border);
    document.querySelectorAll('#resumePreview h2, #resumePreview h3').forEach(node => { node.classList.remove('text-blue-950', 'text-emerald-800', 'text-slate-800'); node.classList.add(text); });
    document.querySelectorAll('[data-preview-section]').forEach(section => {
        if (section.dataset.previewSection === 'custom') return;
        section.classList.toggle('hidden', data.sections?.[section.dataset.previewSection] === false);
    });
    document.getElementById('previewCustomTitle').textContent = data.customTitle || 'Custom section';
    document.getElementById('previewCustomContent').textContent = data.customContent || '';
    document.getElementById('previewCustomSection').classList.toggle('hidden', !data.customTitle && !data.customContent);
}

async function initialise() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return location.replace(`login.html?next=editor.html`);
    const setTemplateLabel = () => {
        const label = selected?.slug === templateSlug ? selected.name : templateSlug.replaceAll('-', ' ');
        document.getElementById('editorTemplateName').textContent = label;
        document.getElementById('previewTemplate').textContent = label;
    };
    setTemplateLabel();
    form.elements.email.value = user.email || '';
    if (resumeId) {
        const { data, error } = await supabase.from('resumes').select('*').eq('id', resumeId).single();
        if (error) message(error.message);
        else {
            templateSlug = data.template_slug;
            setTemplateLabel();
            Object.entries(data.content || {}).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
            if (data.content?.theme) document.getElementById('themePicker').value = data.content.theme;
            Object.entries(data.content?.sections || {}).forEach(([key, value]) => { const toggle = document.querySelector(`[data-section-toggle="${key}"]`); if (toggle) toggle.checked = value; });
            if (data.content?.customTitle || data.content?.customContent) document.getElementById('customSectionFields').classList.remove('hidden');
        }
    } else {
        const { data: profile } = await supabase.from('profiles').select('full_name,email,role,location,bio').eq('user_id', user.id).maybeSingle();
        if (profile) {
            form.elements.fullName.value = profile.full_name || '';
            form.elements.email.value = profile.email || user.email || '';
            form.elements.headline.value = profile.role || '';
            form.elements.location.value = profile.location || '';
            form.elements.summary.value = profile.bio || '';
        }
    }
    render();
}

form.addEventListener('input', render);
document.getElementById('themePicker').addEventListener('change', render);
document.querySelectorAll('[data-section-toggle]').forEach(input => input.addEventListener('change', render));
document.getElementById('addCustomSectionButton').addEventListener('click', () => {
    document.getElementById('customSectionFields').classList.toggle('hidden');
    document.getElementById('customSectionFields').querySelector('input')?.focus();
    render();
});
document.getElementById('saveResumeButton').addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return location.replace('login.html?next=editor.html');
    const payload = { user_id: user.id, template_slug: templateSlug, title: `${values().fullName || 'My'} CV`, content: values(), updated_at: new Date().toISOString() };
    const query = resumeId
        ? supabase.from('resumes').update(payload).eq('id', resumeId).select().single()
        : supabase.from('resumes').insert(payload).select().single();
    const { data, error } = await query;
    if (error) return message(error.message);
    resumeId = data.id;
    history.replaceState({}, '', `editor.html?id=${resumeId}`);
    message('CV saved securely to your account.', true);
});
document.getElementById('downloadResumeButton').addEventListener('click', () => window.print());
initialise();
