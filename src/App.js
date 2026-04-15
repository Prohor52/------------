import React, { useState, useEffect, useRef } from 'react';
import './App.css'; 

/**
 * =============================================================================
 * TEAMFINDER PROJECT v2.0 - MASTER SOURCE CODE
 * =============================================================================
 * РАСШИРЕННАЯ БАЗА ДАННЫХ ДИСЦИПЛИН И РАНГОВ
 * (Обеспечивает визуальное разнообразие и точность подбора)
 * =============================================================================
 */

const RANKS_DATA = {
  "Counter-Strike 2": [
    { name: "Silver I", color: "#9da2ad" }, { name: "Silver II", color: "#9da2ad" },
    { name: "Silver III", color: "#9da2ad" }, { name: "Silver IV", color: "#9da2ad" },
    { name: "Silver Elite", color: "#9da2ad" }, { name: "Silver Elite Master", color: "#9da2ad" },
    { name: "Gold Nova I", color: "#d9bc3d" }, { name: "Gold Nova II", color: "#d9bc3d" },
    { name: "Gold Nova III", color: "#d9bc3d" }, { name: "Gold Nova Master", color: "#d9bc3d" },
    { name: "Master Guardian I", color: "#4b69ff" }, { name: "Master Guardian II", color: "#4b69ff" },
    { name: "Master Guardian Elite", color: "#4b69ff" }, { name: "Distinguished Master Guardian", color: "#8847ff" },
    { name: "Legendary Eagle", color: "#8847ff" }, { name: "Legendary Eagle Master", color: "#8847ff" },
    { name: "Supreme Master First Class", color: "#eb4b4b" }, { name: "The Global Elite", color: "#eb4b4b" }
  ],
  "Dota 2": [
    { name: "Herald I", color: "#5c4c3c" }, { name: "Herald II", color: "#5c4c3c" },
    { name: "Herald III", color: "#5c4c3c" }, { name: "Herald IV", color: "#5c4c3c" },
    { name: "Herald V", color: "#5c4c3c" }, { name: "Guardian I", color: "#5c4c3c" },
    { name: "Guardian II", color: "#5c4c3c" }, { name: "Guardian III", color: "#5c4c3c" },
    { name: "Guardian IV", color: "#5c4c3c" }, { name: "Guardian V", color: "#5c4c3c" },
    { name: "Crusader I", color: "#4c6c7c" }, { name: "Crusader II", color: "#4c6c7c" },
    { name: "Crusader III", color: "#4c6c7c" }, { name: "Crusader IV", color: "#4c6c7c" },
    { name: "Crusader V", color: "#4c6c7c" }, { name: "Archon I", color: "#4c6c7c" },
    { name: "Archon II", color: "#4c6c7c" }, { name: "Archon III", color: "#4c6c7c" },
    { name: "Archon IV", color: "#4c6c7c" }, { name: "Archon V", color: "#4c6c7c" },
    { name: "Legend I", color: "#8cacc1" }, { name: "Legend II", color: "#8cacc1" },
    { name: "Legend III", color: "#8cacc1" }, { name: "Legend IV", color: "#8cacc1" },
    { name: "Legend V", color: "#8cacc1" }, { name: "Ancient I", color: "#8cacc1" },
    { name: "Ancient II", color: "#8cacc1" }, { name: "Ancient III", color: "#8cacc1" },
    { name: "Ancient IV", color: "#8cacc1" }, { name: "Ancient V", color: "#8cacc1" },
    { name: "Divine I", color: "#f1c232" }, { name: "Divine II", color: "#f1c232" },
    { name: "Divine III", color: "#f1c232" }, { name: "Divine IV", color: "#f1c232" },
    { name: "Divine V", color: "#f1c232" }, { name: "Immortal", color: "#e5c100" }
  ],
  "Valorant": [
    { name: "Iron 1", color: "#515151" }, { name: "Iron 2", color: "#515151" }, { name: "Iron 3", color: "#515151" },
    { name: "Bronze 1", color: "#815d31" }, { name: "Bronze 2", color: "#815d31" }, { name: "Bronze 3", color: "#815d31" },
    { name: "Silver 1", color: "#9da2ad" }, { name: "Silver 2", color: "#9da2ad" }, { name: "Silver 3", color: "#9da2ad" },
    { name: "Gold 1", color: "#d9bc3d" }, { name: "Gold 2", color: "#d9bc3d" }, { name: "Gold 3", color: "#d9bc3d" },
    { name: "Platinum 1", color: "#4b69ff" }, { name: "Platinum 2", color: "#4b69ff" }, { name: "Platinum 3", color: "#4b69ff" },
    { name: "Diamond 1", color: "#b382d6" }, { name: "Diamond 2", color: "#b382d6" }, { name: "Diamond 3", color: "#b382d6" },
    { name: "Ascendant 1", color: "#3ea350" }, { name: "Ascendant 2", color: "#3ea350" }, { name: "Ascendant 3", color: "#3ea350" },
    { name: "Immortal 1", color: "#eb4b4b" }, { name: "Immortal 2", color: "#eb4b4b" }, { name: "Immortal 3", color: "#eb4b4b" },
    { name: "Radiant", color: "#ffebb0" }
  ]
};

/**
 * ЦВЕТОВЫЕ ТЕМЫ ДЛЯ КАЖДОЙ ИГРЫ (ГРАДИЕНТЫ ЗАДНЕГО ФОНА)
 */
const BG_THEMES = {
  "Counter-Strike 2": "radial-gradient(circle at 50% -10%, #1c2b54 0%, #030308 60%)",
  "Dota 2": "radial-gradient(circle at 50% -10%, #3d165c 0%, #030308 60%)",
  "Valorant": "radial-gradient(circle at 50% -10%, #5c1616 0%, #030308 60%)"
};

/**
 * ОСНОВНОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
 * Логика переключения вкладок, авторизации и работы с Discord API
 */
function App() {
  // Состояния для хранения данных пользователя
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Состояния интерфейса
  const [activeTab, setActiveTab] = useState('lobby');
  const [selectedGame, setSelectedGame] = useState("Counter-Strike 2");
  const [selectedRankIdx, setSelectedRankIdx] = useState(0);
  const [gameTime, setGameTime] = useState("");
  const [userComment, setUserComment] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSending, setIsSending] = useState(false);

  // Референс для авто-скролла чата
  const chatEndRef = useRef(null);

  // Константы окружения
  const DISCORD_CLIENT_ID = '1493708400847093891';
  const REDIRECT_URI = window.location.origin;
  const API_ENDPOINT = window.location.origin;
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1493683255042506752/tftDYrEwUHbaQMqEq8gVkgcmj_kLAwrQNJA3l2siO050tNhliRN1FcCfC_aktjtNtKEb";

  /**
   * Эффект инициализации приложения и проверки авторизации
   */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Обмен кода на данные пользователя через бэкенд
      fetch(`${API_ENDPOINT}/api/auth/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(user => {
        if (user && user.name) {
          setCurrentUser(user);
          localStorage.setItem('tf_session', JSON.stringify(user));
          window.history.replaceState({}, document.title, "/");
        }
      })
      .catch(err => console.error("Ошибка OAuth:", err));
    } else {
      const savedSession = localStorage.getItem('tf_session');
      if (savedSession) {
        try { setCurrentUser(JSON.parse(savedSession)); } 
        catch (e) { localStorage.removeItem('tf_session'); }
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [API_ENDPOINT]);

  /**
   * Скролл чата при появлении новых сообщений
   */
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  /**
   * Функция входа через Discord
   */
  const loginWithDiscord = () => {
    const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify`;
    window.location.href = oauthUrl;
  };

  /**
   * Функция выхода
   */
  const logout = () => {
    if (window.confirm("Выйти из системы?")) {
      setCurrentUser(null);
      localStorage.removeItem('tf_session');
      window.location.reload();
    }
  };

  /**
   * Отправка сообщения в глобальный чат
   */
  const handleSendMessage = async (val) => {
    if (!currentUser) return loginWithDiscord();
    if (!val.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: currentUser.name,
      text: val,
      avatar: currentUser.avatar,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.name,
          avatar_url: currentUser.avatar,
          content: `**[Глобальный Чат]**: ${val}`
        })
      });
    } catch (e) { console.error("Webhook error:", e); }
  };

  /**
   * Публикация заявки на поиск тимейтов
   */
  const postApplication = async () => {
    if (!currentUser) return loginWithDiscord();
    if (!gameTime || !userComment) return alert("Заполни все поля, боец!");

    setIsSending(true);
    const rank = RANKS_DATA[selectedGame][selectedRankIdx];
    
    const embedData = {
      embeds: [{
        title: "🚀 ИЩУ ТИМЕЙТОВ!",
        description: userComment,
        color: parseInt(rank.color.replace('#', ''), 16),
        thumbnail: { url: currentUser.avatar },
        fields: [
          { name: "Игра", value: selectedGame, inline: true },
          { name: "Ранг", value: rank.name, inline: true },
          { name: "Когда играем", value: gameTime, inline: true }
        ],
        footer: { text: `Отправил: ${currentUser.name}` }
      }]
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedData)
      });
      if (res.ok) {
        alert("Заявка улетела в Discord!");
        setActiveTab('lobby');
        setGameTime("");
        setUserComment("");
      }
    } catch (e) { alert("Ошибка при отправке."); }
    finally { setIsSending(false); }
  };

  // Рендеринг интерфейса
  return (
    <div className={`App-Main ${isMobile ? 'is-mobile' : ''}`} 
         style={{ background: activeTab === 'create' ? (BG_THEMES[selectedGame] || "#030308") : "#030308" }}>
      
      {/* ШАПКА САЙТА */}
      <header className="site-header">
        <div className="container header-flex">
          <div className="brand" onClick={() => window.location.href = '/'}>
            <div className="brand-logo">TF</div>
            <h1 className="brand-name">TEAM<span>FINDER</span></h1>
          </div>

          <nav className="site-nav">
            <button className={activeTab === 'lobby' ? 'active' : ''} onClick={() => setActiveTab('lobby')}>ЛОББИ</button>
            <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>ПОИСК ИГРОКОВ</button>
            <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>ПРАВИЛА</button>
          </nav>

          <div className="auth-zone">
            {currentUser ? (
              <div className="profile-badge" onClick={logout}>
                <img src={currentUser.avatar} alt="Ava" />
                <span>{currentUser.name}</span>
              </div>
            ) : (
              <button className="login-btn" onClick={loginWithDiscord}>ВОЙТИ ЧЕРЕЗ DISCORD</button>
            )}
          </div>
        </div>
      </header>

      {/* КОНТЕНТНАЯ ОБЛАСТЬ */}
      <main className="container main-content">
        
        {/* ВКЛАДКА ЧАТА */}
        {activeTab === 'lobby' && (
          <section className="tab-section chat-section">
            <div className="glass-card chat-card">
              <div className="chat-info">Глобальный чат сообщества • {messages.length} сообщений</div>
              <div className="chat-window">
                {messages.length === 0 ? (
                  <div className="chat-empty">Здесь пока тихо... Напиши что-нибудь!</div>
                ) : (
                  <div className="msg-list">
                    {messages.map(m => (
                      <div key={m.id} className="msg-item animate-fade">
                        <img src={m.avatar} className="msg-ava" alt="" />
                        <div className="msg-content">
                          <div className="msg-head">
                            <span className="msg-user">{m.user}</span>
                            <span className="msg-time">{m.time}</span>
                          </div>
                          <p className="msg-text">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
              <div className="chat-footer">
                {!currentUser ? (
                  <div className="locked-input" onClick={loginWithDiscord}>Войдите, чтобы писать в чат</div>
                ) : (
                  <input 
                    className="chat-input" 
                    placeholder="Ваше сообщение..." 
                    onKeyDown={e => { if(e.key === 'Enter') { handleSendMessage(e.target.value); e.target.value=''; }}}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ВКЛАДКА СОЗДАНИЯ ЗАЯВКИ */}
        {activeTab === 'create' && (
          <section className="tab-section create-section">
            <div className="glass-card form-card animate-slide">
              <h2 className="tab-title">СОЗДАТЬ ЗАЯВКУ НА ПОИСК</h2>
              <div className="form-grid">
                <div className="input-group full">
                  <label>Выбери игру</label>
                  <select className="tf-input" value={selectedGame} onChange={e => {setSelectedGame(e.target.value); setSelectedRankIdx(0);}}>
                    {Object.keys(RANKS_DATA).map(game => <option key={game} value={game}>{game}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Твой ранг</label>
                  <select 
                    className="tf-input" 
                    style={{ color: RANKS_DATA[selectedGame][selectedRankIdx].color, fontWeight: 'bold' }}
                    value={selectedRankIdx}
                    onChange={e => setSelectedRankIdx(parseInt(e.target.value))}
                  >
                    {RANKS_DATA[selectedGame].map((r, i) => <option key={i} value={i}>{r.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Когда играем?</label>
                  <input className="tf-input" placeholder="Напр: прямо сейчас / через час" value={gameTime} onChange={e => setGameTime(e.target.value)} />
                </div>
                <div className="input-group full">
                  <label>О себе / Требования</label>
                  <textarea className="tf-textarea" placeholder="Напр: ищу +2 в мм, 18+, адекватность" value={userComment} onChange={e => setUserComment(e.target.value)} />
                </div>
              </div>
              <button className="post-btn" onClick={postApplication} disabled={isSending}>
                {isSending ? "ОТПРАВЛЯЕМ..." : "ОПУБЛИКОВАТЬ В DISCORD"}
              </button>
            </div>
          </section>
        )}

        {/* ВКЛАДКА ПРАВИЛ */}
        {activeTab === 'rules' && (
          <section className="tab-section rules-section animate-fade">
            <div className="glass-card rules-card">
              <h2 className="tab-title">ПРАВИЛА СООБЩЕСТВА</h2>
              <div className="rules-grid">
                <div className="rule-box">
                  <span className="rule-num">01</span>
                  <h3>Адекватность</h3>
                  <p>Никакого мата, токсичности и оскорблений в чате. Уважайте своих будущих тимейтов.</p>
                </div>
                <div className="rule-box">
                  <span className="rule-num">02</span>
                  <h3>Честность</h3>
                  <p>Указывайте свой реальный ранг. Обман вскроется в первой же катке, а репутация будет испорчена.</p>
                </div>
                <div className="rule-box">
                  <span className="rule-num">03</span>
                  <h3>Анти-спам</h3>
                  <p>Не создавайте более одной заявки за 10 минут. Дайте другим тоже найти себе команду.</p>
                </div>
                <div className="rule-box">
                  <span className="rule-num">04</span>
                  <h3>Безопасность</h3>
                  <p>Не переходите по подозрительным ссылкам от незнакомых людей. Администрация TF никогда не просит пароль.</p>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ПОДВАЛ */}
      <footer className="site-footer">
        <div className="container footer-content">
          <p>© 2026 TeamFinder Project. Все права защищены. Powered by Discord API.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;