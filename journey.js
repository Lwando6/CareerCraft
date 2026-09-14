(function () {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    const items = [
        ['index.html', 'fa-house', 'Home'],
        ['resumes.html', 'fa-file-lines', 'Templates'],
        ['pricing.html', 'fa-tags', 'Pricing'],
        ['profile.html', 'fa-user', 'Profile']
    ];
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.className = 'xl:hidden fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur';
    nav.innerHTML = `
        <div class="mx-auto grid max-w-lg grid-cols-4">
            ${items.map(([href, icon, label]) => {
                const active = current === href;
                return `<a href="${href}" ${active ? 'aria-current="page"' : ''}
                    class="flex min-h-16 flex-col items-center justify-center gap-1 px-2 text-xs font-semibold ${active ? 'text-blue-950' : 'text-gray-500 hover:text-blue-900'}">
                    <i class="fa-solid ${icon} ${active ? 'text-amber-500' : ''}" aria-hidden="true"></i>
                    <span>${label}</span>
                </a>`;
            }).join('')}
        </div>`;
    document.body.appendChild(nav);
    document.body.classList.add('pb-16', 'xl:pb-0');
})();
