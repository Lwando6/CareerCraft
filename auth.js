(function () {
    const USERS_KEY = 'careercraft-users';
    const CURRENT_USER_KEY = 'careercraft-current-user';
    const PROFILES_KEY = 'careercraft-profiles';
    const SELECTED_TEMPLATE_KEY = 'careercraft-selected-template';
    const SELECTED_PLAN_KEY = 'careercraft-selected-plan';

    function parseStoredValue(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                return fallback;
            }
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function getUsers() {
        return parseStoredValue(USERS_KEY, []);
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getCurrentUser() {
        return parseStoredValue(CURRENT_USER_KEY, null);
    }

    function setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(CURRENT_USER_KEY);
            return;
        }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    function getProfiles() {
        return parseStoredValue(PROFILES_KEY, {});
    }

    function saveProfiles(profiles) {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }

    function getSelectedTemplate() {
        return parseStoredValue(SELECTED_TEMPLATE_KEY, null);
    }

    function setSelectedTemplate(template) {
        if (!template) {
            localStorage.removeItem(SELECTED_TEMPLATE_KEY);
            return;
        }
        localStorage.setItem(SELECTED_TEMPLATE_KEY, JSON.stringify(template));
    }

    function getSelectedPlan() {
        return parseStoredValue(SELECTED_PLAN_KEY, null);
    }

    function setSelectedPlan(plan) {
        if (!plan) {
            localStorage.removeItem(SELECTED_PLAN_KEY);
            return;
        }
        localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify(plan));
    }

    function getProfileForEmail(email) {
        if (!email) {
            return { name: '', email: '', role: '', bio: '', location: '' };
        }

        const profiles = getProfiles();
        const profile = profiles[email.toLowerCase()] || {};

        return {
            name: profile.name || '',
            email: email,
            role: profile.role || '',
            bio: profile.bio || '',
            location: profile.location || ''
        };
    }

    function saveProfileForEmail(email, profile) {
        const profiles = getProfiles();
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const nextProfile = { ...(profiles[normalizedEmail] || {}), ...profile };
        profiles[normalizedEmail] = nextProfile;
        saveProfiles(profiles);
    }

    function updateAuthUI() {
        const currentUser = getCurrentUser();
        const loginLink = document.getElementById('navLoginLink');
        const signupLink = document.getElementById('navSignupLink');
        const profileLink = document.getElementById('navProfileLink');
        const logoutButton = document.getElementById('navLogoutButton');

        if (!loginLink && !signupLink && !profileLink && !logoutButton) {
            return;
        }

        if (currentUser) {
            if (loginLink) loginLink.classList.add('hidden');
            if (signupLink) signupLink.classList.add('hidden');
            if (profileLink) profileLink.classList.remove('hidden');
            if (logoutButton) logoutButton.classList.remove('hidden');
        } else {
            if (loginLink) loginLink.classList.remove('hidden');
            if (signupLink) signupLink.classList.remove('hidden');
            if (profileLink) profileLink.classList.add('hidden');
            if (logoutButton) logoutButton.classList.add('hidden');
        }
    }

    function handleLogout() {
        const logoutButton = document.getElementById('navLogoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                setCurrentUser(null);
                window.location.href = 'login.html';
            });
        }
    }

    function handleLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        const statusBox = document.getElementById('loginStatus');

        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const users = getUsers();
            const matchedUser = users.find(function (user) {
                return user.email.toLowerCase() === email.toLowerCase() && user.password === password;
            });

            if (!matchedUser) {
                statusBox.textContent = 'Invalid email or password. Please use the account you created.';
                statusBox.className = 'mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700';
                return;
            }

            setCurrentUser({
                name: matchedUser.name,
                email: matchedUser.email,
                role: matchedUser.role
            });

            window.location.href = 'profile.html';
        });
    }

    function handleSignupForm() {
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) return;

        const statusBox = document.getElementById('signupStatus');

        signupForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const role = document.getElementById('signupRole').value.trim();
            const password = document.getElementById('signupPassword').value;

            const users = getUsers();
            const emailTaken = users.some(function (user) {
                return user.email.toLowerCase() === email.toLowerCase();
            });

            if (!name || !email || !role || !password) {
                statusBox.textContent = 'Please complete all fields before creating your account.';
                statusBox.className = 'mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700';
                return;
            }

            if (emailTaken) {
                statusBox.textContent = 'That email address is already in use. Please log in or use a different email.';
                statusBox.className = 'mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700';
                return;
            }

            const newUser = { name, email, role, password };
            users.push(newUser);
            saveUsers(users);

            saveProfileForEmail(email, {
                name,
                email,
                role,
                bio: '',
                location: ''
            });

            setCurrentUser({
                name,
                email,
                role
            });

            window.location.href = 'profile.html';
        });
    }

    function handleProfilePage() {
        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;

        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const profile = getProfileForEmail(currentUser.email);
        document.getElementById('profileName').value = currentUser.name || profile.name || '';
        document.getElementById('profileEmail').value = currentUser.email || profile.email || '';
        document.getElementById('profileRole').value = currentUser.role || profile.role || '';
        document.getElementById('profileBio').value = profile.bio || '';
        document.getElementById('profileLocation').value = profile.location || '';

        const selectedTemplate = getSelectedTemplate();
        const selectedPlan = getSelectedPlan();
        const selectedTemplateEl = document.getElementById('selectedTemplateSummary');
        const selectedPlanEl = document.getElementById('selectedPlanSummary');

        if (selectedTemplateEl) {
            selectedTemplateEl.textContent = selectedTemplate ? `${selectedTemplate.name} (${selectedTemplate.category})` : 'No template selected yet';
        }

        if (selectedPlanEl) {
            selectedPlanEl.textContent = selectedPlan ? `${selectedPlan.name} — ${selectedPlan.price}` : 'No subscription selected yet';
        }

        const profileStatus = document.getElementById('profileStatus');
        const logoutButton = document.getElementById('logoutButton');

        if (logoutButton) {
            logoutButton.addEventListener('click', function () {
                setCurrentUser(null);
                setSelectedTemplate(null);
                setSelectedPlan(null);
                window.location.href = 'login.html';
            });
        }

        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const updatedName = document.getElementById('profileName').value.trim();
            const updatedEmail = document.getElementById('profileEmail').value.trim();
            const updatedRole = document.getElementById('profileRole').value.trim();
            const updatedBio = document.getElementById('profileBio').value.trim();
            const updatedLocation = document.getElementById('profileLocation').value.trim();

            const users = getUsers();
            const userIndex = users.findIndex(function (user) {
                return user.email.toLowerCase() === currentUser.email.toLowerCase();
            });

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    name: updatedName,
                    email: updatedEmail,
                    role: updatedRole,
                    password: users[userIndex].password
                };
                saveUsers(users);
            }

            const previousEmail = currentUser.email.toLowerCase();
            const nextEmail = updatedEmail.toLowerCase();
            const profiles = getProfiles();

            if (previousEmail !== nextEmail && profiles[previousEmail]) {
                profiles[nextEmail] = {
                    ...(profiles[nextEmail] || {}),
                    ...profiles[previousEmail]
                };
                delete profiles[previousEmail];
                saveProfiles(profiles);
            }

            saveProfileForEmail(updatedEmail, {
                name: updatedName,
                email: updatedEmail,
                role: updatedRole,
                bio: updatedBio,
                location: updatedLocation
            });

            setCurrentUser({
                name: updatedName,
                email: updatedEmail,
                role: updatedRole
            });

            if (profileStatus) {
                profileStatus.textContent = 'Your profile has been updated successfully.';
                profileStatus.className = 'mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700';
            }
        });
    }

    function handleTemplateSelection() {
        const cards = document.querySelectorAll('[data-template-card]');
        if (!cards.length) return;

        const currentSelection = getSelectedTemplate();

        cards.forEach(function (card) {
            const name = card.dataset.templateName;
            const button = card.querySelector('[data-template-action]');
            const isSelected = currentSelection && currentSelection.name === name;

            if (button) {
                button.textContent = isSelected ? 'Selected' : 'View Template';
                button.classList.toggle('bg-emerald-500', isSelected);
                button.classList.toggle('text-white', isSelected);
                button.classList.toggle('hover:bg-emerald-400', isSelected);
                button.classList.toggle('bg-blue-950', !isSelected);
                button.classList.toggle('text-white', !isSelected);
                button.classList.toggle('hover:bg-blue-900', !isSelected);
            }

            card.classList.toggle('ring-2', isSelected);
            card.classList.toggle('ring-amber-400', isSelected);
            card.classList.toggle('shadow-lg', isSelected);

            if (button) {
                button.addEventListener('click', function () {
                    const currentUser = getCurrentUser();
                    if (!currentUser) {
                        window.location.href = 'login.html';
                        return;
                    }

                    const template = {
                        name: name,
                        category: card.dataset.templateCategory,
                        description: card.dataset.templateDescription
                    };

                    setSelectedTemplate(template);
                    const selectedTemplatePanel = document.getElementById('selectedTemplatePanel');
                    if (selectedTemplatePanel) {
                        selectedTemplatePanel.innerHTML = `
                            <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                <p class="text-xs uppercase tracking-widest text-amber-700 font-bold">Selected template</p>
                                <h3 class="mt-2 text-2xl font-black text-blue-950">${template.name}</h3>
                                <p class="mt-2 text-sm text-gray-700">${template.category} • ${template.description}</p>
                            </div>
                        `;
                    }

                    cards.forEach(function (item) {
                        const itemButton = item.querySelector('[data-template-action]');
                        const itemSelected = item.dataset.templateName === name;
                        if (itemButton) {
                            itemButton.textContent = itemSelected ? 'Selected' : 'View Template';
                        }
                    });
                });
            }
        });
    }

    function handlePlanSelection() {
        const cards = document.querySelectorAll('[data-plan-card]');
        if (!cards.length) return;

        const currentSelection = getSelectedPlan();

        cards.forEach(function (card) {
            const name = card.dataset.planName;
            const price = card.dataset.planPrice;
            const button = card.querySelector('[data-plan-action]');
            const isSelected = currentSelection && currentSelection.name === name;

            if (button) {
                button.textContent = isSelected ? 'Selected' : 'Select Plan';
                button.classList.toggle('bg-emerald-500', isSelected);
                button.classList.toggle('text-white', isSelected);
                button.classList.toggle('hover:bg-emerald-400', isSelected);
                button.classList.toggle('bg-blue-950', !isSelected);
                button.classList.toggle('text-white', !isSelected);
                button.classList.toggle('hover:bg-blue-900', !isSelected);
            }

            card.classList.toggle('ring-2', isSelected);
            card.classList.toggle('ring-amber-400', isSelected);
            card.classList.toggle('shadow-xl', isSelected);

            if (button) {
                button.addEventListener('click', function () {
                    const currentUser = getCurrentUser();
                    if (!currentUser) {
                        window.location.href = 'login.html';
                        return;
                    }

                    const plan = { name, price };
                    setSelectedPlan(plan);
                    const selectedPlanPanel = document.getElementById('selectedPlanPanel');
                    if (selectedPlanPanel) {
                        selectedPlanPanel.innerHTML = `
                            <div class="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                                <p class="text-xs uppercase tracking-widest text-blue-700 font-bold">Selected subscription</p>
                                <h3 class="mt-2 text-2xl font-black text-blue-950">${plan.name}</h3>
                                <p class="mt-2 text-sm text-gray-700">${plan.price}</p>
                            </div>
                        `;
                    }

                    cards.forEach(function (item) {
                        const itemButton = item.querySelector('[data-plan-action]');
                        const itemSelected = item.dataset.planName === name;
                        if (itemButton) {
                            itemButton.textContent = itemSelected ? 'Selected' : 'Select Plan';
                        }
                    });
                });
            }
        });
    }

    function redirectIfAuthenticated() {
        const currentUser = getCurrentUser();
        const page = location.pathname.split('/').pop();

        if ((page === 'login.html' || page === 'signup.html') && currentUser) {
            window.location.href = 'profile.html';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        redirectIfAuthenticated();
        updateAuthUI();
        handleLogout();
        handleLoginForm();
        handleSignupForm();
        handleProfilePage();
        handleTemplateSelection();
        handlePlanSelection();
    });

    window.CareerCraftAuth = {
        getCurrentUser,
        setCurrentUser,
        getUsers,
        saveUsers,
        getProfileForEmail,
        saveProfileForEmail,
        getProfiles,
        saveProfiles,
        getSelectedTemplate,
        setSelectedTemplate,
        getSelectedPlan,
        setSelectedPlan
    };
})();
