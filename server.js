require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const app = express();

app.use(express.json());
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const API_URL = 'https://api-free.deepl.com/v2/translate';

app.post('/api/update-username', authenticateToken, async (req, res) => {
    const { newUsername } = req.body;
    const currentUsername = req.user.username;

    if (!newUsername || newUsername.length < 3) {
        return res.status(400).json({ error: 'Name length should be less than 3 symbols' });
    }

    try {
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE username = ?", [newUsername], (err, row) => {
                if (err) reject(err);
                resolve(!!row);
            });
        });

        if (userExists) {
            return res.status(400).json({ error: 'This username already exists' });
        }

        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET username = ? WHERE username = ?",
                [newUsername, currentUsername],
                (err) => err ? reject(err) : resolve()
            );
        });

        const token = jwt.sign({ username: newUsername }, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            success: true,
            newUsername,
            token
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});


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

        const defaultSettings = {
            language: 'EN',
            darkMode: false,
            saveHistory: true
        };

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

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/api/settings', authenticateToken, (req, res) => {
    db.get("SELECT settings FROM users WHERE username = ?", [req.user.username], (err, row) => {
        if (err || !row) {
            return res.status(500).json({ error: 'Failed to load settings' });
        }

        try {
            const settings = row.settings ? JSON.parse(row.settings) : {};
            res.json(settings);
        } catch (e) {
            res.status(500).json({ error: 'Invalid settings format' });
        }
    });
});

app.post('/api/save-settings', authenticateToken, (req, res) => {
    const { settings } = req.body;

    if (!settings) {
        return res.status(400).json({ error: 'Settings are required' });
    }

    db.run("UPDATE users SET settings = ? WHERE username = ?",
        [JSON.stringify(settings), req.user.username],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save settings' });
            }
            res.json({ message: 'Settings saved successfully' });
        }
    );
});

app.delete('/api/delete-account', authenticateToken, (req, res) => {
    db.run("DELETE FROM users WHERE username = ?", [req.user.username], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete account' });
        }
        res.json({ message: 'Account deleted successfully' });
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
