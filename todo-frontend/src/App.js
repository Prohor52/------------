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

  // ОБНОВЛЕННАЯ ССЫЛКА (ПРОВЕРЬ БУКВЫ!)
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
      .catch(err => console.error("Ошибка авторизации:", err));
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
    if (window.confirm("Выйти из аккаунта?")) {
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
      body: JSON.stringify({ username: user.name, avatar_url: user.avatar, content: `**[ЧАТ]** ${text}` }),
    });
  };

  const sendPost = async () => {
    if (!user) return login();
    if (!comment || !customTime) return alert("Заполни все поля!");
    const r = RANKS[game][rankIndex];
    
    const systemMsg = { id: Date.now(), system: true, text: `${user.name} ищет напарников в ${game}` };
    setMessages(prev => [...prev, systemMsg]);

    const embed = {
      embeds: [{
        title: "⚡ Новый поиск напарника!",
        color: parseInt(r.color.replace('#', ''), 16),
        thumbnail: { url: user.avatar },
        fields: [
          { name: "Игра", value: game, inline: true },
          { name: "Ранг", value: r.name, inline: true },
          { name: "Когда", value: customTime, inline: true },
          { name: "Описание", value: comment }
        ]
      }]
    };

    await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(embed) });
    setComment(""); setCustomTime(""); setActiveTab('lobby');
  };

  return (
    <div className="App" style={{ background: activeTab === 'create' ? (GAME_COLORS[game] || "#030308") : "#030308" }}>
      <nav className="navbar">
        <div className="nav-logo glow-text">TEAM<span>FINDER</span></div>
        <div className="nav-links">
          <button className={activeTab === 'lobby' ? 'active' : ''} onClick={() => setActiveTab('lobby')}>Общий чат</button>
          <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Поиск тимейтов</button>
          <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>Правила</button>
          <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>О проекте</button>
        </div>
        {user ? (
          <div className="user-profile" onClick={logout} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src={user.avatar} alt="ava" style={{width: '30px', borderRadius: '50%'}} />
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="login-btn-nav" onClick={login}>Войти через Discord</button>
        )}
      </nav>

      <main className="content">
        {activeTab === 'lobby' && (
          <div className="main-card compact animate-in">
            <div className="card-header" style={{padding: '10px', fontSize: '12px', color: '#555'}}>Live Sync Active</div>
            {!user ? (
              <div className="chat-box-auth-prompt flex-center-col">
                <h3 className="glow-text">Чат TeamFinder</h3>
                <button className="main-btn" style={{width: '200px'}} onClick={login}>Авторизоваться</button>
              </div>
            ) : (
              <>
                <div className="chat-box">
                  {messages.map(m => (
                    <div key={m.id} className={"msg-row " + (m.system ? 'system' : '')}>
                      {!m.system && <img src={m.avatar} className="chat-ava" alt="" />}
                      <div className="msg-bubble">
                        {!m.system && <span className="msg-user">{m.user}</span>}
                        <span className="msg-text">{m.text}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="input-box">
                  <input placeholder="Напишите сообщение..." onKeyDown={(e) => { 
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
          <div className="main-card compact animate-in form-padding">
            <h3 className="glow-text">Создать заявку</h3>
            <select value={game} onChange={(e) => setGame(e.target.value)} className="dark-input" style={{marginBottom: '15px'}}>
              {Object.keys(RANKS).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <div className="row" style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
              <select className="dark-input" value={rankIndex} onChange={(e) => setRankIndex(parseInt(e.target.value))} style={{color: RANKS[game][rankIndex].color}}>
                {RANKS[game].map((r, i) => <option key={i} value={i} style={{color: r.color}}>{r.name}</option>)}
              </select>
              <input className="dark-input" placeholder="Время игры" value={customTime} onChange={e => setCustomTime(e.target.value)} />
            </div>
            <textarea className="dark-input" style={{height: '100px', resize: 'none', marginBottom: '15px'}} placeholder="Комментарий..." value={comment} onChange={e => setComment(e.target.value)} />
            <button className="main-btn" onClick={sendPost}>Опубликовать</button>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="main-card compact animate-in scrollable-rules">
            <h3 className="glow-text">Правила</h3>
            {[...Array(14)].map((_, i) => (
              <p key={i} style={{textAlign: 'left', color: '#888', marginBottom: '10px'}}>
                <span style={{color: '#5865F2', fontWeight: 'bold'}}>{i+1}.</span> Правило номер {i+1}: Уважайте других игроков.
              </p>
            ))}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="main-card compact animate-in info-padding">
            <h3 className="glow-text">О проекте</h3>
            <p style={{color: '#ccc', textAlign: 'left'}}>TeamFinder — автоматическая система поиска напарников для игр.</p>
          </div>
        )}
      </main>

      <a href="https://discord.gg/U6qUFYq8" target="_blank" rel="noreferrer" className="discord-fixed-btn">Наш Discord</a>
    </div>
  );
}

export default App;