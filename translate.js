let timeoutId;
let lastValidTranslation = "";

function clearText() {
    const text = document.getElementById('text').value;
    const translatedText = document.getElementById('translatedText').innerText;

    if (text && translatedText && translatedText !== "Translated text") {
        saveToHistory(text, translatedText, document.getElementById('target').value, true);
    }

    document.getElementById('text').value = "";
    document.getElementById('translatedText').innerText = "Translated text";

    loadHistory();
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

        if (response.ok && data.translatedText) {
            lastValidTranslation = data.translatedText;
            document.getElementById('text').dataset.lastText = text;
            document.getElementById('translatedText').innerText = lastValidTranslation;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
    }
}

// Функция debounce
function debounce(func, delay) {
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function saveToHistory(sourceText, translatedText, targetLang, visible) {
    const history = JSON.parse(sessionStorage.getItem('translationHistory')) || [];
    history.push({
        sourceText,
        translatedText,
        targetLang,
        visibility: visible,
        timestamp: new Date().toLocaleString()
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
                <strong>${item.sourceText}</strong> → ${item.translatedText} (${item.targetLang}, ${item.timestamp})
            </li>
        `).join('');
}

function clearHistory() {
    sessionStorage.removeItem('translationHistory');
    loadHistory();
}

document.getElementById('text').addEventListener('input', function (event) {
    setTimeout(() => {
        if (!event.target.value.trim() && lastValidTranslation) {
            saveToHistory(document.getElementById('text').dataset.lastText, lastValidTranslation, document.getElementById('target').value, true);
            lastValidTranslation = ""; // Сбрасываем перевод после сохранения
            document.getElementById('translatedText').innerText = "Translated text";
            loadHistory();
        }
    }, 0);
});

window.onload = loadHistory;

document.getElementById('text').addEventListener('input', debounce(translator, 25));
document.getElementById('clearButton').addEventListener('click', clearText);
