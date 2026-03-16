import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', roomName: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
      loadSessions();
    }
  }, [navigate]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getAllSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSession.name.trim()) return;
    try {
      const created = await sessionService.createSession(newSession.name, newSession.roomName);
      setShowNewSessionModal(false);
      setNewSession({ name: '', roomName: '' });
      navigate(`/session/${created.id}`);
    } catch (err) {
      setError('Failed to create session');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatDuration = (startedAt, endedAt) => {
    const end = endedAt ? new Date(endedAt) : new Date();
    const diff = Math.floor((end - new Date(startedAt)) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}H ${m}M` : `${m}M`;
  };

  if (!user) return null;

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    .slice(0, 6);

  return (
    <div className="ds-root">
      {/* HEADER */}
      <header className="ds-header">
        <div className="ds-header-left">
          <span className="ds-header-icon">🎤</span>
          <span className="ds-brand">KaraokeDash</span>
          <nav className="ds-nav">
            <a className="ds-nav-link active" href="#">Dashboard</a>
            <a className="ds-nav-link" href="#">Sessions</a>
            <a className="ds-nav-link" href="#">Library</a>
            <a className="ds-nav-link" href="#">Settings</a>
          </nav>
        </div>
        <div className="ds-header-right">
          {/* <div className="ds-search-wrap">
            <span className="ds-search-icon">🔍</span>
            <input className="ds-search" placeholder="Search tracks..." />
          </div> */}
          <button onClick={handleLogout} className="ds-logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="ds-main">
        {/* HERO */}
        <div className="ds-hero">
          <div className="ds-hero-icon">🎵</div>
          <h1 className="ds-hero-title">Ready to Start the Show?</h1>
          <p className="ds-hero-sub">
            Create a new session to invite singers, manage the queue, and stream
            high-quality YouTube karaoke tracks in real-time.
          </p>
          <button
            className="ds-start-btn"
            onClick={() => setShowNewSessionModal(true)}
          >
            <span>＋</span> Start New Session
          </button>
        </div>

        {/* RECENT SESSIONS */}
        <div className="ds-recent">
          <div className="ds-recent-header">
            <h2 className="ds-recent-title">🕐 Recent Sessions</h2>
            <a className="ds-view-all" href="#">View All History</a>
          </div>

          {error && <p className="ds-error">{error}</p>}

          {loading ? (
            <p className="ds-muted">Loading sessions...</p>
          ) : recentSessions.length === 0 ? (
            <p className="ds-muted">No sessions yet — start your first one above!</p>
          ) : (
            <div className="ds-cards">
              {recentSessions.map(session => (
                <div
                  key={session.id}
                  className={`ds-card ${session.isActive ? 'ds-card--active' : ''}`}
                  onClick={() =>
                    session.isActive && navigate(`/session/${session.id}`)
                  }
                >
                  <div className="ds-card-top">
                    <div className="ds-card-icon">📅</div>
                    <span className="ds-card-duration">
                      {session.isActive
                        ? '🟢 Live'
                        : formatDuration(session.startedAt, session.endedAt)}
                    </span>
                  </div>
                  <h3 className="ds-card-name">{session.name}</h3>
                  <p className="ds-card-date">
                    {new Date(session.startedAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                    {session.roomName && ` · ${session.roomName}`}
                  </p>
                  <div className="ds-card-meta">
                    <span>👥 {session.singerCount} Singers</span>
                  </div>
                  {session.isActive && (
                    <button
                      className="ds-card-open"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/session/${session.id}`);
                      }}
                    >
                      Open Session →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="ds-footer">
          <p className="ds-footer-quote">
            "Where every shower singer becomes a rockstar."
          </p>
          <div className="ds-footer-links">
            <a href="#">Documentation</a>
            <a href="#">Help Center</a>
            <a href="#">Track Library</a>
          </div>
        </footer>
      </main>

      {/* NEW SESSION MODAL */}
      {showNewSessionModal && (
        <div
          className="ds-overlay"
          onClick={() => setShowNewSessionModal(false)}
        >
          <div className="ds-modal" onClick={e => e.stopPropagation()}>
            <div className="ds-modal-header">
              <h2>New Session</h2>
              <button onClick={() => setShowNewSessionModal(false)}>×</button>
            </div>
            <div className="ds-modal-body">
              <label>Session Name *</label>
              <input
                className="ds-input"
                placeholder="e.g. Friday Night Vibes"
                value={newSession.name}
                onChange={e =>
                  setNewSession({ ...newSession, name: e.target.value })
                }
              />
              <label>Room Name</label>
              <input
                className="ds-input"
                placeholder="e.g. Neon Room"
                value={newSession.roomName}
                onChange={e =>
                  setNewSession({ ...newSession, roomName: e.target.value })
                }
              />
              <button className="ds-start-btn" onClick={handleCreateSession}>
                🎤 Start Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;