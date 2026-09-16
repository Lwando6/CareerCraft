import { supabase } from './auth.js';

const form = document.getElementById('resumeForm');
const status = document.getElementById('editorStatus');
const params = new URLSearchParams(location.search);
let selected = null;
try { selected = JSON.parse(localStorage.getItem('careercraft-selected-template') || 'null'); } catch (_) { selected = null; }
let templateSlug = params.get('template') || selected?.slug || 'corporate-accountant';
let resumeId = params.get('id');
let selectedProjects = [];

function message(text, success = false) {
    status.textContent = text;
    status.className = `mt-4 rounded-lg border px-3 py-2 text-sm ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`;
}

function values() {
    return {
        ...Object.fromEntries(new FormData(form).entries()),
        theme: document.getElementById('themePicker').value,
        projects: selectedProjects,
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
    const safeUrl = value => /^https:\/\/github\.com\//.test(value || '') ? value : '';
    document.getElementById('previewProjects').innerHTML = selectedProjects.map(project => `<div><div class="flex flex-wrap items-baseline justify-between gap-2"><h4 class="font-bold text-slate-900">${String(project.name || '').replace(/[<>&"]/g, '')}</h4>${project.language ? `<span class="text-xs font-semibold text-slate-500">${String(project.language).replace(/[<>&"]/g, '')}</span>` : ''}</div><p class="mt-1 text-sm leading-6 text-slate-700">${String(project.description || '').replace(/[<>&"]/g, '')}</p>${safeUrl(project.url) ? `<a class="mt-1 inline-block text-sm font-bold text-blue-700" href="${project.url}" target="_blank" rel="noopener">GitHub repository</a>` : ''}</div>`).join('');
    document.getElementById('previewProjectsSection').classList.toggle('hidden', !selectedProjects.length || data.sections?.projects === false);
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
        const { data, error } = await supabase.from('resumes').select('*').eq('id', resumeId).eq('user_id', user.id).maybeSingle();
        if (error) message(error.message);
        else if (!data) {
            resumeId = null;
            message('This CV could not be found in your account. You can save this page as a new CV.');
        }
        else {
            templateSlug = data.template_slug;
            selectedProjects = Array.isArray(data.content?.projects) ? data.content.projects.slice(0, 12) : [];
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
    if (!form.reportValidity()) return message('Complete the required name, headline and email fields before saving.');
    const button = document.getElementById('saveResumeButton');
    const saveState = document.getElementById('saveState');
    button.disabled = true;
    button.textContent = 'Saving…';
    saveState.textContent = 'Saving securely…';
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return location.replace('login.html?next=editor.html');
    const payload = { user_id: user.id, template_slug: templateSlug, title: `${values().fullName || 'My'} CV`, content: values(), updated_at: new Date().toISOString() };
    const query = resumeId
        ? supabase.from('resumes').update(payload).eq('id', resumeId).eq('user_id', user.id).select().maybeSingle()
        : supabase.from('resumes').insert(payload).select().single();
    const { data, error } = await query;
    button.disabled = false;
    button.textContent = 'Save';
    if (error) {
        saveState.textContent = 'Save failed';
        return message(`Could not save this CV: ${error.message}`);
    }
    if (!data) {
        saveState.textContent = 'Save failed';
        return message('The CV was not saved. Refresh the page and try again.');
    }
    resumeId = data.id;
    history.replaceState({}, '', `editor.html?id=${resumeId}`);
    saveState.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    message('CV saved securely to your account.', true);
});
document.getElementById('downloadResumeButton').addEventListener('click', () => window.print());
initialise();
