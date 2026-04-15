import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Константы рангов с цветами для каждой игры
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

// Градиенты для фона страницы под каждую игру
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

  // Эффект для обработки кода авторизации от Discord
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      fetch(`/api/auth/discord`, {
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
      .catch(err => console.error("Ошибка при авторизации через сервер:", err));
    } else {
      const saved = localStorage.getItem('tf_user');
      if (saved) setUser(JSON.parse(saved));
    }
  }, []);

  // Автопрокрутка чата вниз при новых сообщениях
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const login = () => {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify`;
    window.location.href = authUrl;
  };

  const handleSendMessage = async (text) => {
    if (!user) return login();
    if (!text.trim()) return;
    
    const newMsg = { id: Date.now(), user: user.name, text, avatar: user.avatar };
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
    if (!comment || !customTime) {
      alert("Пожалуйста, заполните время игры и краткое описание!");
      return;
    }
    
    const r = RANKS[game][rankIndex];
    const embed = {
      embeds: [{
        title: "🚀 Новый поиск напарника!",
        color: parseInt(r.color.replace('#', ''), 16),
        thumbnail: { url: user.avatar },
        fields: [
          { name: "Выбранная игра", value: game, inline: true },
          { name: "Текущий ранг", value: r.name, inline: true },
          { name: "Когда играем", value: customTime, inline: true },
          { name: "Доп. информация", value: comment }
        ],
        footer: { text: "Отправлено через TeamFinder Web" }
      }]
    };
    
    await fetch(WEBHOOK, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(embed) 
    });
    
    alert("Ваша заявка успешно опубликована!");
    setComment("");
    setCustomTime("");
    setActiveTab('lobby');
  };

  return (
    <div className="App" style={{ background: activeTab === 'create' ? (GAME_COLORS[game] || "#030308") : "#030308" }}>
      {/* Встроенные стили для мобильной адаптации и оформления */}
      <style>{`
        @media (max-width: 768px) {
          .navbar { padding: 10px; height: auto; flex-direction: column; gap: 15px; }
          .nav-links { width: 100%; justify-content: space-around; display: flex; }
          .nav-links button { font-size: 12px; padding: 8px; }
          .main-card { width: 95% !important; margin: 10px auto !important; padding: 15px !important; }
          .row { flex-direction: column; gap: 10px !important; }
          .chat-box { height: 350px !important; }
          .dark-input { font-size: 16px !important; }
          .discord-fixed-btn { width: 50px; height: 50px; font-size: 0; bottom: 20px; right: 20px; border-radius: 50%; }
        }
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <nav className="navbar">
        <div className="nav-logo glow-text" onClick={() => window.location.reload()}>
          TEAM<span>FINDER</span>
        </div>
        <div className="nav-links">
          <button className={activeTab === 'lobby' ? 'active' : ''} onClick={() => setActiveTab('lobby')}>Общий чат</button>
          <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Поиск тимейтов</button>
          <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>Правила</button>
          <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>О проекте</button>
        </div>
        {user ? (
          <div className="user-profile">
            <img src={user.avatar} alt="ava" />
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="login-btn-nav" onClick={login}>Войти в Discord</button>
        )}
      </nav>

      <main className="content">
        {activeTab === 'lobby' && (
          <div className="main-card animate-in">
            <h3 className="glow-text">Лобби общения</h3>
            {!user ? (
              <div className="flex-center-col" style={{height: '300px'}}>
                <p style={{color: '#666', marginBottom: '20px'}}>Нужна авторизация для участия в чате</p>
                <button className="main-btn" onClick={login} style={{width: '200px'}}>Авторизоваться</button>
              </div>
            ) : (
              <>
                <div className="chat-box">
                  {messages.length === 0 && <p style={{textAlign: 'center', color: '#444', marginTop: '100px'}}>Сообщений пока нет...</p>}
                  {messages.map(m => (
                    <div key={m.id} className="msg-row">
                      <img src={m.avatar} className="chat-ava" alt="u" />
                      <div className="msg-bubble">
                        <span className="msg-user">{m.user}</span>
                        <span className="msg-text">{m.text}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="input-box">
                  <input 
                    placeholder="Введите ваше сообщение..." 
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
          <div className="main-card animate-in form-container">
            <h3 className="glow-text">Создание новой заявки</h3>
            <div className="input-group">
              <label>Выберите дисциплину</label>
              <select value={game} onChange={(e) => { setGame(e.target.value); setRankIndex(0); }} className="dark-input">
                {Object.keys(RANKS).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="row" style={{display: 'flex', gap: '20px', marginTop: '15px'}}>
              <div style={{flex: 1}}>
                <label>Ваш уровень игры / Ранг</label>
                <select className="dark-input" value={rankIndex} onChange={(e) => setRankIndex(parseInt(e.target.value))} style={{color: RANKS[game][rankIndex].color}}>
                  {RANKS[game].map((r, i) => <option key={i} value={i} style={{color: r.color}}>{r.name}</option>)}
                </select>
              </div>
              <div style={{flex: 1}}>
                <label>Время начала игры</label>
                <input 
                  className="dark-input" 
                  placeholder="Напр: прямо сейчас / 20:00 МСК" 
                  value={customTime} 
                  onChange={e => setCustomTime(e.target.value)} 
                />
              </div>
            </div>

            <div className="input-group" style={{marginTop: '15px'}}>
              <label>Комментарий к поиску</label>
              <textarea 
                className="dark-input" 
                style={{height: '100px', resize: 'none'}} 
                placeholder="Расскажите о себе: возраст, стиль игры, кого именно ищете..." 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
              />
            </div>

            <button className="main-btn" onClick={sendPost} style={{marginTop: '25px', width: '100%', fontWeight: 'bold'}}>
              Опубликовать в Discord
            </button>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="main-card animate-in" style={{padding: '30px'}}>
            <h3 className="glow-text">Правила платформы TeamFinder</h3>
            <div className="rules-scroll" style={{maxHeight: '400px', overflowY: 'auto', marginTop: '20px'}}>
              {[
                "Уважительное отношение ко всем участникам сообщества.",
                "Запрещено использование нецензурной лексики в публичном чате.",
                "Запрещена любая форма дискриминации и оскорблений.",
                "Запрещен спам одинаковыми сообщениями в чате.",
                "Реклама сторонних ресурсов без согласования запрещена.",
                "Запрещено вводить в заблуждение по поводу своего ранга.",
                "Троллинг и токсичное поведение наказываются баном.",
                "Запрещена публикация шок-контента или вредоносных ссылок.",
                "Администрация оставляет за собой право модерировать контент.",
                "Один пользователь — один аккаунт в системе.",
                "Запрещена продажа услуг и аккаунтов.",
                "Соблюдайте правила платформы Discord.",
                "Будьте дружелюбны и помогайте новичкам.",
                "Желаем всем приятной игры и побед!"
              ].map((text, i) => (
                <div key={i} style={{padding: '12px', borderBottom: '1px solid #111', color: '#888'}}>
                  <strong style={{color: '#5865F2', marginRight: '10px'}}>{i + 1}.</strong> {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="main-card animate-in" style={{padding: '30px'}}>
            <h3 className="glow-text">О нашем проекте</h3>
            <div style={{marginTop: '20px', color: '#aaa', lineHeight: '1.6'}}>
              <p><strong>TeamFinder</strong> — это инновационный мост между вебом и игровым сообществом в Discord.</p>
              <p style={{marginTop: '15px'}}>Наша цель — максимально сократить время на поиск адекватных напарников для ваших любимых игр. Вам больше не нужно листать сотни сообщений в каналах: просто создайте заявку, и она мгновенно отобразится на нашем сервере с красивым оформлением.</p>
              <p style={{marginTop: '15px'}}>Мы используем официальную авторизацию Discord, что гарантирует подлинность профилей. Все ваши сообщения в чате также дублируются через систему вебхуков для максимальной интеграции.</p>
              <p style={{marginTop: '25px', color: '#5865F2'}}>Спасибо, что вы с нами!</p>
            </div>
          </div>
        )}
      </main>

      <a href="https://discord.gg/U6qUFYq8" target="_blank" rel="noreferrer" className="discord-fixed-btn">
        Discord
      </a>
    </div>
  );
}

export default App;