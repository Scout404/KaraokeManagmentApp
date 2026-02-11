import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Displayqueue.css';

function Displayqueue() {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return { time: `${displayHours}:${minutes}`, period };
  };

  // Sample data - replace with your actual data
  const currentSinger = {
    name: 'Sarah Jenkins',
    song: 'Bohemian Rhapsody',
    artist: 'QUEEN',
    avatar: 'https://i.pravatar.cc/150?img=47',
    progress: 65
  };

  const onDeck = {
    position: '02',
    name: 'Michael Rodriguez',
    songs: 'Creep • Radiohead'
  };

  const upcomingQueue = [
    { pos: '03', performer: 'Elena Vass', song: 'Flowers', artist: 'MILEY CYRUS' },
    { pos: '04', performer: 'David K.', song: 'My Way', artist: 'FRANK SINATRA' },
    { pos: '05', performer: 'Jessica Lane', song: 'Rolling in the Deep', artist: 'ADELE' },
    { pos: '06', performer: 'Chris Pratt', song: 'Wonderwall', artist: 'OASIS' },
    { pos: '07', performer: 'Sam Taylor', song: 'Stay', artist: 'JUSTIN BIEBER' },
    { pos: '08', performer: 'Jordan B.', song: 'Superstition', artist: 'STEVIE WONDER' },
  ];

  if (!user) return null;

  const { time, period } = formatTime(currentTime);

  return (
    <div className="Displayqueue">
      {/* HEADER */}
      <header className="Displayqueue-header">
        <div className="Displayqueue-header-left">
          <div className="Displayqueue-logo-icon">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="12" y="10" width="4" height="20" fill="white" rx="2"/>
              <rect x="24" y="10" width="4" height="20" fill="white" rx="2"/>
            </svg>
          </div>
          <div className="Displayqueue-header-text">
            <h1 className="Displayqueue-app-title">
              STUDIO 54 <span className="karaoke-text">KARAOKE</span>
            </h1>
            <p className="Displayqueue-app-subtitle">LIVE PERFORMANCE LOUNGE</p>
          </div>
        </div>
        <div className="Displayqueue-header-right">
          <div className="Displayqueue-join-info">
            <p className="Displayqueue-join-label">TO JOIN THE QUEUE</p>
            <p className="Displayqueue-join-url">studiokaraoke.com/join</p>
          </div>
          <div className="Displayqueue-qr-code">
            {/* QR code placeholder - replace with actual QR code */}
            <svg viewBox="0 0 50 50" fill="black">
              <rect x="0" y="0" width="20" height="20"/>
              <rect x="30" y="0" width="20" height="20"/>
              <rect x="0" y="30" width="20" height="20"/>
              <rect x="25" y="25" width="5" height="5"/>
            </svg>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="Displayqueue-main">
        <div className="Displayqueue-main-content">
          {/* LEFT COLUMN */}
          <section className="Displayqueue-left-panel">
            {/* NOW SINGING */}
            <div className="Displayqueue-now-singing">
              <h2 className="Displayqueue-section-title">NOW SINGING</h2>
              <div className="Displayqueue-current-singer">
                <div className="Displayqueue-singer-avatar">
                  <img src={currentSinger.avatar} alt={currentSinger.name} />
                </div>
                <div className="Displayqueue-singer-details">
                  <h3 className="Displayqueue-singer-name">{currentSinger.name}</h3>
                  <p className="Displayqueue-song-title">{currentSinger.song}</p>
                  <p className="Displayqueue-song-artist">{currentSinger.artist}</p>
                </div>
                <div className="Displayqueue-progress-bar">
                  <div 
                    className="Displayqueue-progress-fill" 
                    style={{ width: `${currentSinger.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* ON DECK */}
            <div className="Displayqueue-on-deck">
              <h2 className="Displayqueue-section-title-secondary">ON DECK</h2>
              <div className="Displayqueue-on-deck-card">
                <div className="Displayqueue-deck-position">{onDeck.position}</div>
                <div className="Displayqueue-deck-info">
                  <h3 className="Displayqueue-deck-name">{onDeck.name}</h3>
                  <p className="Displayqueue-deck-songs">{onDeck.songs}</p>
                </div>
                <div className="Displayqueue-deck-status">WAITING</div>
              </div>
            </div>

            {/* ALERT MESSAGE */}
            <div className="Displayqueue-alert">
              <div className="Displayqueue-alert-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 2L2 7V17L12 22L22 17V7L12 2Z" 
                    stroke="#e935e5" 
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="12" cy="12" r="3" fill="#e935e5"/>
                </svg>
              </div>
              <div className="Displayqueue-alert-text">
                <p>Please be ready 5 minutes before your turn.</p>
                <p>Check your mic battery!</p>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <section className="Displayqueue-right-panel">
            <div className="Displayqueue-upcoming-header">
              <h2 className="Displayqueue-section-title-main">UPCOMING STARS</h2>
              <div className="Displayqueue-queue-count">{upcomingQueue.length} IN QUEUE</div>
            </div>

            <div className="Displayqueue-queue-table">
              <div className="Displayqueue-queue-header">
                <div>POS</div>
                <div>PERFORMER</div>
                <div>SONG CHOICE</div>
                <div>STATUS</div>
              </div>

              <div className="Displayqueue-queue-items">
                {upcomingQueue.map((item) => (
                  <div key={item.pos} className="Displayqueue-queue-item">
                    <div className="Displayqueue-item-position">{item.pos}</div>
                    <div className="Displayqueue-item-performer">{item.performer}</div>
                    <div className="Displayqueue-item-song">
                      <span className="Displayqueue-item-song-name">{item.song}</span>
                      <span className="Displayqueue-item-song-artist">{item.artist}</span>
                    </div>
                    <div className="Displayqueue-item-status">
                      <span className="Displayqueue-status-badge">IN QUEUE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="Displayqueue-footer">
        <div className="Displayqueue-footer-left">
          <div className="Displayqueue-footer-item">
            <svg className="Displayqueue-footer-icon" viewBox="0 0 20 20" fill="white">
              <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z"/>
            </svg>
            <span>NOW TRENDING: 90S POP ROCK</span>
          </div>
          <div className="Displayqueue-footer-item">
            <svg className="Displayqueue-footer-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/>
              <path d="M10 6V10L13 13" stroke="white" strokeWidth="2"/>
            </svg>
            <span>LAST SUNG: "MR. BRIGHTSIDE" BY THE KILLERS</span>
          </div>
          <div className="Displayqueue-footer-item">
            <svg className="Displayqueue-footer-icon" viewBox="0 0 20 20" fill="white">
              <path d="M10 3L4 6L10 9L16 6L10 3Z"/>
              <path d="M4 10L10 13L16 10"/>
              <path d="M4 14L10 17L16 14"/>
            </svg>
            <span>CROWD FAVORITE: "I WILL ALWAYS LOVE YOU"</span>
          </div>
        </div>
        <div className="Displayqueue-footer-right">
          <span className="Displayqueue-footer-time">{time}</span>
          <span className="Displayqueue-footer-period">{period}</span>
        </div>
      </footer>
    </div>
  );
}

export default Displayqueue;