import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import './ActiveSession.css';

function ActiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Placeholder queue data — wire up to backend later
  const queue = [
    { id: 1, position: 1, singer: 'Alex Rivera', song: 'Rolling in the Deep', status: 'singing', youtubeUrl: null },
    { id: 2, position: 2, singer: 'Sarah Jenkins', song: 'Flowers', status: 'waiting', youtubeUrl: 'https://youtube.com/watch?v=G7KNmW9a75Y' },
    { id: 3, position: 3, singer: 'Marcus Chen', song: 'Blinding Lights', status: 'waiting', youtubeUrl: null },
    { id: 4, position: 4, singer: 'Jordan B.', song: 'Bohemian Rhapsody', status: 'waiting', youtubeUrl: null },
  ];

  const currentSinger = queue.find(q => q.status === 'singing');
  const upNext = queue.filter(q => q.status === 'waiting');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSession(id);
      setSession(data);
    } catch (err) {
      setError('Session not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this session?')) return;
    try {
      await sessionService.endSession(id);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to end session');
    }
  };

  const formatElapsed = (startedAt) => {
    const diff = Math.floor((new Date() - new Date(startedAt)) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m elapsed` : `${m}m elapsed`;
  };

  if (loading) return <div className="as-loading">Loading session...</div>;
  if (error) return <div className="as-loading">{error}</div>;
  if (!session) return null;

  return (
    <div className="as-root">
      {/* HEADER */}
      <header className="as-header">
        <div className="as-header-left">
          <span className="as-header-icon">🎤</span>
          <span className="as-brand">Karaoke Manager</span>
          <label className="as-search-wrap">
            <span className="as-search-icon">🔍</span>
            <input className="as-search" placeholder="Search songs or singers..." />
          </label>
        </div>
        <div className="as-header-right">
          <nav className="as-nav">
            <a className="as-nav-link" onClick={() => navigate('/dashboard')}>Dashboard</a>
            <a className="as-nav-link" href="#">Library</a>
          </nav>
          <button className="as-profile-btn">{user?.username}</button>
        </div>
      </header>

      <div className="as-body">
        {/* SIDEBAR */}
        <aside className="as-sidebar">
          <div className="as-sidebar-section">
            <p className="as-sidebar-label">Navigation</p>
            <button className="as-sidebar-item as-sidebar-item--active">
              <span>▶</span> Current Session
            </button>
            <button className="as-sidebar-item" onClick={() => navigate('/dashboard')}>
              <span>🕐</span> All Sessions
            </button>
            <button className="as-sidebar-item">
              <span>👥</span> Manage All Singers
            </button>
          </div>
          <div className="as-sidebar-section">
            <p className="as-sidebar-label">Quick Actions</p>
            <button className="as-sidebar-item">
              <span>🎵</span> Song Library
            </button>
            <button className="as-sidebar-item">
              <span>⚙️</span> Audio Settings
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="as-main">
          {/* STATUS BAR */}
          <div className="as-statusbar">
            <div className="as-statusbar-left">
              <div className="as-status-title">
                <span className="as-live-dot" />
                Session Active: {session.name}
                {session.roomName && ` — ${session.roomName}`}
              </div>
              <p className="as-status-sub">
                {session.singerCount} singers · {formatElapsed(session.startedAt)}
              </p>
            </div>
            <button className="as-end-btn" onClick={handleEndSession}>
              ⏹ Close Session
            </button>
          </div>

          {/* CONTENT */}
          <div className="as-content">
            {/* LEFT — CURRENT SINGER */}
            <section className="as-left">
              <h2 className="as-section-title">🎙 Current Singer</h2>

              <div className="as-stage-card">
                <div className="as-stage-visual">
                  <div className="as-stage-overlay" />
                  {currentSinger ? (
                    <div className="as-stage-info">
                      <span className="as-on-stage-badge">ON STAGE</span>
                      <h3 className="as-stage-name">{currentSinger.singer}</h3>
                      <p className="as-stage-song">"{currentSinger.song}"</p>
                    </div>
                  ) : (
                    <div className="as-stage-info">
                      <p className="as-stage-empty">No one on stage yet</p>
                    </div>
                  )}
                  <button className="as-play-btn">▶</button>
                </div>

                {currentSinger && (
                  <div className="as-stage-footer">
                    <div className="as-stage-footer-left">
                      <div className="as-stage-meta-item">
                        <span className="as-meta-label">YouTube</span>

                      </div>
                    </div>
                    <div className="as-stage-actions">
                      <button className="as-action-btn as-action-btn--secondary">
                        ⏭ Next Singer
                      </button>
                      {currentSinger.youtubeUrl && (
                        <button
                          className="as-action-btn as-action-btn--primary"
                          onClick={() => window.open(currentSinger.youtubeUrl, '_blank')}
                        >
                          ▶ Open YouTube
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* MINI STATS */}
              <div className="as-mini-stats">
                <div className="as-mini-stat">
                  <div className="as-mini-stat-icon as-mini-stat-icon--blue">🔊</div>
                  <div>
                    <p className="as-mini-stat-label">Master Volume</p>
                    <p className="as-mini-stat-value">82%</p>
                  </div>
                </div>
                <div className="as-mini-stat">
                  <div className="as-mini-stat-icon as-mini-stat-icon--pink">🎚</div>
                  <div>
                    <p className="as-mini-stat-label">Vocal Reverb</p>
                    <p className="as-mini-stat-value">Medium</p>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT — QUEUE */}
            <section className="as-right">
              <div className="as-queue-header">
                <h2 className="as-section-title">📋 Queue</h2>
                <button className="as-clear-btn">Clear All</button>
              </div>

              <div className="as-queue-list">
                {upNext.map((item) => (
                  <div key={item.id} className="as-queue-item">
                    <div className="as-queue-item-top">
                      <div className="as-queue-left">
                        <div className="as-queue-pos">{item.position}</div>
                        <div>
                          <p className="as-queue-singer">{item.singer}</p>
                          <p className="as-queue-song">Waiting: "{item.song}"</p>
                        </div>
                      </div>
                      <div className="as-queue-actions">
                        {item.youtubeUrl && (
                          <button className="as-yt-btn">🔗</button>
                        )}
                        <button className="as-delete-btn">🗑</button>
                      </div>
                    </div>

                    {item.youtubeUrl ? (
                      <div className="as-yt-row">
                        <span className="as-yt-icon">▶</span>
                        <span className="as-yt-url">
                          {item.youtubeUrl.slice(0, 45)}...
                        </span>
                        <button className="as-yt-edit">Edit</button>
                      </div>
                    ) : (
                      <button className="as-add-link-btn">
                        🔗 Add YouTube Link
                      </button>
                    )}
                  </div>
                ))}

                <button className="as-add-singer-btn">
                  <span className="as-add-singer-icon">＋</span>
                  Add Singer to Queue
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ActiveSession;