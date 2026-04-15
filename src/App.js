import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // БЕЗ ЭТОГО ФАЙЛА КРАСОТЫ НЕ БУДЕТ

/**
 * =============================================================================
 * КОНСТАНТЫ И ДАННЫЕ ПРИЛОЖЕНИЯ (МАССИВНЫЙ БЛОК)
 * =============================================================================
 */

const RANKS_DATA = {
  "CS2": [
    { name: "Silver I", color: "#9da2ad" },
    { name: "Silver II", color: "#9da2ad" },
    { name: "Silver III", color: "#9da2ad" },
    { name: "Silver IV", color: "#9da2ad" },
    { name: "Silver Elite", color: "#9da2ad" },
    { name: "Silver Elite Master", color: "#9da2ad" },
    { name: "Gold Nova I", color: "#d9bc3d" },
    { name: "Gold Nova II", color: "#d9bc3d" },
    { name: "Gold Nova III", color: "#d9bc3d" },
    { name: "Gold Nova Master", color: "#d9bc3d" },
    { name: "Master Guardian I", color: "#4b69ff" },
    { name: "Master Guardian II", color: "#4b69ff" },
    { name: "Master Guardian Elite", color: "#4b69ff" },
    { name: "Distinguished Master Guardian", color: "#8847ff" },
    { name: "Legendary Eagle", color: "#8847ff" },
    { name: "Legendary Eagle Master", color: "#8847ff" },
    { name: "Supreme Master First Class", color: "#eb4b4b" },
    { name: "The Global Elite", color: "#eb4b4b" }
  ],
  "Dota 2": [
    { name: "Herald (1-5)", color: "#5c4c3c" },
    { name: "Guardian (1-5)", color: "#5c4c3c" },
    { name: "Crusader (1-5)", color: "#4c6c7c" },
    { name: "Archon (1-5)", color: "#4c6c7c" },
    { name: "Legend (1-5)", color: "#8cacc1" },
    { name: "Ancient (1-5)", color: "#8cacc1" },
    { name: "Divine (1-5)", color: "#f1c232" },
    { name: "Immortal", color: "#e5c100" }
  ],
  "Valorant": [
    { name: "Iron", color: "#515151" },
    { name: "Bronze", color: "#815d31" },
    { name: "Silver", color: "#9da2ad" },
    { name: "Gold", color: "#d9bc3d" },
    { name: "Platinum", color: "#4b69ff" },
    { name: "Diamond", color: "#b382d6" },
    { name: "Ascendant", color: "#3ea350" },
    { name: "Immortal", color: "#eb4b4b" },
    { name: "Radiant", color: "#ffebb0" }
  ]
};

const BACKGROUND_THEMES = {
  "CS2": "radial-gradient(circle at 50% -10%, #16203d 0%, #030308 50%)",
  "Dota 2": "radial-gradient(circle at 50% -10%, #2a163d 0%, #030308 50%)",
  "Valorant": "radial-gradient(circle at 50% -10%, #3d1616 0%, #030308 50%)"
};

const UI_STRINGS = {
  lobbyTitle: "Глобальное лобби поиска игроков",
  createTitle: "Создание новой заявки в Discord",
  rulesTitle: "Свод правил и положений сообщества",
  footerText: "© 2026 TeamFinder Project. Все права защищены. Работает на Discord OAuth2."
};

/**
 * =============================================================================
 * ОСНОВНОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
 * =============================================================================
 */

function App() {
  // --- СОСТОЯНИЯ (STATES) ---
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('lobby');
  const [selectedGame, setSelectedGame] = useState("CS2");
  const [selectedRankIdx, setSelectedRankIdx] = useState(0);
  const [gameTime, setGameTime] = useState("");
  const [userComment, setUserComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);

  // Референсы
  const chatBottomRef = useRef(null);

  // Конфиг (ИСПРАВЛЕНО ДЛЯ RENDER)
  const DISCORD_CLIENT_ID = '1493708400847093891';
  const API_URL = window.location.origin; 
  const REDIRECT_URL = window.location.origin;
  const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1493683255042506752/tftDYrEwUHbaQMqEq8gVkgcmj_kLAwrQNJA3l2siO050tNhliRN1FcCfC_aktjtNtKEb";

  // --- ЭФФЕКТЫ ---

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');

    if (authCode) {
      console.log("Обнаружен код авторизации. Выполняю запрос к серверу...");
      setIsLoading(true);
      fetch(`${API_URL}/api/auth/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode })
      })
      .then(res => {
        if (!res.ok) throw new Error("Ошибка сервера при авторизации");
        return res.json();
      })
      .then(userData => {
        if (userData && userData.name) {
          setCurrentUser(userData);
          localStorage.setItem('tf_user_session', JSON.stringify(userData));
          window.history.replaceState({}, document.title, "/");
        }
      })
      .catch(err => {
        console.error("Ошибка авторизации:", err);
        alert("Не удалось авторизоваться. Убедитесь, что бэкенд запущен!");
      })
      .finally(() => setIsLoading(false));
    } else {
      const stored = localStorage.getItem('tf_user_session');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem('tf_user_session');
        }
      }
    }
  }, [API_URL]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // --- ОБРАБОТЧИКИ ---

  const handleLogin = () => {
    console.log("Перенаправление на OAuth Discord...");
    const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=identify`;
    window.location.href = url;
  };

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти из профиля?")) {
      setCurrentUser(null);
      localStorage.removeItem('tf_user_session');
      window.location.reload();
    }
  };

  const sendMessage = async (text) => {
    if (!currentUser) return handleLogin();
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      author: currentUser.name,
      content: text,
      avatar: currentUser.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.name,
          avatar_url: currentUser.avatar,
          content: `**[ЧАТ САЙТА]**: ${text}`
        })
      });
    } catch (e) {
      console.warn("Вебхук чата не сработал, но сообщение добавлено локально.");
    }
  };

  const submitApplication = async () => {
    if (!currentUser) return handleLogin();
    if (!gameTime || !userComment) {
      alert("Пожалуйста, заполните все поля формы!");
      return;
    }

    const rank = RANKS_DATA[selectedGame][selectedRankIdx];
    
    const embed = {
      embeds: [{
        title: "🚀 НОВАЯ ЗАЯВКА НА ПОИСК",
        description: userComment,
        color: parseInt(rank.color.replace('#', ''), 16),
        thumbnail: { url: currentUser.avatar },
        author: { name: currentUser.name },
        fields: [
          { name: "🎮 Игра", value: selectedGame, inline: true },
          { name: "🏆 Ранг", value: rank.name, inline: true },
          { name: "⏰ Время", value: gameTime, inline: true }
        ],
        footer: { text: "Отправлено через TeamFinder Web" },
        timestamp: new Date().toISOString()
      }]
    };

    setIsLoading(true);
    try {
      const response = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed)
      });

      if (response.ok) {
        alert("Заявка успешно опубликована в Discord!");
        setGameTime("");
        setUserComment("");
        setActiveTab('lobby');
      } else {
        throw new Error("Discord Webhook Error");
      }
    } catch (e) {
      alert("Ошибка при отправке в Discord. Проверьте настройки вебхука.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ВЕРСТКА ПРИЛОЖЕНИЯ ---

  return (
    <div 
      className={`App-Wrapper ${isMobile ? 'is-mobile' : 'is-desktop'}`}
      style={{ 
        background: activeTab === 'create' 
          ? (BACKGROUND_THEMES[selectedGame] || "#030308") 
          : "#030308" 
      }}
    >
      {/* HEADER SECTION */}
      <header className="header-main">
        <div className="container header-inner">
          <div className="logo-group" onClick={() => window.location.href = '/'}>
            <div className="logo-icon">TF</div>
            <h1 className="logo-text">TEAM<span>FINDER</span></h1>
          </div>

          <nav className="nav-bar">
            <button 
              className={`nav-link ${activeTab === 'lobby' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('lobby')}
            >
              ЛОББИ
            </button>
            <button 
              className={`nav-link ${activeTab === 'create' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              ПОИСК ИГРОКОВ
            </button>
            <button 
              className={`nav-link ${activeTab === 'rules' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              ПРАВИЛА
            </button>
          </nav>

          <div className="user-controls">
            {currentUser ? (
              <div className="profile-capsule" onClick={handleLogout}>
                <img src={currentUser.avatar} alt="Avatar" className="avatar-img" />
                <span className="profile-name">{currentUser.name}</span>
              </div>
            ) : (
              <button className="btn-discord" onClick={handleLogin}>
                {isLoading ? "ВХОД..." : "ВОЙТИ С DISCORD"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="container content-main">
        
        {/* TAB: LOBBY / CHAT */}
        {activeTab === 'lobby' && (
          <section className="section-lobby animate-in">
            <div className="card chat-card">
              <div className="chat-header">
                <h3>{UI_STRINGS.lobbyTitle}</h3>
                <span className="badge-online">LIVE</span>
              </div>
              
              <div className="chat-messages-box">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <p>Сообщений пока нет. Станьте первым!</p>
                  </div>
                ) : (
                  <div className="messages-scroll">
                    {messages.map((m) => (
                      <div key={m.id} className="msg-row">
                        <img src={m.avatar} className="msg-avatar" alt="" />
                        <div className="msg-body">
                          <div className="msg-info">
                            <span className="msg-author">{m.author}</span>
                            <span className="msg-time">{m.timestamp}</span>
                          </div>
                          <p className="msg-text">{m.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                )}
              </div>

              <div className="chat-input-bar">
                {!currentUser ? (
                  <div className="input-locked">
                    <p>Чтобы отправлять сообщения, необходимо авторизоваться</p>
                  </div>
                ) : (
                  <div className="input-group">
                    <input 
                      type="text" 
                      placeholder="Напишите что-нибудь в чат..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button className="btn-send">➤</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB: CREATE APPLICATION */}
        {activeTab === 'create' && (
          <section className="section-create animate-in">
            <div className="card form-card">
              <h2 className="card-title">{UI_STRINGS.createTitle}</h2>
              
              <div className="form-layout">
                <div className="form-group span-2">
                  <label>Выберите дисциплину</label>
                  <select 
                    value={selectedGame} 
                    onChange={(e) => { setSelectedGame(e.target.value); setSelectedRankIdx(0); }}
                  >
                    {Object.keys(RANKS_DATA).map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ваш текущий ранг</label>
                  <select 
                    style={{ color: RANKS_DATA[selectedGame][selectedRankIdx].color, fontWeight: 'bold' }}
                    value={selectedRankIdx}
                    onChange={(e) => setSelectedRankIdx(parseInt(e.target.value))}
                  >
                    {RANKS_DATA[selectedGame].map((rank, index) => (
                      <option key={index} value={index} style={{ color: rank.color }}>
                        {rank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Время начала игры</label>
                  <input 
                    type="text" 
                    placeholder="Напр: сейчас / 18:00 МСК" 
                    value={gameTime}
                    onChange={(e) => setGameTime(e.target.value)}
                  />
                </div>

                <div className="form-group span-2">
                  <label>Дополнительная информация</label>
                  <textarea 
                    placeholder="Опишите, кого вы ищете, требования к микрофону, возрасту и т.д."
                    rows="4"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-actions span-2">
                  <button 
                    className="btn-primary" 
                    onClick={submitApplication}
                    disabled={isLoading}
                  >
                    {isLoading ? "ОТПРАВКА..." : "ОПУБЛИКОВАТЬ ЗАЯВКУ"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB: RULES */}
        {activeTab === 'rules' && (
          <section className="section-rules animate-in">
            <div className="card rules-card">
              <h2 className="card-title">{UI_STRINGS.rulesTitle}</h2>
              <div className="rules-content">
                <div className="rule-item">
                  <span className="rule-num">01</span>
                  <div className="rule-text">
                    <h4>Культура общения</h4>
                    <p>Запрещены любые проявления токсичности, расизма или оскорблений в общем чате или Discord сервере.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">02</span>
                  <div className="rule-text">
                    <h4>Достоверность данных</h4>
                    <p>Указывайте свой реальный ранг. Обман других пользователей ведет к временной блокировке доступа.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">03</span>
                  <div className="rule-text">
                    <h4>Анти-спам</h4>
                    <p>Не создавайте более одной заявки в 10 минут. Уважайте место в ленте других игроков.</p>
                  </div>
                </div>
                <div className="rule-item">
                  <span className="rule-num">04</span>
                  <div className="rule-text">
                    <h4>Безопасность</h4>
                    <p>Никогда не передавайте свои учетные данные третьим лицам. Администрация никогда не просит пароль.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="container footer-inner">
          <p>{UI_STRINGS.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;