const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = '1493708400847093891';
const CLIENT_SECRET = 'SDlVzIHvtW-zjOKDrl4UHXW1bv8nteia'; // ВОЗЬМИ ЕГО В DISCORD DEV PORTAL
const REDIRECT_URI = 'https://z1ylfalp0m.onrender.com';

app.use(express.static(path.join(__dirname, 'build')));

app.post('/api/auth/discord', async (req, res) => {
    const { code } = req.body;
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        res.json({
            name: userResponse.data.username,
            avatar: `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png`
        });
    } catch (e) { res.status(500).send(e.message); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server run on ${PORT}`));