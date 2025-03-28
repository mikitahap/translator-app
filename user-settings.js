document.addEventListener('DOMContentLoaded', () => {
    initializeUsernameField()
    loadUserSettings();
    setupEventListeners();
});

function initializeUsernameField() {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.disabled = true;
        usernameInput.value = sessionStorage.getItem('username') || '';
    }
}
async function updateUsername(newUsername) {
    const usernameInput = document.getElementById('username');
    const currentUsername = sessionStorage.getItem('username');

    if (!newUsername || newUsername.trim().length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        usernameInput.value = currentUsername;
        enableEdit('username');
        return;
    }

    try {
        const response = await fetch('/api/update-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ newUsername: newUsername.trim() })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to update username');
        }

        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('username', data.newUsername);

        document.getElementById('username-display').textContent = data.newUsername;
        document.getElementById('username').value = data.newUsername;

        loadUserSettings();

        showToast('Username updated successfully!', 'success');

    } catch (error) {
        console.error('Username update failed:', error);
        usernameInput.value = currentUsername;
        enableEdit('username');
        showToast(error.message, 'error');
    }
}


function setupEventListeners() {
    document.getElementById('email').addEventListener('change', () => saveSetting('email'));
    document.getElementById('dark-mode').addEventListener('change', () => saveSetting('dark-mode'));
    document.getElementById('save-history').addEventListener('change', () => saveSetting('save-history'));
    document.getElementById('language').addEventListener('change', () => saveSetting('language'));
}

function loadUserSettings() {
    const username = sessionStorage.getItem('username');
    if (!username) return;

    document.getElementById('username-display').textContent = username;
    document.getElementById('username').value = username;
    initializeUsernameField();

    const settings = JSON.parse(localStorage.getItem(`userSettings_${username}`)) || {};

    if (!settings.language) {
        settings.language = 'en';
        localStorage.setItem(`userSettings_${username}`, JSON.stringify(settings));
    }

    if (settings.email) document.getElementById('email').value = settings.email;
    if (settings.darkMode) document.getElementById('dark-mode').checked = settings.darkMode;
    if (settings.saveHistory) document.getElementById('save-history').checked = settings.saveHistory;
    if (settings.language) {
        document.getElementById('language').value = settings.language;
        const targetSelect = document.getElementById('target');
        if (targetSelect) {
            targetSelect.value = settings.language;
        }
    }

    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function enableEdit(fieldId) {
    const input = document.getElementById(fieldId);
    const btn = input.nextElementSibling;

    if (input.disabled) {
        input.disabled = false;
        input.focus();
        btn.innerHTML = '<i class="fas fa-save"></i>';
        btn.onclick = () => {
            if (fieldId === 'username') {
                updateUsername(input.value.trim());
            } else {
                saveSetting(fieldId);
            }
        };
    } else {
        input.disabled = true;
        input.value = sessionStorage.getItem('username');
        btn.innerHTML = '<i class="fas fa-edit"></i>';
        btn.onclick = () => enableEdit(fieldId);
    }
}

function clearHistory() {
    sessionStorage.removeItem('translationHistory');
    loadHistory();
}

async function saveSetting(settingId) {
    const username = sessionStorage.getItem('username');
    if (!username) return;

    let value;
    const inputElement = document.getElementById(settingId);
    if (inputElement.type === 'checkbox') {
        value = inputElement.checked;
    } else {
        value = inputElement.value;
    }

    const settings = JSON.parse(localStorage.getItem(`userSettings_${username}`)) || {};

    switch(settingId) {
        case 'email':
            settings.email = value;
            break;
        case 'dark-mode':
            settings.darkMode = value;
            if (value) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            break;
        case 'save-history':
            settings.saveHistory = value;
            if (!value) {
                clearHistory();
            }
            break;
        case 'language':
            settings.language = value;
            const targetSelect = document.getElementById('target');
            if (targetSelect) {
                targetSelect.value = value;
            }
            break;
    }

    localStorage.setItem(`userSettings_${username}`, JSON.stringify(settings));
    showToast('Settings saved successfully', 'success');
}

function showConfirmModal(action, message) {
    document.getElementById('confirm-modal').style.display = 'block';
    document.getElementById('confirm-modal-text').textContent = message;
    document.getElementById('confirm-modal').dataset.action = action;
}

function closeModal() {
    document.getElementById('confirm-modal').style.display = 'none';
}

async function confirmAction() {
    const action = document.getElementById('confirm-modal').dataset.action;
    const username = sessionStorage.getItem('username');

    try {
        if (action === 'clear-history') {
            sessionStorage.removeItem('translationHistory');
            showToast('Translation history cleared', 'success');
        } else if (action === 'delete-account') {
            const response = await fetch('/api/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('username');
            localStorage.removeItem(`userSettings_${username}`);

            showToast('Account deleted successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Action failed', 'error');
    }

    closeModal();
}

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('username');
    window.location.href = 'index.html';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i id="toast-icon" class="fas ${type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-times-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'}"></i>
            ${message}
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}