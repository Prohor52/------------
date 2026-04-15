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

  // Твой личный Webhook для интеграции с Discord
  const WEBHOOK = "https://discord.com/api/webhooks/1493683255042506752/tftDYrEwUHbaQMqEq8gVkgcmj_kLAwrQNJA3l2siO050tNhliRN1FcCfC_aktjtNtKEb";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Здесь должна быть логика обмена code на данные пользователя через твой бэкенд
      // Для теста эмулируем получение твоего имени из Discord
      const discordUser = { 
        name: "Discord User", // В реальности здесь будет ответ от API Discord
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Discord" 
      };
      setUser(discordUser);
      localStorage.setItem('tf_user', JSON.stringify(discordUser));
      window.history.replaceState({}, document.title, "/");
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
    window.location.href = "https://discord.com/oauth2/authorize?client_id=1493708400847093891&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000&scope=identify";
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

    // ОТПРАВКА В ТВОЙ ДИСКОРД ЧЕРЕЗ ВЕБХУК
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: user.name, 
        avatar_url: user.avatar, 
        content: `**[ЧАТ]** ${text}` 
      }),
    }).catch(err => console.error("Ошибка вебхука:", err));
  };

  const sendPost = async () => {
    if (!user) return login();
    if (!comment || !customTime) return alert("Заполни все поля!");
    const r = RANKS[game][rankIndex];
    
    const systemMsg = { 
      id: Date.now(), 
      system: true, 
      text: `${user.name} ищет напарников в ${game} (${r.name})` 
    };
    setMessages(prev => [...prev, systemMsg]);

    // ФОРМИРУЕМ КРАСИВЫЙ EMBED ДЛЯ ВЕБХУКА
    const embed = {
      embeds: [{
        title: "⚡ Новый поиск напарника!",
        description: `Пользователь **${user.name}** ищет тимейтов.`,
        color: parseInt(r.color.replace('#', ''), 16),
        thumbnail: { url: user.avatar },
        fields: [
          { name: "🎮 Игра", value: game, inline: true },
          { name: "🏆 Ранг", value: r.name, inline: true },
          { name: "⏰ Когда", value: customTime, inline: true },
          { name: "📝 Описание", value: comment }
        ],
        footer: { text: "TeamFinder Website Integration" }
      }]
    };

    await fetch(WEBHOOK, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(embed) 
    });

    setComment("");
    setCustomTime("");
    setActiveTab('lobby');
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
          <div className="user-profile" onClick={logout}>
            <img src={user.avatar} alt="ava" />
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="login-btn-nav" onClick={login}>Войти через Discord</button>
        )}
      </nav>

      <main className="content">
        {activeTab === 'lobby' && (
          <div className="main-card compact animate-in">
            <div className="card-header"><span></span> Live Discord Sync</div>
            
            {!user ? (
              <div className="chat-box-auth-prompt form-padding flex-center-col">
                <h3 className="glow-text">Чат TeamFinder</h3>
                <p style={{ color: '#888', marginBottom: '30px' }}>Авторизуйтесь, чтобы общаться с игроками напрямую через Discord.</p>
                <button className="main-btn-auth" onClick={login}>Авторизоваться</button>
              </div>
            ) : (
              <>
                <div className="chat-box">
                  {messages.length === 0 ? (
                    <div className="empty-chat">Сообщений пока нет. Будь первым!</div>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={"msg-row " + (m.system ? 'system' : '')}>
                        {!m.system && <img src={m.avatar} className="chat-ava" alt="" />}
                        <div className="msg-bubble">
                          {!m.system && <span className="msg-user">{m.user}</span>}
                          <span className="msg-text">{m.text}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="input-box">
                  <input 
                    placeholder="Ваше сообщение в Discord..." 
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && e.target.value.trim()) { 
                        handleSendMessage(e.target.value); 
                        e.target.value = ""; 
                      } 
                    }} 
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="main-card compact animate-in form-padding">
            <h3 className="glow-text">Создать заявку</h3>
            <div className="input-group">
              <label>Выбери игру</label>
              <select value={game} onChange={(e) => setGame(e.target.value)} className="dark-input themed-select">
                {Object.keys(RANKS).map(g => <option key={g} value={g} style={{backgroundColor: '#0d0d1a'}}>{g}</option>)}
              </select>
            </div>
            <div className="row">
              <div className="input-group">
                <label>Твой ранг</label>
                <select className="dark-input themed-select" value={rankIndex} onChange={(e) => setRankIndex(parseInt(e.target.value))} style={{color: RANKS[game][rankIndex].color}}>
                  {RANKS[game].map((r, i) => <option key={i} value={i} style={{color: r.color, backgroundColor: '#0d0d1a'}}>{r.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Когда</label>
                <input className="dark-input" placeholder="Напр: сейчас" value={customTime} onChange={e => setCustomTime(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Комментарий</label>
              <textarea className="dark-input" style={{height: '100px'}} placeholder="Напиши что-нибудь о себе..." value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <button className="main-btn" onClick={sendPost}>Опубликовать в Discord</button>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="main-card compact animate-in scrollable-rules">
            <h3 className="glow-text">Правила</h3>
            <div className="rules-list">
              {[...Array(14)].map((_, i) => (
                <p key={i}><span>{i+1}.</span> Правило номер {i+1}: Будьте вежливы и уважайте других игроков.</p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="main-card compact animate-in info-padding">
            <h3 className="glow-text">TeamFinder</h3>
            <div className="text-content">
              <p>Это автоматизированная платформа для поиска тиммейтов.</p>
              <p>Все сообщения синхронизируются с нашим Discord сервером в реальном времени.</p>
            </div>
          </div>
        )}
      </main>

      <a href="https://discord.gg" target="_blank" rel="noreferrer" className="discord-fixed-btn">Наш Discord</a>
    </div>
  );
}

export default App;