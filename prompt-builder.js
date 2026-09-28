import { supabase } from './auth.js';
import { requireFeature, getAccess } from './access-control.js';

await requireFeature('prompts');
const access = await getAccess();

(function () {
    const form = document.getElementById('promptBuilderForm');
    const output = document.getElementById('generatedPrompt');
    const copyButton = document.getElementById('copyGeneratedPrompt');
    const generateButton = document.getElementById('generateDocumentButton');
    const status = document.getElementById('promptStatus');
    const typeSelect = document.getElementById('promptType');
    if (access.plan === 'free') {
        [...typeSelect.options].forEach(option => {
            if (option.value !== 'cv') {
                option.disabled = true;
                option.textContent += ' — Starter plan';
            }
        });
        status.textContent = 'Free includes the tailored CV prompt. Upgrade to Starter to improve other document prompts and generate finished documents inside CareerCraft.';
        generateButton.innerHTML = '<i class="fa-solid fa-lock mr-2"></i>Starter plan required to generate documents';
    }
    const requestBody = () => ({
        type: typeSelect.value,
        role: document.getElementById('targetRole').value.trim(),
        company: document.getElementById('companyName').value.trim(),
        experience: document.getElementById('experienceInput').value.trim(),
        description: document.getElementById('jobDescriptionInput').value.trim(),
        additionalContext: document.getElementById('additionalContext').value.trim()
    });
    async function callApi(body) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/career-prompt', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session?.access_token || ''}` }, body: JSON.stringify(body) });
        const raw = await response.text();
        let data;
        try { data = JSON.parse(raw); } catch { throw new Error('CareerCraft received an invalid server response. Please try again.'); }
        if (!response.ok) {
            const error = new Error(data.error || 'The request could not be completed.');
            error.status = response.status;
            error.requiredPlan = data.requiredPlan;
            throw error;
        }
        return data;
    }
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Improving…';
        status.textContent = 'Gemini is improving your request…';
        try {
            const data = await callApi({ action: 'improve_prompt', ...requestBody() });
            output.value = data.prompt;
            copyButton.disabled = false;
            generateButton.disabled = access.plan === 'free';
            status.textContent = access.plan === 'free' ? 'Prompt improved. Upgrade to Starter to generate the document inside CareerCraft.' : 'Prompt improved. Review or edit it, then generate the document.';
        } catch (error) {
            if (error.status === 403) status.innerHTML = `${error.message} <a class="font-bold underline" href="pricing.html?required=${error.requiredPlan || 'starter'}">View plans</a>`;
            else status.textContent = error.message;
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-2"></i>Improve my prompt';
        }
    });
    copyButton.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(output.value); copyButton.textContent = 'Copied ✓'; status.textContent = 'Copied to your clipboard.'; setTimeout(() => copyButton.textContent = 'Copy prompt', 1800); }
        catch (_) { status.textContent = 'Select the generated text and copy it manually.'; }
    });
    async function generateDocument() {
        const documentSection = document.getElementById('documentResultSection');
        const documentOutput = document.getElementById('generatedDocument');
        const documentStatus = document.getElementById('documentStatus');
        generateButton.disabled = true;
        generateButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Generating document…';
        status.textContent = 'Gemini is drafting your document from the improved prompt…';
        try {
            const data = await callApi({ action: 'generate_document', ...requestBody(), improvedPrompt: output.value.trim() });
            documentOutput.value = data.document;
            documentSection.classList.remove('hidden');
            documentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            status.textContent = 'Document generated successfully.';
            documentStatus.textContent = 'Review and edit the result before downloading or submitting it.';
        } catch (error) {
            if (error.status === 403) status.innerHTML = `${error.message} <a class="font-bold underline" href="pricing.html?required=${error.requiredPlan || 'starter'}">View plans</a>`;
            else status.textContent = error.message;
        } finally {
            generateButton.disabled = access.plan === 'free';
            generateButton.innerHTML = '<i class="fa-solid fa-file-circle-check mr-2"></i>Generate the actual document';
        }
    }
    generateButton.addEventListener('click', generateDocument);
    document.getElementById('regenerateDocument').addEventListener('click', generateDocument);
    document.getElementById('copyGeneratedDocument').addEventListener('click', async () => {
        const value = document.getElementById('generatedDocument').value;
        try { await navigator.clipboard.writeText(value); document.getElementById('documentStatus').textContent = 'Document copied to your clipboard.'; }
        catch (_) { document.getElementById('documentStatus').textContent = 'Select the document text and copy it manually.'; }
    });
    document.getElementById('downloadGeneratedDocument').addEventListener('click', () => {
        const value = document.getElementById('generatedDocument').value;
        const filename = `${typeSelect.value || 'career'}-document.txt`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([value], { type: 'text/plain;charset=utf-8' }));
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        document.getElementById('documentStatus').textContent = 'Document downloaded.';
    });
    document.getElementById('clearPrompt').addEventListener('click', () => {
        form.reset(); output.value = 'Complete the form to create an improved career prompt.'; copyButton.disabled = true; generateButton.disabled = true; status.textContent = ''; document.getElementById('documentResultSection').classList.add('hidden'); document.getElementById('generatedDocument').value = '';
    });
})();
