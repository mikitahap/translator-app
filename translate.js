let timeoutId;

function clearText() {
    const text = document.getElementById('text').value;
    const translatedText = document.getElementById('translatedText').innerText;

    if (text && translatedText && translatedText !== "Translated text") {
        saveToHistory(text, translatedText, document.getElementById('target').value);
    }


    document.getElementById('text').value = "";
    document.getElementById('translatedText').innerText = "Translated text";

    loadHistory();
}

async function translator() {
    const text = document.getElementById('text').value;
    const target = document.getElementById('target').value;

    if (!text) {
        document.getElementById('translatedText').innerText = "";
        return 0;
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

        if (response.ok) {
            document.getElementById('translatedText').innerText = data.translatedText;
        } else {
            alert(data.error || 'An error occurred');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
    }
}


function debounce(func, delay) {
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function saveToHistory(sourceText, translatedText, targetLang) {
    const history = JSON.parse(sessionStorage.getItem('translationHistory')) || [];
    history.push({
        sourceText,
        translatedText,
        targetLang,
        timestamp: new Date().toLocaleString() // Добавляем время перевода
    });
    sessionStorage.setItem('translationHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(sessionStorage.getItem('translationHistory')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = history.map(item => `
        <li>
            <strong>${item.sourceText}</strong> → ${item.translatedText} (${item.targetLang}, ${item.timestamp})
        </li>
    `).join('');
}

function clearHistory() {
    sessionStorage.removeItem('translationHistory');
    loadHistory();
}


window.onload = loadHistory;


document.getElementById('text').addEventListener('input', debounce(translator, 25));


document.getElementById('clearButton').addEventListener('click', clearText);
