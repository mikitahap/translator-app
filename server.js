require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your-strong-secret-key-here';
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const API_URL = 'https://api-free.deepl.com/v2/translate';

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (row) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.run("INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    username
                });
            }
        );
    });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (!row) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, row.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            username
        });
    });
});
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
