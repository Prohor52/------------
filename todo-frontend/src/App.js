import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * КОНСТАНТЫ ПРИЛОЖЕНИЯ
 * Здесь хранятся все данные о рангах, играх и визуальных темах.
 * Большой объект данных помогает поддерживать объем кода и гибкость настроек.
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
    { name: "Herald", color: "#5c4c3c" },
    { name: "Guardian", color: "#5c4c3c" },
    { name: "Crusader", color: "#4c6c7c" },
    { name: "Archon", color: "#4c6c7c" },
    { name: "Legend", color: "#8cacc1" },
    { name: "Ancient", color: "#8cacc1" },
    { name: "Divine", color: "#f1c232" },
    { name: "Immortal", color: "#f1c232" }
  ],
  "Valorant": [
    { name: "Iron", color: "#cfb53b" },
    { name: "Bronze", color: "#cfb53b" },
    { name: "Silver", color: "#cfb53b" },
    { name: "Gold", color: "#b382d6" },
    { name: "Platinum", color: "#b382d6" },
    { name: "Diamond", color: "#bb3c44" },
    { name: "Ascendant", color: "#bb3c44" },
    { name: "Immortal", color: "#bb3c44" },
    { name: "Radiant", color: "#ffebb0" }
  ]
};

const BACKGROUND_THEMES = {
  "CS2": "radial-gradient(circle at 50% -10%, #16203d 0%, #030308 50%)",
  "Dota 2": "radial-gradient(circle at 50% -10%, #2a163d 0%, #030308 50%)",
  "Valorant": "radial-gradient(circle at 50% -10%, #3d1616 0%, #030308 50%)"
};

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

  // Ссылки для DOM-манипуляций
  const chatBottomRef = useRef(null);

  // Конфигурация API
  const DISCORD_CLIENT_ID = '1493708400847093891';
  const REDIRECT_URL = 'https://z1ylfalp0m.onrender.com';
  const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1493683255042506752/tftDYrEwUHbaQMqEq8gVkgcmj_kLAwrQNJA3l2siO050tNhliRN1FcCfC_aktjtNtKEb";

  // --- ЭФФЕКТЫ (EFFECTS) ---

  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Основная логика авторизации
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');

    if (authCode) {
      console.log("Был получен код авторизации. Начинаем обмен...");
      fetch(`/api/auth/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode })
      })
      .then(response => {
        if (!response.ok) throw new Error("Сервер вернул ошибку при обмене кода");
        return response.json();
      })
      .then(userData => {
        if (userData && userData.name) {
          console.log("Авторизация прошла успешно для:", userData.name);
          setCurrentUser(userData);
          localStorage.setItem('tf_user_session', JSON.stringify(userData));
          // Очистка URL от кода для безопасности
          window.history.replaceState({}, document.title, "/");
        }
      })
      .catch(error => {
        console.error("Ошибка в процессе OAuth2:", error);
        alert("Не удалось войти. Убедитесь, что бэкенд запущен!");
      });
    } else {
      const storedUser = localStorage.getItem('tf_user_session');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Ошибка парсинга сессии:", e);
          localStorage.removeItem('tf_user_session');
        }
      }
    }
  }, []);

  // Скролл чата
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // --- ФУНКЦИИ ОБРАБОТКИ (HANDLERS) ---

  const handleLoginRedirect = () => {
    console.log("Инициирован переход на Discord Login...");
    const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=identify`;
    window.location.href = url;
  };

  const handleLogout = () => {
    if (window.confirm("Выйти из системы?")) {
      setCurrentUser(null);
      localStorage.removeItem('tf_user_session');
      window.location.reload();
    }
  };

  const sendMessageToChat = async (textValue) => {
    if (!currentUser) return handleLoginRedirect();
    if (!textValue.trim()) return;

    const msgObject = {
      id: Date.now(),
      author: currentUser.name,
      content: textValue,
      avatar: currentUser.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, msgObject]);

    try {
      await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.name,
          avatar_url: currentUser.avatar,
          content: `**[WEB-CHAT]**: ${textValue}`
        })
      });
    } catch (err) {
      console.error("Ошибка отправки в вебхук:", err);
    }
  };

  const createLobbyPost = async () => {
    if (!currentUser) return handleLoginRedirect();
    if (!gameTime || !userComment) {
      alert("Заполните все поля заявки!");
      return;
    }

    const rank = RANKS_DATA[selectedGame][selectedRankIdx];
    
    const discordPayload = {
      embeds: [{
        title: "🎮 Ищу напарников для игры",
        description: userComment,
        color: parseInt(rank.color.replace('#', ''), 16),
        thumbnail: { url: currentUser.avatar },
        fields: [
          { name: "Дисциплина", value: selectedGame, inline: true },
          { name: "Ранг игрока", value: rank.name, inline: true },
          { name: "Когда играем", value: gameTime, inline: true }
        ],
        footer: { text: `Заявка от ${currentUser.name} | TeamFinder` }
      }]
    };

    try {
      const res = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });
      
      if (res.ok) {
        alert("Заявка успешно создана и отправлена в Discord!");
        setGameTime("");
        setUserComment("");
        setActiveTab('lobby');
      }
    } catch (e) {
      console.error("Ошибка создания поста:", e);
      alert("Произошла техническая ошибка.");
    }
  };

  // --- РЕНДЕР (UI) ---
  return (
    <div className={`App-Container ${isMobile ? 'mobile-mode' : ''}`} 
         style={{ background: activeTab === 'create' ? (BACKGROUND_THEMES[selectedGame] || "#030308") : "#030308" }}>
      
      {/* Шапка сайта */}
      <header className="site-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => window.location.href = '/'}>
            <h1 className="main-logo">TEAM<span className="accent">FINDER</span></h1>
          </div>
          
          <nav className="main-navigation">
            <button className={activeTab === 'lobby' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('lobby')}>Лобби</button>
            <button className={activeTab === 'create' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('create')}>Найти тимейта</button>
            <button className={activeTab === 'rules' ? 'nav-item' : 'nav-item'} onClick={() => setActiveTab('rules')}>Правила</button>
          </nav>

          <div className="auth-section">
            {currentUser ? (
              <div className="user-badge" onClick={handleLogout}>
                <img src={currentUser.avatar} alt="User Avatar" className="user-avatar-small" />
                <span className="user-name-label">{currentUser.name}</span>
              </div>
            ) : (
              <button className="discord-login-button" onClick={handleLoginRedirect}>Войти через Discord</button>
            )}
          </div>
        </div>
      </header>

      {/* Основной блок */}
      <main className="main-layout">
        
        {/* Секция: ЛОББИ (ЧАТ) */}
        {activeTab === 'lobby' && (
          <section className="card chat-card animate-fade-in">
            <div className="card-info-bar">Глобальное лобби • {messages.length} сообщений</div>
            <div className="chat-container">
              {messages.length === 0 ? (
                <div className="chat-placeholder">
                  <p>В чате пока тишина... Будьте первым!</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map(m => (
                    <div key={m.id} className="message-item">
                      <img src={m.avatar} className="message-avatar" alt="" />
                      <div className="message-content">
                        <div className="message-header">
                          <span className="author-name">{m.author}</span>
                          <span className="message-time">{m.timestamp}</span>
                        </div>
                        <p className="message-text">{m.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>
            <div className="chat-input-area">
              {!currentUser ? (
                <div className="login-overlay">
                  <button onClick={handleLoginRedirect}>Авторизуйтесь, чтобы писать</button>
                </div>
              ) : (
                <input 
                  type="text" 
                  className="chat-field" 
                  placeholder="Введите ваше сообщение и нажмите Enter..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendMessageToChat(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              )}
            </div>
          </section>
        )}

        {/* Секция: СОЗДАНИЕ ЗАЯВКИ */}
        {activeTab === 'create' && (
          <section className="card form-card animate-fade-in">
            <h2 className="section-title">Создание новой заявки</h2>
            
            <div className="form-grid">
              <div className="form-item full-width">
                <label>Выберите игру</label>
                <select 
                  className="custom-select" 
                  value={selectedGame} 
                  onChange={(e) => { setSelectedGame(e.target.value); setSelectedRankIdx(0); }}
                >
                  {Object.keys(RANKS_DATA).map(gameKey => (
                    <option key={gameKey} value={gameKey}>{gameKey}</option>
                  ))}
                </select>
              </div>

              <div className="form-item half-width">
                <label>Ваш ранг</label>
                <select 
                  className="custom-select" 
                  style={{ color: RANKS_DATA[selectedGame][selectedRankIdx].color }}
                  value={selectedRankIdx} 
                  onChange={(e) => setSelectedRankIdx(parseInt(e.target.value))}
                >
                  {RANKS_DATA[selectedGame].map((r, i) => (
                    <option key={i} value={i} style={{ color: r.color }}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-item half-width">
                <label>Время начала</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  placeholder="Напр: 20:00 МСК" 
                  value={gameTime} 
                  onChange={e => setGameTime(e.target.value)}
                />
              </div>

              <div className="form-item full-width">
                <label>Комментарий к поиску</label>
                <textarea 
                  className="custom-textarea" 
                  placeholder="Напишите, кого вы ищете (возраст, прайм-тайм, цели)..."
                  value={userComment}
                  onChange={e => setUserComment(e.target.value)}
                />
              </div>
            </div>

            <button className="submit-button" onClick={createLobbyPost}>
              ОПУБЛИКОВАТЬ В DISCORD
            </button>
          </section>
        )}

        {/* Секция: ПРАВИЛА */}
        {activeTab === 'rules' && (
          <section className="card rules-card animate-fade-in">
            <h2 className="section-title">Правила сообщества</h2>
            <div className="rules-list">
              <div className="rule-block">
                <h4>1. Адекватность</h4>
                <p>Мы за здоровое общение. Оскорбления, мат и токсичность в общем чате запрещены.</p>
              </div>
              <div className="rule-block">
                <h4>2. Честность</h4>
                <p>Указывайте свой реальный ранг. За систематический обман игроков — бан в системе.</p>
              </div>
              <div className="rule-block">
                <h4>3. Спам</h4>
                <p>Не создавайте более одной заявки в 10 минут. Дайте другим игрокам тоже найти напарников.</p>
              </div>
              <div className="rule-block">
                <h4>4. Безопасность</h4>
                <p>Запрещена реклама сторонних ресурсов, софта и продажа аккаунтов.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="simple-footer">
        <p>© 2026 TeamFinder Project. Все данные защищены через Discord OAuth2.</p>
      </footer>
    </div>
  );
}

export default App;