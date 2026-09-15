import { supabase } from './auth.js';

const states = { profile_makeover: { busy: false, result: null }, post_generator: { busy: false, result: null } };
const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formFor = tool => document.getElementById(tool === 'profile_makeover' ? 'profileToolForm' : 'postToolForm');
const outputFor = tool => document.getElementById(tool === 'profile_makeover' ? 'profileOutput' : 'postOutput');
const toolFor = node => node.closest('#profilePanel') ? 'profile_makeover' : 'post_generator';
const notice = document.createElement('p');
notice.className = 'mx-auto max-w-6xl px-4 pt-4 text-sm text-slate-600';
notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite');
document.querySelector('main').prepend(notice);

function showTab(name, scroll = false) {
  ['profile','post'].forEach(tab => {
    const active = tab === name;
    const button = document.getElementById(`${tab}Tab`);
    button.classList.toggle('tab-active', active);
    button.classList.toggle('text-slate-600', !active);
    button.setAttribute('aria-selected', String(active));
    button.setAttribute('aria-controls', `${tab}Panel`);
    button.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(`${tab}Panel`);
    panel.classList.toggle('hidden', !active);
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `${tab}Tab`);
  });
  if (scroll) document.getElementById(`${name}Panel`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
showTab('profile');
document.querySelectorAll('[data-tab]').forEach(button => {
  button.addEventListener('click', () => showTab(button.dataset.tab));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); const tab = event.key === 'Home' ? 'profile' : event.key === 'End' ? 'post' : button.dataset.tab === 'profile' ? 'post' : 'profile';
    showTab(tab); document.getElementById(`${tab}Tab`).focus();
  });
});
document.querySelectorAll('[data-open-tool]').forEach(button => button.addEventListener('click', () => showTab(button.dataset.openTool, true)));
document.querySelectorAll('textarea,input:not([type=file])').forEach(input => { if (input.type !== 'checkbox') input.maxLength = 12000; });

const profilePaste = document.createElement('label');
profilePaste.className = 'block text-sm font-bold';
profilePaste.innerHTML = 'Or paste your profile text<textarea name="profileText" rows="6" maxlength="18000" class="mt-2 w-full rounded-xl border px-4 py-3" placeholder="Headline, About, experience and skills. You can use text instead of screenshots."></textarea>';
formFor('profile_makeover').querySelector('.dropzone').after(profilePaste);

function validateFiles(input) {
  const max = input.closest('form').id === 'profileToolForm' ? 6 : 10;
  const files = [...input.files];
  const invalid = files.length > max || files.some(file => !['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024);
  const summary = input.closest('.dropzone').querySelector('.file-summary');
  if (invalid) { input.value = ''; summary.textContent = `Choose up to ${max} PNG, JPG or WebP files, each under 12 MB.`; return false; }
  summary.textContent = files.length ? `${files.length} image(s) ready · ${files.map(file => file.name).join(', ')}` : `PNG, JPG or WebP · maximum ${max}`;
  return true;
}
document.querySelectorAll('input[type=file]').forEach(input => {
  input.addEventListener('change', () => validateFiles(input));
  const dropzone = input.closest('.dropzone');
  dropzone.addEventListener('dragover', event => { event.preventDefault(); dropzone.classList.add('drop-active'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drop-active'));
  dropzone.addEventListener('drop', event => { event.preventDefault(); dropzone.classList.remove('drop-active'); input.files = event.dataTransfer.files; validateFiles(input); });
});
formFor('profile_makeover').addEventListener('paste', event => {
  const files = [...(event.clipboardData?.files || [])].filter(file => file.type.startsWith('image/'));
  if (!files.length) return;
  event.preventDefault(); const transfer = new DataTransfer(); files.forEach(file => transfer.items.add(file));
  const input = formFor('profile_makeover').elements.images; input.files = transfer.files; validateFiles(input);
});

async function imageData(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.72);
}
function copyBlock(title, value) {
  const text = Array.isArray(value) ? value.map(item => `• ${item}`).join('\n') : String(value || 'Not enough information supplied.');
  return `<section class="rounded-xl border border-slate-200 p-4"><div class="flex items-center justify-between gap-3"><h3 class="font-bold text-blue-950">${escapeHTML(title)}</h3><button type="button" data-copy="${encodeURIComponent(text)}" aria-label="Copy ${escapeHTML(title)}" class="min-h-11 rounded-lg border px-3 py-2 text-xs font-bold text-blue-900">Copy</button></div><div class="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">${escapeHTML(text)}</div></section>`;
}
function renderProfile(result) {
  outputFor('profile_makeover').innerHTML = `<div class="flex items-center justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-widest text-amber-600">Profile quality score—not a ranking prediction</p><p class="mt-1 text-4xl font-black text-blue-950">${Number(result.score).toFixed(1)}<span class="text-lg text-slate-400">/10</span></p></div><button type="button" data-save class="rounded-lg bg-blue-950 px-4 py-3 text-sm font-bold text-white">Save to history</button></div><div class="mt-5 space-y-4">${copyBlock('Why this score',result.scoreRationale)}${copyBlock('Recruiter visibility audit',result.visibilityAudit)}${copyBlock('Five headline options',result.headlines)}${copyBlock('Short About section',result.aboutShort)}${copyBlock('Long About section',result.aboutLong)}${copyBlock('Experience improvements',result.experienceImprovements)}${copyBlock('20 relevant recruiter keywords',result.keywords)}${copyBlock('Skills to add if supported',result.skillsAdd)}${copyBlock('Skills to reconsider',result.skillsRemove)}${copyBlock('Banner, photo and featured recommendations',result.visualRecommendations)}${copyBlock('Final checklist',result.checklist)}</div>`;
}
function postText(post) { return [post.hook,post.body,post.lessons.map(item => `• ${item}`).join('\n'),post.cta,post.hashtags.join(' ')].filter(Boolean).join('\n\n'); }
function renderPosts(result) {
  outputFor('post_generator').innerHTML = `<div class="mb-5 flex items-center justify-between gap-3"><h2 class="text-xl font-black text-blue-950">Three post directions</h2><button type="button" data-save class="rounded-lg bg-blue-950 px-4 py-3 text-sm font-bold text-white">Save to history</button></div><p class="mb-4 text-xs text-slate-500">Edit the text below before copying. Your edits are included when saving.</p><div class="space-y-5">${result.posts.map((post,index) => `<article class="rounded-xl border p-4"><label for="postEdit${index}" class="font-bold text-blue-950">${escapeHTML(post.type)}</label><textarea id="postEdit${index}" data-post-edit="${index}" rows="14" class="mt-3 w-full rounded-lg border bg-slate-50 p-3 text-sm leading-6">${escapeHTML(post.editedText || postText(post))}</textarea>${copyBlock('Alt text suggestions',post.altText)}${copyBlock('Short comment version',post.shortComment)}<div class="mt-3 flex flex-wrap gap-2"><button type="button" data-copy-post="${index}" class="rounded-lg bg-amber-500 px-4 py-3 text-xs font-bold text-blue-950">Copy post</button><button type="button" data-regenerate class="rounded-lg border px-4 py-3 text-xs font-bold">Regenerate all three</button></div></article>`).join('')}</div>`;
}

async function run(form, tool) {
  const state = states[tool]; if (state.busy) return;
  const target = outputFor(tool);
  if (!form.reportValidity()) return;
  if (tool === 'profile_makeover' && !form.elements.images.files.length && !form.elements.profileText.value.trim()) { notice.textContent = 'Add screenshots or paste your profile text.'; return; }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { notice.textContent = 'Please sign in to generate. Your uploads have not been sent.'; return; }
  state.busy = true; target.setAttribute('aria-busy','true'); const submit = form.querySelector('button:not([type=button])'); submit.disabled = true;
  const original = submit.textContent; submit.textContent = 'Generating…';
  target.innerHTML = '<div role="status" aria-live="polite" class="py-16 text-center"><h3 class="font-bold text-blue-950">Preparing your LinkedIn results…</h3><p class="mt-2 text-sm text-slate-500">This may take up to a minute. Keep this page open.</p></div>';
  try {
    const images = await Promise.all([...form.elements.images.files].map(imageData));
    const entries = new FormData(form); entries.delete('images'); entries.delete('consent'); const fields = Object.fromEntries(entries);
    const payload = JSON.stringify({ tool, fields, images, consent: form.elements.consent.checked });
    if (new TextEncoder().encode(payload).length > 4500000) throw new Error('The images are too large together. Use fewer or smaller images.');
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    const response = await fetch('/api/linkedin-ai', { method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${freshSession.access_token}`}, body:payload, signal:AbortSignal.timeout(65000) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Please retry shortly.');
    state.result = data.result; state.fields = fields; state.saved = false;
    tool === 'profile_makeover' ? renderProfile(data.result) : renderPosts(data.result);
    notice.textContent = 'Results ready. Check every claim before copying or publishing.';
  } catch (error) {
    target.innerHTML = `<div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"><strong>Generation could not be completed.</strong><p class="mt-2 text-sm">${escapeHTML(error.name === 'TimeoutError' ? 'The request timed out. Please retry shortly.' : error.message)}</p><button type="button" data-regenerate class="mt-4 rounded-lg border border-red-300 px-4 py-3 text-sm font-bold">Try again</button></div>`;
  } finally { state.busy = false; submit.disabled = false; submit.textContent = original; target.setAttribute('aria-busy','false'); }
}
['profile_makeover','post_generator'].forEach(tool => formFor(tool).addEventListener('submit', event => { event.preventDefault(); run(event.currentTarget, tool); }));
async function copy(text, button) {
  try { await navigator.clipboard.writeText(text); const label = button.textContent; button.textContent = 'Copied ✓'; setTimeout(() => button.textContent = label, 1800); }
  catch { notice.textContent = 'Clipboard permission was denied. Select the text and copy it manually.'; }
}
document.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.hasAttribute('data-copy')) return copy(decodeURIComponent(button.dataset.copy), button);
  if (button.hasAttribute('data-copy-post')) return copy(document.getElementById(`postEdit${button.dataset.copyPost}`).value, button);
  const tool = toolFor(button); const state = states[tool];
  if (button.hasAttribute('data-regenerate')) return run(formFor(tool), tool);
  if (button.hasAttribute('data-save') && state.result && !state.saved) {
    button.disabled = true;
    try {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Please sign in again to save.');
      const result = structuredClone(state.result);
      if (tool === 'post_generator') result.posts.forEach((post,index) => post.editedText = document.getElementById(`postEdit${index}`).value);
      const { error } = await supabase.from('linkedin_generations').insert({ user_id:user.id, tool_type:tool, input_summary: tool === 'profile_makeover' ? state.fields?.targetRoles || 'Profile audit' : state.fields?.eventName || 'LinkedIn post', output:result });
      if (error) throw error; state.saved = true; button.textContent = 'Saved ✓'; notice.textContent = 'Saved to your private history.'; loadHistory();
    } catch (error) { button.disabled = false; notice.textContent = `Could not save: ${error.message}`; }
  }
});

const historySection = document.createElement('section');
historySection.className = 'mx-auto max-w-6xl px-4 pb-14';
historySection.innerHTML = '<h2 class="text-2xl font-black text-blue-950">Your saved history</h2><p class="mt-2 text-sm text-slate-500">Only results you choose to save appear here. You can delete them at any time.</p><div id="linkedinHistory" class="mt-5 space-y-3"></div>';
document.querySelector('main').append(historySection);
let historyRecords = [];
async function loadHistory() {
  const container = document.getElementById('linkedinHistory');
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) { container.innerHTML = '<a href="login.html?next=linkedin.html" class="text-sm font-bold text-blue-900 underline">Sign in to access your saved history.</a>'; return; }
  const { data,error } = await supabase.from('linkedin_generations').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20);
  if (error) { container.textContent = 'History is currently unavailable. Please try again later.'; return; }
  historyRecords = data;
  container.innerHTML = data.length ? data.map(row => `<article class="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><div><strong>${escapeHTML(row.input_summary || 'LinkedIn generation')}</strong><p class="mt-1 text-xs text-slate-500">${row.tool_type === 'profile_makeover' ? 'Profile audit' : 'Post generator'} · ${new Date(row.created_at).toLocaleDateString()}</p></div><div class="flex gap-2"><button data-open-history="${row.id}" class="rounded-lg border px-3 py-3 text-xs font-bold">Open</button><button data-delete-history="${row.id}" class="rounded-lg border px-3 py-3 text-xs font-bold text-red-700">Delete</button></div></article>`).join('') : '<p class="text-sm text-slate-500">No saved results yet. Generate a result and choose Save to history.</p>';
}
historySection.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.openHistory) {
    const record = historyRecords.find(row => row.id === button.dataset.openHistory); if (!record) return;
    states[record.tool_type].result = record.output; states[record.tool_type].saved = true;
    const name = record.tool_type === 'profile_makeover' ? 'profile' : 'post';
    showTab(name,true); record.tool_type === 'profile_makeover' ? renderProfile(record.output) : renderPosts(record.output);
    outputFor(record.tool_type).querySelector('[data-save]').disabled = true;
  }
  if (button.dataset.deleteHistory && confirm('Delete this saved result? This cannot be undone.')) {
    button.disabled = true; const {error} = await supabase.from('linkedin_generations').delete().eq('id',button.dataset.deleteHistory);
    if (error) { notice.textContent = 'Could not delete the result.'; button.disabled = false; } else { notice.textContent = 'Saved result deleted.'; loadHistory(); }
  }
});
loadHistory();

const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Speech) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'rounded-lg border border-blue-200 px-3 py-3 text-xs font-bold text-blue-900'; button.textContent = 'Dictate takeaways';
  const textarea = formFor('post_generator').elements.takeaways; textarea.closest('label').after(button);
  button.addEventListener('click', () => {
    notice.textContent = 'Your browser may send speech audio to its recognition service. Only use dictation if you consent.';
    const recognition = new Speech(); recognition.lang = 'en-ZA';
    recognition.onresult = event => { textarea.value = `${textarea.value} ${event.results[0][0].transcript}`.trim(); };
    recognition.onerror = () => { notice.textContent = 'Dictation unavailable. Please type your takeaways instead.'; };
    recognition.onend = () => { button.textContent = 'Dictate takeaways'; button.disabled = false; };
    button.disabled = true; button.textContent = 'Listening…'; recognition.start();
  });
}
fetch('/api/linkedin-ai').then(response => response.json()).then(data => { if (data.available === false) notice.textContent = 'AI generation is not enabled on this Netlify project yet. You can explore the forms; no images will be sent until generation is available.'; }).catch(() => {});
