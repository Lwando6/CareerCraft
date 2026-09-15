(function () {
    const form = document.getElementById('promptBuilderForm');
    const output = document.getElementById('generatedPrompt');
    const copyButton = document.getElementById('copyGeneratedPrompt');
    const status = document.getElementById('promptStatus');
    const instructions = {
        cv: 'Rewrite my professional summary, skills, and experience bullets for this role. Use strong action verbs, preserve factual accuracy, quantify achievements only where evidence is provided, and optimise naturally for ATS keywords.',
        cover: 'Write a concise, specific three-paragraph cover letter. Connect my evidence to the employer’s requirements, avoid clichés, and finish with a confident call to action.',
        linkedin: 'Write a recruiter-friendly LinkedIn headline and an About section of 150–220 words. Make it credible, keyword-rich, conversational, and focused on the value I can contribute.',
        interview: 'Create ten likely interview questions, explain what each question assesses, and draft concise STAR-style answer frameworks using only my supplied experience.'
    };
    form.addEventListener('submit', event => {
        event.preventDefault();
        const type = document.getElementById('promptType').value;
        const role = document.getElementById('targetRole').value.trim();
        const company = document.getElementById('companyName').value.trim() || 'the employer';
        const experience = document.getElementById('experienceInput').value.trim();
        const description = document.getElementById('jobDescriptionInput').value.trim() || 'No job description was supplied. Ask me for missing requirements before making assumptions.';
        output.textContent = `Act as a senior South African career coach and recruiter. I am applying for ${role} at ${company}.\n\nTASK\n${instructions[type]} Use professional South African English and return clear headings followed by the final copy.\n\nMY EXPERIENCE AND SKILLS\n${experience}\n\nJOB DESCRIPTION\n${description}\n\nRULES\n- Do not invent qualifications, employers, metrics, or tools.\n- Identify the five strongest matching keywords.\n- Flag important gaps separately.\n- Keep the output practical and ready to use.`;
        copyButton.disabled = false;
        status.textContent = 'Prompt generated. Review it, then copy it into your preferred AI assistant.';
    });
    copyButton.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(output.textContent); copyButton.textContent = 'Copied ✓'; status.textContent = 'Copied to your clipboard.'; setTimeout(() => copyButton.textContent = 'Copy prompt', 1800); }
        catch (_) { status.textContent = 'Select the generated text and copy it manually.'; }
    });
    document.getElementById('clearPrompt').addEventListener('click', () => {
        form.reset(); output.textContent = 'Complete the form to generate a tailored career prompt.'; copyButton.disabled = true; status.textContent = '';
    });
})();
