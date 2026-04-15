const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ВСТАВЬ СВОЙ СЕКРЕТ НИЖЕ
const CLIENT_ID = '1493708400847093891';
const CLIENT_SECRET = 'SDlVzIHvtW-zjOKDrl4UHXW1bv8nteia'
const REDIRECT_URI = 'https://z1ylfalp0m.onrender.com';

app.use(express.static(path.join(__dirname, 'build')));

app.post('/api/auth/discord', async (req, res) => {
  const { code } = req.body;
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    });

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params);
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    res.json({
      name: userRes.data.username,
      avatar: `https://cdn.discordapp.com/avatars/${userRes.data.id}/${userRes.data.avatar}.png`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));