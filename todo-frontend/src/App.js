import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const RANKS = {
  "CS2": [
    { name: "Silver I-VI", color: "#9da2ad" },
    { name: "Gold Nova I-IV", color: "#d9bc3d" },
    { name: "Master Guardian I-Elite", color: "#4b69ff" },
    { name: "DMG / Legendary Eagle", color: "#8847ff" },
    { name: "Supreme / Global Elite", color: "#eb4b4b" },
    { name: "Premier: 10k-20k", color: "#4b69ff" },
    { name: "FACEIT 10 LVL", color: "#ff5500" }
  ],
  "Dota 2": [
    { name: "Herald / Guardian", color: "#5c4c3c" },
    { name: "Crusader / Archon", color: "#4c6c7c" },
    { name: "Legend / Ancient", color: "#8cacc1" },
    { name: "Divine / Immortal", color: "#f1c232" }
  ],
  "Valorant": [
    { name: "Iron / Silver", color: "#cfb53b" },
    { name: "Gold / Platinum", color: "#b382d6" },
    { name: "Diamond / Ascendant", color: "#bb3c44" },
    { name: "Radiant", color: "#ffebb0" }
  ],
  "League of Legends": [
    { name: "Iron / Silver", color: "#9da2ad" },
    { name: "Gold / Platinum / Emerald", color: "#2ecc71" },
    { name: "Diamond / Master", color: "#9b59b6" },
    { name: "Grandmaster / Challenger", color: "#f1c40f" }
  ],
  "Apex Legends": [
    { name: "Bronze / Silver / Gold", color: "#d9bc3d" },
    { name: "Platinum / Diamond", color: "#4b69ff" },
    { name: "Master / Predator", color: "#eb4b4b" }
  ],
  "Rust": [
    { name: "Новичок (до 500ч)", color: "#9da2ad" },
    { name: "Опытный (1000ч+)", color: "#e67e22" },
    { name: "Трайхард (3000ч+)", color: "#c0392b" }
  ],
  "Minecraft": [
    { name: "Survival / Анархия", color: "#2ecc71" },
    { name: "BedWars / SkyWars", color: "#e74c3c" },
    { name: "Техно-сборки / RP", color: "#3498db" }
  ]
};

const GAME_COLORS = {
  "CS2": "radial-gradient(circle at 50% -10%, #16203d 0%, #030308 50%)",
  "Dota 2": "radial-gradient(circle at 50% -10%, #2a163d 0%, #030308 50%)",
  "Valorant": "radial-gradient(circle at 50% -10%, #3d1616 0%, #030308 50%)",
  "League of Legends": "radial-gradient(circle at 50% -10%, #163d3d 0%, #030308 50%)",
  "Apex Legends": "radial-gradient(circle at 50% -10%, #3d2a16 0%, #030308 50%)",
  "Rust": "radial-gradient(circle at 50% -10%, #2d1e16 0%, #030308 50%)",
  "Minecraft": "radial-gradient(circle at 50% -10%, #163d16 0%, #030308 50%)"
};

function App() {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('lobby');
  const [game, setGame] = useState("CS2");
  const [rankIndex, setRankIndex] = useState(0);
  const [customTime, setCustomTime] = useState("");
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);

  const CLIENT_ID = '1493708400847093891';
  const REDIRECT_URI = 'https://z1ylfalp0m.onrender.com'; 
  const WEBHOOK = "https://discord.com/api/webhooks/1493683255042506752/tftDYrEwUHbaQMqEq8gVkgcmj_kLAwrQNJA3l2siO050tNhliRN1FcCfC_aktjtNtKEb";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      fetch(`${REDIRECT_URI}/api/auth/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setUser(data);
          localStorage.setItem('tf_user', JSON.stringify(data));
          window.history.replaceState({}, document.title, "/");
        }
      })
      .catch(err => console.error("Discord Auth Error:", err));
    } else {
      const saved = localStorage.getItem('tf_user');
      if (saved) setUser(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { 
    if (activeTab === 'lobby' && messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }
  }, [messages, activeTab]);

  const login = () => {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify`;
    window.location.href = authUrl;
  };

  const logout = () => {
    if (window.confirm("Вы точно хотите выйти?")) {
      setUser(null);
      localStorage.removeItem('tf_user');
    }
  }

  const handleSendMessage = async (text) => {
    if (!user) return login();
    const newMsg = { id: Date.now(), user: user.name, text: text, avatar: user.avatar };
    setMessages(prev => [...prev, newMsg]);
    
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: user.name, 
        avatar_url: user.avatar, 
        content: `**[ЧАТ]** ${text}` 
      }),
    });
  };

  const sendPost = async () => {
    if (!user) return login();
    if (!comment || !customTime) return alert("Заполни все поля (Время и Описание)!");
    const r = RANKS[game][rankIndex];
    
    const systemMsg = { id: Date.now(), system: true, text: `${user.name} отправил запрос в ${game}` };
    setMessages(prev => [...prev, systemMsg]);

    const embed = {
      embeds: [{
        title: "🎮 Игрок ищет команду!",
        color: parseInt(r.color.replace('#', ''), 16),
        thumbnail: { url: user.avatar },
        fields: [
          { name: "Игра", value: game, inline: true },
          { name: "Ранг", value: r.name, inline: true },
          { name: "Время игры", value: customTime, inline: true },
          { name: "Описание", value: comment }
        ],
        footer: { text: "Отправлено через TeamFinder" }
      }]
    };

    await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(embed) });
    setComment(""); setCustomTime(""); 
    alert("Ваша заявка успешно отправлена в Discord канал!");
    setActiveTab('lobby');
  };

  return (
    <div className="App" style={{ background: activeTab === 'create' ? (GAME_COLORS[game] || "#030308") : "#030308" }}>
      <style>{`
        @media (max-width: 768px) {
          .navbar { padding: 10px; flex-direction: column; height: auto; gap: 15px; }
          .nav-links { gap: 10px; flex-wrap: wrap; justify-content: center; }
          .nav-links button { font-size: 13px; padding: 5px 10px; }
          .main-card { width: 95% !important; margin: 10px auto; min-height: 400px; }
          .row { flex-direction: column; gap: 10px !important; }
          .discord-fixed-btn { width: 50px; height: 50px; font-size: 10px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; bottom: 20px; right: 20px; }
          .chat-box { height: 350px; }
          .dark-input { font-size: 16px; }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-logo glow-text" onClick={() => window.location.reload()}>TEAM<span>FINDER</span></div>
        <div className="nav-links">
          <button className={activeTab === 'lobby' ? 'active' : ''} onClick={() => setActiveTab('lobby')}>Общий чат</button>
          <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Поиск тимейтов</button>
          <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>Правила</button>
          <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>О проекте</button>
        </div>
        {user ? (
          <div className="user-profile" onClick={logout} style={{cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <img src={user.avatar} alt="avatar" style={{width: '32px', borderRadius: '50%'}} />
            <span style={{color: '#fff', fontSize: '14px'}}>{user.name}</span>
          </div>
        ) : (
          <button className="login-btn-nav" onClick={login}>Войти через Discord</button>
        )}
      </nav>

      <main className="content">
        {activeTab === 'lobby' && (
          <div className="main-card animate-in">
            <div className="card-header" style={{padding: '10px', fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px'}}>Discord Live Chat Bridge</div>
            {!user ? (
              <div className="chat-box-auth-prompt flex-center-col" style={{height: '400px'}}>
                <h2 className="glow-text">Чат TeamFinder</h2>
                <p style={{color: '#666', marginBottom: '25px', textAlign: 'center'}}>Авторизуйтесь, чтобы видеть сообщения и общаться с игроками</p>
                <button className="main-btn" style={{width: '240px'}} onClick={login}>Авторизоваться</button>
              </div>
            ) : (
              <>
                <div className="chat-box">
                  {messages.length === 0 && <div style={{textAlign: 'center', color: '#333', marginTop: '50px'}}>Сообщений пока нет... Начни первым!</div>}
                  {messages.map(m => (
                    <div key={m.id} className={"msg-row " + (m.system ? 'system' : '')}>
                      {!m.system && <img src={m.avatar} className="chat-ava" alt="user" />}
                      <div className="msg-bubble">
                        {!m.system && <span className="msg-user">{m.user}</span>}
                        <span className="msg-text">{m.text}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="input-box">
                  <input placeholder="Напишите сообщение в чат..." onKeyDown={(e) => { 
                    if (e.key === 'Enter' && e.target.value.trim()) { 
                      handleSendMessage(e.target.value); e.target.value = ""; 
                    } 
                  }} />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="main-card animate-in form-padding" style={{padding: '30px'}}>
            <h3 className="glow-text" style={{marginBottom: '20px'}}>Создать заявку на поиск</h3>
            
            <div className="form-section">
              <label style={{color: '#888', display: 'block', marginBottom: '8px'}}>Выберите игру</label>
              <select value={game} onChange={(e) => { setGame(e.target.value); setRankIndex(0); }} className="dark-input">
                {Object.keys(RANKS).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="row" style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
              <div style={{flex: 1}}>
                <label style={{color: '#888', display: 'block', marginBottom: '8px'}}>Ваш текущий ранг</label>
                <select className="dark-input" value={rankIndex} onChange={(e) => setRankIndex(parseInt(e.target.value))} style={{color: RANKS[game][rankIndex].color, fontWeight: 'bold'}}>
                  {RANKS[game].map((r, i) => <option key={i} value={i} style={{color: r.color}}>{r.name}</option>)}
                </select>
              </div>
              <div style={{flex: 1}}>
                <label style={{color: '#888', display: 'block', marginBottom: '8px'}}>Время игры</label>
                <input className="dark-input" placeholder="Напр: сейчас / до вечера" value={customTime} onChange={e => setCustomTime(e.target.value)} />
              </div>
            </div>

            <div className="form-section" style={{marginTop: '20px'}}>
              <label style={{color: '#888', display: 'block', marginBottom: '8px'}}>Дополнительный комментарий</label>
              <textarea className="dark-input" style={{height: '120px', resize: 'none'}} placeholder="Напишите, кого вы ищете, ваш возраст или стиль игры..." value={comment} onChange={e => setComment(e.target.value)} />
            </div>

            <button className="main-btn" onClick={sendPost} style={{marginTop: '30px', width: '100%', fontSize: '16px', fontWeight: 'bold'}}>Опубликовать в Discord</button>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="main-card animate-in scrollable-rules" style={{padding: '30px'}}>
            <h3 className="glow-text" style={{marginBottom: '20px'}}>Правила TeamFinder</h3>
            <div className="rules-wrapper">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="rule-item" style={{marginBottom: '15px', borderLeft: '2px solid #5865F2', paddingLeft: '15px'}}>
                  <p style={{color: '#ccc', lineHeight: '1.5'}}>
                    <strong style={{color: '#5865F2'}}>ПРАВИЛО {i+1}:</strong> Относитесь к другим участникам проекта с уважением. Использование мата, токсичность и оскорбления в чате или в описании заявок ведут к блокировке доступа.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="main-card animate-in info-padding" style={{padding: '30px'}}>
            <h3 className="glow-text" style={{marginBottom: '20px'}}>Информация о проекте</h3>
            <div className="info-content" style={{color: '#aaa', lineHeight: '1.8'}}>
              <p><strong>TeamFinder</strong> — это веб-платформа, созданная для того, чтобы объединить игроков в реальном времени. Мы интегрировали наш сайт напрямую с Discord-сервером через систему вебхуков.</p>
              <p style={{marginTop: '15px'}}>Когда вы создаете заявку во вкладке "Поиск", она мгновенно появляется в специальном канале нашего сервера, где её могут увидеть тысячи потенциальных напарников.</p>
              <p style={{marginTop: '15px'}}>Система авторизации Discord используется для подтверждения вашей личности и отображения вашего реального ника и аватара в чате.</p>
            </div>
          </div>
        )}
      </main>

      <a href="https://discord.gg/U6qUFYq8" target="_blank" rel="noreferrer" className="discord-fixed-btn">D<span>ISC</span></a>
    </div>
  );
}

export default App;