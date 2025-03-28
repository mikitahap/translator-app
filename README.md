# 🌍 Translator App with DeepL API and SQLite

![App Screenshot]([https://imgur.com/a/tYzYqIY](https://i.imgur.com/3j87yNm.png))

## ✨ Features

- **Real-time Translation**: With debounce for performance.
- **DeepL API**: Translates 30+ languages.
- **User Authentication**: Registration, JWT-based security, profile management.
- **Customization**: Dark/light mode, default language, translation history.
- **Translation History**: Saved temporarily with sessionStorage, with optional permanent storage.

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **Database**: SQLite
- **API Integration**: DeepL API

### Key Endpoints:

- **/translate**: Translation requests
- **/register**: Create new user
- **/login**: User authentication
- **/api/settings**: User preferences

### Data Storage:

| Data Type           | Storage         | Example              |
|---------------------|-----------------|----------------------|
| Auth Tokens         | sessionStorage  | authToken, username  |
| User Settings       | localStorage    | userSettings_username|
| Translation History | sessionStorage  | translationHistory   |
| User Accounts       | SQLite Database | users table          |

---

## 🚀 Quick Start

1. **Clone the repo**:
    ```bash
    git clone https://github.com/mikitahap/translator-app.git
    cd translator-app/server
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Configure environment**:
    ```bash
    echo "API_KEY=your_deepl_key SECRET_KEY=your_strong_jwt_secret_here" > .env
    ```

4. **Run the server**:
    ```bash
    node server.js
    ```

5. **Open `http://localhost:3000/`** in your browser.

---


## 📚 API Reference

| Method | Endpoint         | Description                |
|--------|------------------|----------------------------|
| POST   | /translate       | Translate text             |
| POST   | /register        | Register a new user        |
| GET    | /api/settings    | Get user settings           |

**Sample Request**:
```json
POST /translate
{
    "text": "Hello world",
    "target": "ES"
}
