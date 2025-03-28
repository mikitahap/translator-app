let timeoutId;
let lastValidTranslation = "";
let isClearing = false;

function isAuthenticated() {
    return !!sessionStorage.getItem('authToken');
}

function clearText() {
    const text = document.getElementById('text').value;
    const translatedText = document.getElementById('translatedText').innerText;

    if (text && translatedText && translatedText !== "Translated text") {
        saveToHistory(text, translatedText, document.getElementById('target').value, true);
    }

    document.getElementById('text').value = "";
    document.getElementById('translatedText').innerText = "Translated text";

    loadHistory();
    isClearing = true;
}

async function translator() {
    const text = document.getElementById('text').value;
    const target = document.getElementById('target').value;

    if (!text) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, target })
        });

        const data = await response.json();

        if (response.ok && data.translatedText && document.getElementById('text').value !== '') {
            lastValidTranslation = data.translatedText;
            document.getElementById('text').dataset.lastText = text;
            document.getElementById('translatedText').innerText = lastValidTranslation;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
    }
}

function debounce(func, delay) {
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
function shouldSaveHistory() {
    const username = sessionStorage.getItem('username');
    if (!username) return true;

    const settings = JSON.parse(localStorage.getItem(`userSettings_${username}`)) || {};
    return settings.saveHistory !== false;
}

function clearHistory() {
    sessionStorage.removeItem('translationHistory');
    loadHistory();
}

function saveToHistory(sourceText, translatedText, targetLang, visible) {
    if (!shouldSaveHistory()) {
        return;
    }
    const history = JSON.parse(sessionStorage.getItem('translationHistory')) || [];
    history.push({
        sourceText,
        translatedText,
        visibility: visible,
    });
    sessionStorage.setItem('translationHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(sessionStorage.getItem('translationHistory')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = history
        .filter(item => item.visibility)
        .map(item => `
            <li>
                <strong>${item.sourceText}</strong> → ${item.translatedText}
            </li>
        `).join('');
}


document.getElementById('text').addEventListener('input', function (event) {
    const textarea = event.target;

    if (textarea.value === "" && isClearing) {
        saveToHistory(document.getElementById('text').dataset.lastText, lastValidTranslation, document.getElementById('target').value, true);
        lastValidTranslation = "";
        loadHistory();
        document.getElementById('translatedText').innerText = "Translated text";
    }
    else if (textarea.value === ""){
        document.getElementById('translatedText').innerText = "Translated text";
    }

    isClearing = false;
});

document.getElementById('text').addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        setTimeout(() => {
            if (document.getElementById('text').selectionStart === 0 && document.getElementById('text').selectionEnd === document.getElementById('text').value.length) {
                isClearing = true;
            }
        }, 0);
    }
    if (event.key === 'Delete' && document.getElementById('text').selectionStart === 0 && document.getElementById('text').selectionEnd === document.getElementById('text').value.length) {
        isClearing = true;
    }
});

document.getElementById('text').addEventListener('mouseup', function () {
    const textarea = document.getElementById('text');
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    if (selectionStart === 0 && selectionEnd === textarea.value.length) {
        isClearing = true;
    }
});

document.getElementById('text').addEventListener('select', function () {
    const textarea = document.getElementById('text');
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    if (selectionStart === 0 && selectionEnd === textarea.value.length) {
        isClearing = true;
    }
});

window.onload = loadHistory;

document.getElementById('text').addEventListener('input', debounce(translator, 25));
document.getElementById('clearButton').addEventListener('click', clearText);
