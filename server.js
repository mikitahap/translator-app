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

const API_URL = 'https://api.mymemory.translated.net/get';

app.post('/translate', async (req, res) => {
    const { text, target } = req.body;

    const langpair = `auto|${target}`;

    try {
        const response = await axios.get(API_URL, {
            params: {
                q: text,
                langpair: langpair
            }
        });

        const translatedText = response.data.responseData.translatedText;

        res.json({ translatedText });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Translation error', details: error.response ? error.response.data : error.message });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});