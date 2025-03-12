const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const API_URL = 'https://libretranslate.com/translate';

app.post('/translate', async (req, res) => {
    const { text, target } = req.body;

    try {
        const response = await axios.post(API_URL, {
            q: text,
            source: 'auto',
            target: target,
            format: 'text',
        });

        res.json({ translatedText: response.data.translatedText });
    } catch (error) {
        res.status(500).json({ error: 'Translation error' });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
