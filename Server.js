const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // если используешь для Discord
const app = express();

app.use(cors());
app.use(express.json());

// --- ТВОИ API ЭНДПОИНТЫ (например, для Discord) ---
app.get('/api/login', (req, res) => {
    // Твоя логика входа
    res.json({ message: "Backend is working!" });
});

// --- ГЛАВНЫЙ БЛОК ДЛЯ РАБОТЫ НА RENDER ---

// 1. Указываем серверу, где лежат файлы собранного фронтенда
app.use(express.static(path.join(__dirname, 'build')));

// 2. Любой запрос, который не относится к API, отправляем на index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 3. Используем порт, который дает Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});