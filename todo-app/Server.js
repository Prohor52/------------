const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ДАННЫЕ ИЗ DISCORD DEV PORTAL
const CLIENT_ID = '1493708400847093891';
const CLIENT_SECRET = 'SDlVzIHvtW-zjOKDrl4UHXW1bv8nteia'
const REDIRECT_URI = 'https://z1ylfalp0m.onrender.com';

// Раздаем статические файлы фронтенда
app.use(express.static(path.join(__dirname, 'build')));

// Маршрут для авторизации
app.post('/api/auth/discord', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Код не передан' });

  try {
    // 1. Обмениваем код на токен доступа
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    });

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // 2. С этим токеном идем за данными юзера (@me)
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    // 3. Отправляем в React имя и ссылку на аватар
    res.json({
      name: userRes.data.username,
      avatar: `https://cdn.discordapp.com/avatars/${userRes.data.id}/${userRes.data.avatar}.png`
    });

  } catch (err) {
    console.error('Discord Auth Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// Если юзер обновит страницу, отдаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server lives on port ${PORT}`));