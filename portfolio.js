import { supabase } from './auth.js';

const form = document.getElementById('githubForm');
const input = document.getElementById('githubUsername');
const container = document.getElementById('github-repos');
const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

async function load(username) {
  container.innerHTML = '<p class="col-span-2 py-10 text-center text-gray-500">Loading public projects…</p>';
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error(response.status === 404 ? 'GitHub user not found.' : 'GitHub could not load these projects.');
    const repos = await response.json();
    container.innerHTML = repos.length ? repos.map(repo => `<article class="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div><div class="mb-3 flex items-center justify-between gap-3"><h3 class="font-bold text-blue-950">${escapeHTML(repo.name)}</h3><span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">${escapeHTML(repo.language || 'Code')}</span></div><p class="mb-6 text-sm leading-relaxed text-gray-600">${escapeHTML(repo.description || 'Public engineering repository.')}</p></div><a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener" class="text-sm font-bold text-blue-700">View source code →</a></article>`).join('') : '<p class="col-span-2 text-center text-gray-500">No public repositories found.</p>';
  } catch (error) { container.innerHTML = `<p class="col-span-2 text-center text-red-600">${escapeHTML(error.message)}</p>`; }
}

form.addEventListener('submit', event => { event.preventDefault(); load(input.value.trim()); });
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data: profile } = await supabase.from('profiles').select('github_username').eq('user_id', user.id).maybeSingle();
  if (profile?.github_username) { input.value = profile.github_username; load(profile.github_username); }
} else {
  container.innerHTML = '<p class="col-span-2 text-center text-gray-500">Enter a GitHub username to preview public projects.</p>';
}
