import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Displayqueue.css';

function Displayqueue() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSinger, setCurrentSinger] = useState(null);
  const [onDeck, setOnDeck] = useState(null);
  const [upcomingQueue, setUpcomingQueue] = useState([]);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get sessionId from URL query param
  const sessionId = new URLSearchParams(window.location.search).get('sessionId');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    if (!sessionId) { navigate('/dashboard'); return; }
    loadQueueData();
  }, [sessionId]);

  // Refresh queue every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadQueueData, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadQueueData = async () => {
    try {
      const [queueRes, sessionRes] = await Promise.all([
        api.get(`/queue?sessionId=${sessionId}`),
        api.get(`/sessions/${sessionId}`),
      ]);

      const queue = queueRes.data.queue;
      const session = sessionRes.data;
      setSessionName(session.name);

      // Current singer = status "singing"
      const singing = queue.find(q => q.status === 'singing');
      setCurrentSinger(singing || null);

      // Waiting queue sorted by position
      const waiting = queue
        .filter(q => q.status === 'waiting')
        .sort((a, b) => a.position - b.position);

      // On deck = first waiting
      setOnDeck(waiting[0] || null);

      // Upcoming = rest of waiting
      setUpcomingQueue(waiting.slice(1));
    } catch (err) {
      console.error('Failed to load queue', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return { time: `${displayHours}:${minutes}`, period };
  };

  const { time, period } = formatTime(currentTime);

  if (loading) return (
    <div className="Displayqueue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff', fontSize: '24px' }}>Loading queue...</p>
    </div>
  );

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
              {sessionName || 'KARAOKE'} <span className="karaoke-text">LIVE</span>
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
            {/* QR code placeholder */}
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
              {currentSinger ? (
                <div className="Displayqueue-current-singer">
                  <div className="Displayqueue-singer-avatar">
                    <span style={{ fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      🎤
                    </span>
                  </div>
                  <div className="Displayqueue-singer-details">
                    <h3 className="Displayqueue-singer-name">{currentSinger.singerName}</h3>
                    <p className="Displayqueue-song-title">
                      {currentSinger.songTitle || 'Song TBA'}
                    </p>
                    <p className="Displayqueue-song-artist">
                      {currentSinger.songArtist || ''}
                    </p>
                  </div>
                  <div className="Displayqueue-progress-bar">
                    <div className="Displayqueue-progress-fill" style={{ width: '50%' }} />
                  </div>
                </div>
              ) : (
                <div className="Displayqueue-current-singer">
                  <div className="Displayqueue-singer-details">
                    <h3 className="Displayqueue-singer-name">No one on stage</h3>
                    <p className="Displayqueue-song-title">Waiting to start...</p>
                  </div>
                </div>
              )}
            </div>

            {/* ON DECK */}
            <div className="Displayqueue-on-deck">
              <h2 className="Displayqueue-section-title-secondary">ON DECK</h2>
              {onDeck ? (
                <div className="Displayqueue-on-deck-card">
                  <div className="Displayqueue-deck-position">
                    {String(onDeck.position).padStart(2, '0')}
                  </div>
                  <div className="Displayqueue-deck-info">
                    <h3 className="Displayqueue-deck-name">{onDeck.singerName}</h3>
                    <p className="Displayqueue-deck-songs">
                      {onDeck.songTitle
                        ? `${onDeck.songTitle}${onDeck.songArtist ? ` • ${onDeck.songArtist}` : ''}`
                        : 'Song TBA'}
                    </p>
                  </div>
                  <div className="Displayqueue-deck-status">WAITING</div>
                </div>
              ) : (
                <div className="Displayqueue-on-deck-card">
                  <div className="Displayqueue-deck-info">
                    <h3 className="Displayqueue-deck-name">Queue is empty</h3>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <section className="Displayqueue-right-panel">
            <div className="Displayqueue-upcoming-header">
              <h2 className="Displayqueue-section-title-main">UPCOMING STARS</h2>
              <div className="Displayqueue-queue-count">
                {upcomingQueue.length} IN QUEUE
              </div>
            </div>

            <div className="Displayqueue-queue-table">
              <div className="Displayqueue-queue-header">
                <div>POS</div>
                <div>PERFORMER</div>
                <div>SONG CHOICE</div>
                <div>STATUS</div>
              </div>

              <div className="Displayqueue-queue-items">
                {upcomingQueue.length === 0 ? (
                  <div className="Displayqueue-queue-item">
                    <div className="Displayqueue-item-performer" style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>
                      No upcoming singers
                    </div>
                  </div>
                ) : (
                  upcomingQueue.map((item) => (
                    <div key={item.id} className="Displayqueue-queue-item">
                      <div className="Displayqueue-item-position">
                        {String(item.position).padStart(2, '0')}
                      </div>
                      <div className="Displayqueue-item-performer">{item.singerName}</div>
                      <div className="Displayqueue-item-song">
                        <span className="Displayqueue-item-song-name">
                          {item.songTitle || 'TBA'}
                        </span>
                        {item.songArtist && (
                          <span className="Displayqueue-item-song-artist">
                            {item.songArtist.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="Displayqueue-item-status">
                        <span className="Displayqueue-status-badge">IN QUEUE</span>
                      </div>
                    </div>
                  ))
                )}
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
            <span>SESSION: {sessionName?.toUpperCase()}</span>
          </div>
          <div className="Displayqueue-footer-item">
            <svg className="Displayqueue-footer-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/>
              <path d="M10 6V10L13 13" stroke="white" strokeWidth="2"/>
            </svg>
            <span>AUTO-REFRESHES EVERY 10 SECONDS</span>
          </div>
          <div className="Displayqueue-footer-item">
            <svg className="Displayqueue-footer-icon" viewBox="0 0 20 20" fill="white">
              <path d="M10 3L4 6L10 9L16 6L10 3Z"/>
              <path d="M4 10L10 13L16 10"/>
              <path d="M4 14L10 17L16 14"/>
            </svg>
            <span>{upcomingQueue.length + (onDeck ? 1 : 0)} SINGERS WAITING</span>
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