require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const API_URL = 'https://api-free.deepl.com/v2/translate';

app.post('/translate', async (req, res) => {
    const { text, target } = req.body;

    if (!text || !target) {
        return res.status(400).json({ error: 'Text and target language are required' });
    }

    try {
        const response = await axios.post(
            API_URL,
            new URLSearchParams({
                auth_key: process.env.API_KEY,
                text: text,
                target_lang: target,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const translatedText = response.data.translations[0].text;
        res.json({ translatedText });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Translation error', details: error.response ? error.response.data : error.message });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});