import { supabase } from './auth.js';
import { requireFeature, getAccess } from './access-control.js';

await requireFeature('prompts');
const access = await getAccess();

(function () {
    const form = document.getElementById('promptBuilderForm');
    const output = document.getElementById('generatedPrompt');
    const copyButton = document.getElementById('copyGeneratedPrompt');
    const status = document.getElementById('promptStatus');
    const typeSelect = document.getElementById('promptType');
    if (access.plan === 'free') {
        [...typeSelect.options].forEach(option => {
            if (option.value !== 'cv') {
                option.disabled = true;
                option.textContent += ' — Starter plan';
            }
        });
        status.textContent = 'Free includes the tailored CV prompt. Upgrade to Starter for cover letters, LinkedIn summaries, and interview preparation.';
    }
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const type = document.getElementById('promptType').value;
        const role = document.getElementById('targetRole').value.trim();
        const company = document.getElementById('companyName').value.trim() || 'the employer';
        const experience = document.getElementById('experienceInput').value.trim();
        const description = document.getElementById('jobDescriptionInput').value.trim() || 'No job description was supplied. Ask me for missing requirements before making assumptions.';
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Building…';
        status.textContent = 'Building your secure prompt…';
        const { data: { session } } = await supabase.auth.getSession();
        try {
            const response = await fetch('/api/career-prompt', {
                method: 'POST',
                headers: { 'content-type': 'application/json', authorization: `Bearer ${session?.access_token || ''}` },
                body: JSON.stringify({ type, role, company, experience, description })
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 403) {
                    status.innerHTML = `${data.error} <a class="font-bold underline" href="pricing.html?required=starter">View plans</a>`;
                    return;
                }
                throw new Error(data.error || 'The prompt could not be created.');
            }
            output.textContent = data.prompt;
            copyButton.disabled = false;
            status.textContent = 'Prompt generated. Review it, then copy it into your preferred AI assistant.';
        } catch (error) {
            status.textContent = error.message;
        } finally {
            button.disabled = false;
            button.textContent = 'Build my prompt';
        }
    });
    copyButton.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(output.textContent); copyButton.textContent = 'Copied ✓'; status.textContent = 'Copied to your clipboard.'; setTimeout(() => copyButton.textContent = 'Copy prompt', 1800); }
        catch (_) { status.textContent = 'Select the generated text and copy it manually.'; }
    });
    document.getElementById('clearPrompt').addEventListener('click', () => {
        form.reset(); output.textContent = 'Complete the form to generate a tailored career prompt.'; copyButton.disabled = true; status.textContent = '';
    });
})();
