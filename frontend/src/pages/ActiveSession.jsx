import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { sessionService } from '../services/sessionService';
import api from '../services/api';
import './ActiveSession.css';

function ActiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentSinger = queue.find(q => q.status === 'singing');
  const upNext = queue.filter(q => q.status === 'waiting');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionData, allData] = await Promise.all([
        sessionService.getSession(id),
        sessionService.getAllSessions(),
      ]);
      setSession(sessionData);
      setAllSessions(allData.filter(s => s.isActive));
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatElapsed = (startedAt) => {
    const diff = Math.floor((new Date() - new Date(startedAt)) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m elapsed` : `${m}m elapsed`;
  };

  if (loading) return <div className="as-loading">Loading session...</div>;
  if (error) return <div className="as-loading">{error}</div>;
  if (!user || !session) return null;

  return (
    <AppLayout
      user={user}
      onLogout={handleLogout}
      activeSessions={allSessions}
      currentSessionId={id}
    >
      <div className="as-main">
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
             <button
                className="as-display-btn"
                onClick={() => window.open('/displayqueue', '_blank', 'noopener,noreferrer')}
                >
                📺 Display Queue
            </button>
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
                      {/* {currentSinger.youtubeUrl ? (
                        
                          href={currentSinger.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="as-yt-link"
                        >
                          {currentSinger.youtubeUrl.slice(0, 40)}...
                        </a>
                      ) : (
                        <span className="as-yt-missing">No link added</span>
                      )} */}
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

            {/* <div className="as-mini-stats">
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
            </div> */}
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
                      {item.youtubeUrl && <button className="as-yt-btn">🔗</button>}
                      <button className="as-delete-btn">🗑</button>
                    </div>
                  </div>
                  {item.youtubeUrl ? (
                    <div className="as-yt-row">
                      <span className="as-yt-icon">▶</span>
                      <span className="as-yt-url">{item.youtubeUrl.slice(0, 45)}...</span>
                      <button className="as-yt-edit">Edit</button>
                    </div>
                  ) : (
                    <button className="as-add-link-btn">🔗 Add YouTube Link</button>
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
      </div>
    </AppLayout>
  );
}

export default ActiveSession;