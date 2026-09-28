import type { Config } from '@netlify/functions';
import { json, requirePlan } from './_shared.ts';

const instructions = {
  cv: 'Rewrite my professional summary, skills, and experience bullets for this role. Use strong action verbs, preserve factual accuracy, quantify achievements only where evidence is provided, and optimise naturally for ATS keywords.',
  cover: 'Write a concise, specific three-paragraph cover letter. Connect my evidence to the employer’s requirements, avoid clichés, and finish with a confident call to action.',
  linkedin: 'Write a recruiter-friendly LinkedIn headline and an About section of 150–220 words. Make it credible, keyword-rich, conversational, and focused on the value I can contribute.',
  interview: 'Create ten likely interview questions, explain what each question assesses, and draft concise STAR-style answer frameworks using only my supplied experience.'
} as const;

export default async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const body = await request.json();
    const type = body.type as keyof typeof instructions;
    if (!(type in instructions)) return json({ error: 'Choose a valid prompt type.' }, 400);
    const { plan } = await requirePlan(request, type === 'cv' ? 'free' : 'starter');
    const fields = ['role', 'company', 'experience', 'description'] as const;
    if (fields.some(key => typeof body[key] !== 'string' || body[key].length > 12000)) return json({ error: 'Please check the supplied text.' }, 400);
    if (!body.role.trim() || !body.experience.trim()) return json({ error: 'Add your target role and relevant experience.' }, 400);
    const company = body.company.trim() || 'the employer';
    const description = body.description.trim() || 'No job description was supplied. Ask me for missing requirements before making assumptions.';
    const prompt = `Act as a senior South African career coach and recruiter. I am applying for ${body.role.trim()} at ${company}.\n\nTASK\n${instructions[type]} Use professional South African English and return clear headings followed by the final copy.\n\nMY EXPERIENCE AND SKILLS\n${body.experience.trim()}\n\nJOB DESCRIPTION\n${description}\n\nRULES\n- Do not invent qualifications, employers, metrics, or tools.\n- Identify the five strongest matching keywords.\n- Flag important gaps separately.\n- Keep the output practical and ready to use.`;
    return json({ prompt, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'AUTH_REQUIRED') return json({ error: 'Please sign in to use the prompt builder.' }, 401);
    if (message.startsWith('PLAN_REQUIRED:')) return json({ error: 'This prompt type requires an active Starter or Pro subscription.', requiredPlan: 'starter' }, 403);
    return json({ error: 'The prompt could not be created. Please try again.' }, 500);
  }
};

export const config: Config = { path: '/api/career-prompt', method: ['POST'] };
