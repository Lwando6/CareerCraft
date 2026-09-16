import { supabase } from './auth.js';

const form = document.getElementById('githubForm');
const input = document.getElementById('githubUsername');
const container = document.getElementById('github-repos');
const cvPanel = document.getElementById('cvProjectPanel');
const resumePicker = document.getElementById('resumePicker');
const addButton = document.getElementById('addProjectsToResume');
const portfolioStatus = document.getElementById('portfolioStatus');
const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
let currentUser = null;
let repositories = [];

function selectedRepositories() {
  const selectedNames = new Set([...document.querySelectorAll('[data-project-select]:checked')].map(input => input.value));
  return repositories.filter(repo => selectedNames.has(repo.name)).map(repo => ({
    name: String(repo.name || '').slice(0, 120),
    description: String(repo.description || 'GitHub project').slice(0, 500),
    language: String(repo.language || '').slice(0, 80),
    url: /^https:\/\/github\.com\//.test(repo.html_url || '') ? repo.html_url : '',
    homepage: /^https?:\/\//.test(repo.homepage || '') ? repo.homepage : '',
    stars: Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0,
    updatedAt: repo.updated_at || null
  }));
}

function updateSelectionStatus() {
  if (!currentUser) return;
  const count = selectedRepositories().length;
  portfolioStatus.textContent = count ? `${count} project${count === 1 ? '' : 's'} selected.` : 'Select at least one project.';
  addButton.disabled = !count || !resumePicker.value;
}

async function load(username) {
  container.innerHTML = '<p class="col-span-2 py-10 text-center text-gray-500">Loading public projects…</p>';
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error(response.status === 404 ? 'GitHub user not found.' : 'GitHub could not load these projects.');
    repositories = await response.json();
    container.innerHTML = repositories.length ? repositories.map(repo => `<article class="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div>${currentUser ? `<label class="mb-4 flex cursor-pointer items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-950"><input type="checkbox" data-project-select value="${escapeHTML(repo.name)}" class="h-4 w-4 accent-blue-950"> Add this project to my CV</label>` : ''}<div class="mb-3 flex items-center justify-between gap-3"><h3 class="font-bold text-blue-950">${escapeHTML(repo.name)}</h3><span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">${escapeHTML(repo.language || 'Code')}</span></div><p class="mb-6 text-sm leading-relaxed text-gray-600">${escapeHTML(repo.description || 'Public engineering repository.')}</p></div><a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener" class="text-sm font-bold text-blue-700">View source code →</a></article>`).join('') : '<p class="col-span-2 text-center text-gray-500">No public repositories found.</p>';
    updateSelectionStatus();
  } catch (error) { container.innerHTML = `<p class="col-span-2 text-center text-red-600">${escapeHTML(error.message)}</p>`; }
}

form.addEventListener('submit', event => { event.preventDefault(); load(input.value.trim()); });
const { data: { user } } = await supabase.auth.getUser();
currentUser = user;
if (user) {
  const { data: resumes, error: resumeError } = await supabase.from('resumes').select('id,title,template_slug,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (resumeError) {
    cvPanel.classList.remove('hidden');
    portfolioStatus.textContent = 'Your saved CVs could not be loaded. Please refresh and try again.';
    addButton.disabled = true;
  } else if (resumes?.length) {
    resumePicker.innerHTML = resumes.map(resume => `<option value="${escapeHTML(resume.id)}">${escapeHTML(resume.title || 'My CV')} · ${escapeHTML((resume.template_slug || '').replaceAll('-', ' '))}</option>`).join('');
    cvPanel.classList.remove('hidden');
  } else {
    cvPanel.classList.remove('hidden');
    resumePicker.innerHTML = '<option value="">No saved CV yet</option>';
    portfolioStatus.innerHTML = 'Create and save a CV first, then return here. <a class="font-bold text-blue-800 underline" href="editor.html">Create a CV</a>';
    addButton.disabled = true;
  }
  const { data: profile } = await supabase.from('profiles').select('github_username').eq('user_id', user.id).maybeSingle();
  if (profile?.github_username) { input.value = profile.github_username; load(profile.github_username); }
} else {
  container.innerHTML = '<p class="col-span-2 text-center text-gray-500">Enter a GitHub username to preview public projects.</p>';
}

container.addEventListener('change', event => { if (event.target.matches('[data-project-select]')) updateSelectionStatus(); });
resumePicker.addEventListener('change', updateSelectionStatus);
addButton.addEventListener('click', async () => {
  const projects = selectedRepositories();
  if (!currentUser || !resumePicker.value || !projects.length) return updateSelectionStatus();
  addButton.disabled = true;
  addButton.textContent = 'Adding…';
  portfolioStatus.textContent = 'Saving selected projects to your CV…';
  const { data: resume, error: readError } = await supabase.from('resumes').select('id,content').eq('id', resumePicker.value).eq('user_id', currentUser.id).maybeSingle();
  if (readError || !resume) {
    portfolioStatus.textContent = 'That CV could not be loaded. Refresh the page and try again.';
  } else {
    const existing = Array.isArray(resume.content?.projects) ? resume.content.projects : [];
    const merged = [...existing];
    projects.forEach(project => {
      const index = merged.findIndex(item => item.name === project.name && item.url === project.url);
      if (index >= 0) merged[index] = project; else merged.push(project);
    });
    const content = { ...(resume.content || {}), projects: merged.slice(0, 12), sections: { ...(resume.content?.sections || {}), projects: true } };
    const { error: updateError } = await supabase.from('resumes').update({ content, updated_at: new Date().toISOString() }).eq('id', resume.id).eq('user_id', currentUser.id);
    if (updateError) portfolioStatus.textContent = `Projects could not be saved: ${updateError.message}`;
    else portfolioStatus.innerHTML = `${projects.length} project${projects.length === 1 ? '' : 's'} added successfully. <a class="font-bold text-blue-800 underline" href="editor.html?id=${encodeURIComponent(resume.id)}">Open this CV</a>`;
  }
  addButton.textContent = 'Add to chosen CV';
  addButton.disabled = !selectedRepositories().length || !resumePicker.value;
});
