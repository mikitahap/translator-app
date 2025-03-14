let timeoutId;

async function translator() {
    const text = document.getElementById('text').value;
    const target = document.getElementById('target').value;
    const lang = document.getElementById('lang').value;

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
            body: JSON.stringify({ text, lang, target })
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

document.getElementById('text').addEventListener('input', translator);