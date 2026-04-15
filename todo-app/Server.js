const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const CLIENT_ID = '1493708400847093891';
const CLIENT_SECRET = 'ТВОЙ_СЕКРЕТ_КЛЮЧ'; 
const REDIRECT_URI = 'https://твой-сайт.onrender.com'; 

app.post('/api/auth/discord', async (req, res) => {
    const { code } = req.body;
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        res.json({
            name: userResponse.data.username,
            avatar: `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png`
        });
    } catch (error) {
        res.status(500).json({ error: "Auth failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));