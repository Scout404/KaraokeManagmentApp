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

  const [showAddSingerModal, setShowAddSingerModal] = useState(false);
  const [newSingerName, setNewSingerName] = useState('');
  const [addSingerError, setAddSingerError] = useState('');

  const [showYoutubeLinkModal, setShowYoutubeLinkModal] = useState(false);
  const [youtubeLinkTarget, setYoutubeLinkTarget] = useState(null);
  const [youtubeLinkValue, setYoutubeLinkValue] = useState('');
  const [youtubeLinkError, setYoutubeLinkError] = useState('');
  // Add these near your other YouTube link state
  const [youtubeLinkTitle, setYoutubeLinkTitle] = useState('');
  const [youtubeLinkArtist, setYoutubeLinkArtist] = useState('');

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
      const [sessionData, allData, queueData] = await Promise.all([
        sessionService.getSession(id),
        sessionService.getAllSessions(),
        api.get(`/queue?sessionId=${id}`),
      ]);
      setSession(sessionData);
      setAllSessions(allData.filter(s => s.isActive));
      setQueue(queueData.data.queue);
    } catch (err) {
      setError('Session not found');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddSinger = async () => {
    if (!newSingerName.trim()) return;
    try {
      setAddSingerError('');
      await api.post(`/sessions/${id}/singers`, { name: newSingerName });
      setShowAddSingerModal(false);
      setNewSingerName('');
      loadData();
    } catch (err) {
      setAddSingerError(err.response?.data?.message || 'Failed to add singer');
    }
  };

  const handleNextSinger = async () => {
    try {
      await api.post(`/queue/next?sessionId=${id}`);
      loadData();
    } catch (err) {
      setError('Failed to advance queue');
    }
  };

  const handleNextRound = async () => {
    if (!window.confirm(`Start Round ${(session.currentRound ?? 1) + 1}?`)) return;
    try {
      await sessionService.startNextRound(id);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start next round';
      setError(msg);
    }
  };

  const handleRemoveFromQueue = async (queueItemId) => {
    try {
      await api.delete(`/queue/${queueItemId}`);
      loadData();
    } catch (err) {
      setError('Failed to remove from queue');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all completed items?')) return;
    try {
      await api.delete(`/queue/completed/clear?sessionId=${id}`);
      loadData();
    } catch (err) {
      setError('Failed to clear queue');
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

const handleSaveYoutubeLink = async () => {
  if (!youtubeLinkValue.trim()) return;
  try {
    setYoutubeLinkError('');

    // Step 1: Create the song
    const songRes = await api.post('/songs', {
      title: youtubeLinkTitle.trim() || 'Unknown',
      artist: youtubeLinkArtist.trim() || '',
      link: youtubeLinkValue.trim(),
    });
    const songId = songRes.data.song.id;

    // Step 2: Assign song to queue item
    await api.patch(`/queue/${youtubeLinkTarget.id}/song`, { songId });

    setShowYoutubeLinkModal(false);
    setYoutubeLinkValue('');
    setYoutubeLinkTitle('');
    setYoutubeLinkArtist('');
    setYoutubeLinkTarget(null);
    loadData();
  } catch (err) {
    setYoutubeLinkError(err.response?.data?.message || 'Failed to save link');
  }
};

  const handleYoutubePaste = async (url) => {
  setYoutubeLinkValue(url);
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) return;
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!res.ok) return;
    const data = await res.json();

    // Try to split "Artist - Title" format
    const parts = data.title.split(' - ');
    if (parts.length >= 2) {
      setYoutubeLinkArtist(parts[0].trim());
      setYoutubeLinkTitle(parts.slice(1).join(' - ').trim());
    } else {
      setYoutubeLinkTitle(data.title);
    }
  } catch {
    // silently fail — user can fill in manually
  }
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
              {session.singerCount} singers · {formatElapsed(session.startedAt)} · 
              <span style={{ color: '#c813ec', fontWeight: 700 }}>
                {' '}Round {session.currentRound ?? 1}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {upNext.length === 0 && !currentSinger && (
              <button
                className="as-display-btn"
                style={{ borderColor: '#c813ec', color: '#c813ec' }}
                onClick={handleNextRound}
              >
                🔄 Next Round
              </button>
            )}
            <button
              className="as-display-btn"
              onClick={() => setShowAddSingerModal(true)}
            >
              🎤 Add Singer
            </button>
            <button
              className="as-display-btn"
              onClick={() => window.open(`/displayqueue?sessionId=${id}`, '_blank', 'noopener,noreferrer')}
            >
              📺 Display Queue
            </button>
            <button className="as-end-btn" onClick={handleEndSession}>
              ⏹ Close Session
            </button>
          </div>
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
                    <h3 className="as-stage-name">{currentSinger.singerName}</h3>
                    <p className="as-stage-song">
                      {currentSinger.songTitle
                        ? `"${currentSinger.songTitle}"${currentSinger.songArtist ? ` — ${currentSinger.songArtist}` : ''}`
                        : 'No song assigned'}
                    </p>
                  </div>
                ) : (
                  <div className="as-stage-info">
                    <p className="as-stage-empty">No one on stage yet</p>
                  </div>
                )}
                <button className="as-play-btn" onClick={handleNextSinger}>▶</button>
              </div>

              {currentSinger && (
                <div className="as-stage-footer">
                  <div className="as-stage-footer-left">
                    <div className="as-stage-meta-item">
                      <span className="as-meta-label">YouTube</span>
                      {currentSinger.songLink ? (
                        <a
                          href={currentSinger.songLink}
                          target="_blank"
                          rel="noreferrer"
                          className="as-yt-link"
                        >
                          {currentSinger.songLink.slice(0, 40)}...
                        </a>
                      ) : (
                        <span className="as-yt-missing">No link added</span>
                      )}
                    </div>
                  </div>
                  <div className="as-stage-actions">
                    <button
                      className="as-action-btn as-action-btn--secondary"
                      onClick={handleNextSinger}
                    >
                      ⏭ Next Singer
                    </button>
                    {currentSinger.songLink && (
                      <button
                        className="as-action-btn as-action-btn--primary"
                        onClick={() => window.open(currentSinger.songLink, '_blank')}
                      >
                        ▶ Open YouTube
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT — QUEUE */}
          <section className="as-right">
            <div className="as-queue-header">
              <h2 className="as-section-title">📋 Queue</h2>
              <button className="as-clear-btn" onClick={handleClearAll}>
                Clear Completed
              </button>
            </div>
            <div className="as-queue-list">
              {upNext.length === 0 ? (
                <p style={{ color: '#c092c9', fontSize: '14px', padding: '16px 0' }}>
                  Queue is empty
                </p>
              ) : (
                upNext.map((item) => (
                  <div key={item.id} className="as-queue-item">
                    <div className="as-queue-item-top">
                      <div className="as-queue-left">
                        <div className="as-queue-pos">{item.position}</div>
                        <div>
                          <p className="as-queue-singer">{item.singerName}</p>
                          <p className="as-queue-song">
                            {item.songTitle
                              ? `Waiting: "${item.songTitle}"${item.songArtist ? ` — ${item.songArtist}` : ''}`
                              : 'No song assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="as-queue-actions">
                        {/* FIX: show Add YouTube Link button only when no link exists */}
                        {!item.songLink && (
                          <button
                            className="as-add-link-btn"
                            onClick={() => {
                              setYoutubeLinkTarget(item);
                              setYoutubeLinkValue('');
                              setYoutubeLinkTitle('');   // add this
                              setYoutubeLinkArtist('');  // add this
                              setYoutubeLinkError('');
                              setShowYoutubeLinkModal(true);
                            }}
                          >
                            🔗 Add YouTube Link
                          </button>
                        )}
                        <button
                          className="as-delete-btn"
                          onClick={() => handleRemoveFromQueue(item.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    {/* FIX: only show yt-row when link exists, no dead button */}
                    {item.songLink && (
                      <div className="as-yt-row">
                        <span className="as-yt-icon">▶</span>
                        <span className="as-yt-url">{item.songLink.slice(0, 45)}...</span>
                        <a
                          href={item.songLink}
                          target="_blank"
                          rel="noreferrer"
                          className="as-yt-edit"
                        >
                          Open
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
              <button
                className="as-add-singer-btn"
                onClick={() => navigate(`/session/${id}/singers`)}
              >
                <span className="as-add-singer-icon">＋</span>
                Add Singer to Queue
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* QUICK ADD SINGER MODAL */}
      {showAddSingerModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddSingerModal(false)}
        >
          <div
            style={{
              background: '#2f1933',
              border: '1px solid #422348',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #422348',
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                Add Singer to Queue
              </h2>
              <button
                onClick={() => setShowAddSingerModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#c092c9', cursor: 'pointer' }}
              >×</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '13px', color: '#c092c9' }}>Singer Name</label>
              <input
                className="as-search"
                style={{
                  background: '#1f1022', border: '1px solid #422348',
                  borderRadius: '8px', padding: '10px 14px',
                  color: '#f1f0f2', fontSize: '14px', outline: 'none', width: '100%',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g. John Smith"
                value={newSingerName}
                onChange={e => setNewSingerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAddSinger()}
                autoFocus
              />
              {addSingerError && (
                <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{addSingerError}</p>
              )}
              <button
                className="as-action-btn as-action-btn--primary"
                style={{ padding: '12px', justifyContent: 'center' }}
                onClick={handleQuickAddSinger}
              >
                🎤 Add Singer
              </button>
              <button
                className="as-action-btn as-action-btn--secondary"
                style={{ padding: '10px', justifyContent: 'center', fontSize: '13px' }}
                onClick={() => { setShowAddSingerModal(false); navigate(`/session/${id}/singers`); }}
              >
                View All Singers →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YOUTUBE LINK MODAL */}
      {showYoutubeLinkModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowYoutubeLinkModal(false)}
        >
          <div
            style={{
              background: '#2f1933', border: '1px solid #422348',
              borderRadius: '16px', width: '90%', maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #422348',
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                Add YouTube Link — {youtubeLinkTarget?.singerName}
              </h2>
              <button
                onClick={() => setShowYoutubeLinkModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: '#c092c9', cursor: 'pointer' }}
              >×</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

  <label style={{ fontSize: '13px', color: '#c092c9' }}>YouTube URL</label>
  <input
    style={{
      background: '#1f1022', border: '1px solid #422348',
      borderRadius: '8px', padding: '10px 14px',
      color: '#f1f0f2', fontSize: '14px', outline: 'none', width: '100%',
      boxSizing: 'border-box',
    }}
    placeholder="https://youtube.com/watch?v=..."
    value={youtubeLinkValue}
    onChange={e => handleYoutubePaste(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleSaveYoutubeLink()}
    autoFocus
  />

  <label style={{ fontSize: '13px', color: '#c092c9' }}>Song Title</label>
  <input
    style={{
      background: '#1f1022', border: '1px solid #422348',
      borderRadius: '8px', padding: '10px 14px',
      color: '#f1f0f2', fontSize: '14px', outline: 'none', width: '100%',
      boxSizing: 'border-box',
    }}
    placeholder="e.g. Bohemian Rhapsody (auto-filled)"
    value={youtubeLinkTitle}
    onChange={e => setYoutubeLinkTitle(e.target.value)}
  />

  <label style={{ fontSize: '13px', color: '#c092c9' }}>Artist</label>
  <input
    style={{
      background: '#1f1022', border: '1px solid #422348',
      borderRadius: '8px', padding: '10px 14px',
      color: '#f1f0f2', fontSize: '14px', outline: 'none', width: '100%',
      boxSizing: 'border-box',
    }}
    placeholder="e.g. Queen (auto-filled)"
    value={youtubeLinkArtist}
    onChange={e => setYoutubeLinkArtist(e.target.value)}
  />

  {youtubeLinkError && (
    <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{youtubeLinkError}</p>
  )}

  <button
    className="as-action-btn as-action-btn--primary"
    style={{ padding: '12px', justifyContent: 'center' }}
    onClick={handleSaveYoutubeLink}
  >
    🔗 Save Link
  </button>
</div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default ActiveSession;