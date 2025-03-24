let currentAuthType = 'login';

function showAuthModal(type) {
    currentAuthType = type;
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('auth-submit');
    const switchLink = document.getElementById('auth-switch');

    title.textContent = type === 'login' ? 'Login' : 'Register';
    submitBtn.textContent = type === 'login' ? 'Login' : 'Register';
    switchLink.innerHTML = type === 'login'
        ? 'Don\'t have an account? <a href="#" onclick="switchAuthType()">Register</a>'
        : 'Already have an account? <a href="#" onclick="switchAuthType()">Login</a>';

    modal.style.display = 'block';
}

function switchAuthType() {
    showAuthModal(currentAuthType === 'login' ? 'register' : 'login');
}

function closeModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    if (!username || !password) {
        document.getElementById('auth-error').textContent = 'Please fill all fields';
        return;
    }

    try {
        let response;
        if (currentAuthType === 'login') {
            response = {
                ok: true,
                json: async () => ({
                    token: 'mock-token',
                    username: username
                })
            };
        } else {
            response = {
                ok: true,
                json: async () => ({
                    token: 'mock-token',
                    username: username
                })
            };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('username', data.username);

        console.log('Stored username:', data.username);

        updateAuthUI();
        closeModal();

        if (currentAuthType === 'register') {
            alert('Registration successful! You are now logged in.');
        }
    } catch (error) {
        document.getElementById('auth-error').textContent = error.message;
        console.error('Auth error:', error);
    }
}

function toggleAuthButtons() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');

    if (userProfile.style.display === 'flex') return;

    authButtons.style.display = authButtons.style.display === 'none' ? 'flex' : 'none';

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

function updateAuthUI() {
    const username = sessionStorage.getItem('username');
    console.log('Retrieved username:', username);

    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    const authButtons = document.getElementById('auth-buttons');

    if (username && username !== 'undefined') {
        if (userProfile) userProfile.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = username;
        if (authButtons) authButtons.style.display = 'none';
    } else {
        if (userProfile) userProfile.style.display = 'none';
        if (authButtons) authButtons.style.display = 'none';
    }
}

function logout() {
    sessionStorage.clear();
    updateAuthUI();
    window.location.reload();
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    updateAuthUI();

    document.addEventListener('click', (e) => {
        const authButtons = document.getElementById('auth-buttons');
        const profileIcon = document.querySelector('.profile-icon');

        if (authButtons && authButtons.style.display !== 'none' &&
            !authButtons.contains(e.target) &&
            !profileIcon.contains(e.target)) {
            authButtons.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    updateAuthUI();
});