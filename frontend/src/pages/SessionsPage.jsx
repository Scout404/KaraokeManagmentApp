import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { sessionService } from '../services/sessionService';
import './SessionsPage.css';

function SessionsPage() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'past'
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    loadSessions();
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

  const handleEndSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('End this session?')) return;
    try {
      await sessionService.endSession(id);
      loadSessions();
    } catch (err) {
      setError('Failed to end session');
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this session?')) return;
    try {
      await sessionService.deleteSession(id);
      loadSessions();
    } catch (err) {
      setError('Failed to delete session');
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
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!user) return null;

  const activeSessions = sessions.filter(s => s.isActive);
  const pastSessions = sessions.filter(s => !s.isActive);
  const filtered =
    filter === 'active' ? activeSessions :
    filter === 'past'   ? pastSessions :
    sessions;

  return (
    <AppLayout
      user={user}
      onLogout={handleLogout}
      activeSessions={activeSessions}
      currentSessionId={null}
    >
      <div className="sp-page">
        {/* PAGE HEADER */}
        <div className="sp-topbar">
          <div>
            <h1 className="sp-title">All Sessions</h1>
            <p className="sp-sub">
              {activeSessions.length} active · {pastSessions.length} past
            </p>
          </div>
          <button
            className="sp-new-btn"
            onClick={() => navigate('/dashboard')}
          >
            ＋ New Session
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="sp-tabs">
          {['all', 'active', 'past'].map(tab => (
            <button
              key={tab}
              className={`sp-tab ${filter === tab ? 'sp-tab--active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'all'    && `All (${sessions.length})`}
              {tab === 'active' && `🟢 Active (${activeSessions.length})`}
              {tab === 'past'   && `🕐 Past (${pastSessions.length})`}
            </button>
          ))}
        </div>

        {error && <p className="sp-error">{error}</p>}

        {/* SESSION TABLE */}
        {loading ? (
          <p className="sp-muted">Loading sessions...</p>
        ) : filtered.length === 0 ? (
          <p className="sp-muted">No sessions found.</p>
        ) : (
          <div className="sp-table">
            {/* TABLE HEADER */}
            <div className="sp-table-head">
              <span>Session</span>
              <span>Room</span>
              <span>Started</span>
              <span>Duration</span>
              <span>Singers</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {/* TABLE ROWS */}
            {filtered.map(session => (
              <div
                key={session.id}
                className={`sp-row ${session.isActive ? 'sp-row--active' : ''}`}
                onClick={() => session.isActive && navigate(`/session/${session.id}`)}
              >
                <span className="sp-row-name">{session.name}</span>
                <span className="sp-row-room">{session.roomName || '—'}</span>
                <span className="sp-row-date">
                  {new Date(session.startedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <span className="sp-row-duration">
                  {formatDuration(session.startedAt, session.endedAt)}
                </span>
                <span className="sp-row-singers">{session.singerCount}</span>
                <span>
                  {session.isActive ? (
                    <span className="sp-badge sp-badge--live">● Live</span>
                  ) : (
                    <span className="sp-badge sp-badge--ended">Ended</span>
                  )}
                </span>
                <span className="sp-row-actions" onClick={e => e.stopPropagation()}>
                  {session.isActive ? (
                    <>
                      <button
                        className="sp-btn sp-btn--open"
                        onClick={() => navigate(`/session/${session.id}`)}
                      >
                        Open
                      </button>
                      <button
                        className="sp-btn sp-btn--end"
                        onClick={e => handleEndSession(e, session.id)}
                      >
                        End
                      </button>
                    </>
                  ) : (
                    user.role === 'admin' && (
                      <button
                        className="sp-btn sp-btn--delete"
                        onClick={e => handleDeleteSession(e, session.id)}
                      >
                        Delete
                      </button>
                    )
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default SessionsPage;