let currentAuthType = 'login';
let authMenuVisible = false;

document.addEventListener('DOMContentLoaded', () => {
    initAuthSystem();
});

function initAuthSystem() {
    setupEventListeners();
    updateAuthUI();

    if (new URLSearchParams(window.location.search).has('logout')) {
        window.history.replaceState({}, '', 'index.html');
        toggleAuthMenu(false);
    }
}

function setupEventListeners() {
    document.getElementById('auth-form')?.addEventListener('submit', handleAuth);

    document.getElementById('profile-icon')?.addEventListener('click', handleProfileClick);

    document.getElementById('auth-modal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('auth-modal')) {
            closeModal();
        }
    });

    document.addEventListener('click', (e) => {
        const authButtons = document.getElementById('auth-buttons');
        const profileIcon = document.getElementById('profile-icon');

        if (authMenuVisible &&
            authButtons &&
            !authButtons.contains(e.target) &&
            !profileIcon.contains(e.target)) {
            toggleAuthMenu(false);
        }
    });
}

function handleProfileClick(e) {
    if (isAuthenticated()) {
        window.location.href = 'user.html';
    } else {
        toggleAuthMenu();
        e.stopPropagation();
    }
}

function showAuthModal(type) {
    currentAuthType = type;
    const modal = document.getElementById('auth-modal');

    document.getElementById('modal-title').textContent = type === 'login' ? 'Login' : 'Register';
    document.getElementById('auth-submit').textContent = type === 'login' ? 'Login' : 'Register';
    document.getElementById('auth-switch').innerHTML = type === 'login'
        ? 'Don\'t have an account? <a href="#" onclick="switchAuthType(event)">Register</a>'
        : 'Already have an account? <a href="#" onclick="switchAuthType(event)">Login</a>';

    document.getElementById('auth-error').textContent = '';
    modal.style.display = 'block';
    toggleAuthMenu(false);
}

function switchAuthType(e) {
    e.preventDefault();
    showAuthModal(currentAuthType === 'login' ? 'register' : 'login');
}

function closeModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!username || !password) {
        showError('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`/${currentAuthType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Authentication failed');

        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('username', data.username);

        await loadUserSettings();
        location.reload();
        updateAuthUI();
        closeModal();

        if (currentAuthType === 'register') {
            showToast('Registration successful! You are now logged in.');
        } else {
            showToast('Authentication successful! You are now logged in.');
        }
    } catch (error) {
        showError(error.message || 'Authentication failed');
    }
}

async function loadUserSettings() {
    try {
        const response = await fetch('/api/settings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const settings = await response.json();
            localStorage.setItem(`userSettings_${sessionStorage.getItem('username')}`, JSON.stringify(settings));
        }
    } catch (error) {
        console.error('Error loading user settings:', error);
    }
}

function updateAuthUI() {
    const isLoggedIn = isAuthenticated();
    const username = sessionStorage.getItem('username') || '';

    const userProfile = document.getElementById('user-profile');
    const authButtons = document.getElementById('auth-buttons');

    if (userProfile) {
        userProfile.style.display = isLoggedIn ? 'flex' : 'none';
        document.getElementById('username-display').textContent = username;
    }

    if (authButtons) {
        authButtons.style.display = 'none';
        authMenuVisible = false;
    }
}

function toggleAuthMenu(show = !authMenuVisible) {
    const authButtons = document.getElementById('auth-buttons');
    if (authButtons) {
        authButtons.style.display = show ? 'flex' : 'none';
        authMenuVisible = show;
        positionAuthButtons();
    }
}

function positionAuthButtons() {
    const authButtons = document.getElementById('auth-buttons');
    if (authButtons) {
        authButtons.style.position = 'absolute';
        authButtons.style.top = '60px';
        authButtons.style.right = '20px';
        authButtons.style.flexDirection = 'column';
        authButtons.style.gap = '5px';
        authButtons.style.backgroundColor = '#79aea7';
        authButtons.style.padding = '10px';
        authButtons.style.borderRadius = '5px';
        authButtons.style.zIndex = '1001';
    }
}

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('username');
    window.location.href = 'index.html?logout=true';
}

function isAuthenticated() {
    return !!sessionStorage.getItem('authToken');
}

function showError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        setTimeout(() => errorElement.textContent = '', 3000);
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    if (toastIcon) {
        switch(type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'fas fa-times-circle';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                toastIcon.className = 'fas fa-info-circle';
        }
    }
    toast.className = 'toast';
    toast.classList.add(type, 'show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}