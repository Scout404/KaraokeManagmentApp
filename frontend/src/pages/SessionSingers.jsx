import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { sessionService } from '../services/sessionService';
import { singerService } from '../services/singerService';
import api from '../services/api';
import './SessionSingers.css';

function SessionSingers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [singers, setSingers] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSinger, setExpandedSinger] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSingerName, setNewSingerName] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionData, singersData, allSessionsData] = await Promise.all([
        sessionService.getSession(id),
        sessionService.getSingersBySession(id),
        sessionService.getAllSessions(),
      ]);
      setSession(sessionData);
      setSingers(singersData);
      setAllSessions(allSessionsData.filter(s => s.isActive));
    } catch (err) {
      setError('Failed to load session singers');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSinger = async (singerId, singerName) => {
    if (!window.confirm(`Remove ${singerName} from this session?`)) return;
    try {
      await sessionService.removeSingerFromSession(id, singerId);
      loadData();
    } catch (err) {
      setError('Failed to remove singer');
    }
  };

    const handleAddSinger = async () => {
    if (!newSingerName.trim()) return;
    try {
        setAddError('');
        await api.post(`/sessions/${id}/singers`, { name: newSingerName });
        setShowAddModal(false);
        setNewSingerName('');
        loadData();
    } catch (err) {
        setAddError(err.response?.data?.message || 'Failed to add singer');
    }
    };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    if (status === 'singing') return <span className="ss-badge ss-badge--singing">🎤 Singing</span>;
    if (status === 'waiting') return <span className="ss-badge ss-badge--waiting">⏳ Waiting</span>;
    return <span className="ss-badge ss-badge--done">✅ Done</span>;
  };

  if (!user) return null;

  return (
    <AppLayout
      user={user}
      onLogout={handleLogout}
      activeSessions={allSessions}
      currentSessionId={id}
    >
      <div className="ss-page">
        {/* TOP BAR */}
        <div className="ss-topbar">
          <div className="ss-topbar-left">
            <button className="ss-back-btn" onClick={() => navigate(`/session/${id}`)}>
              ← Back to Session
            </button>
            <div>
              <h1 className="ss-title">
                {session ? `${session.name} — Singers` : 'Singers'}
              </h1>
              <p className="ss-sub">{singers.length} singers in this session</p>
            </div>
          </div>
          <button className="ss-add-btn" onClick={() => setShowAddModal(true)}>
            ＋ Add Singer
          </button>
        </div>

        {error && <p className="ss-error">{error}</p>}

        {loading ? (
          <p className="ss-muted">Loading singers...</p>
        ) : singers.length === 0 ? (
          <div className="ss-empty">
            <p>🎤 No singers in this session yet.</p>
            <button className="ss-add-btn" onClick={() => setShowAddModal(true)}>
              Add First Singer
            </button>
          </div>
        ) : (
          <div className="ss-table">
            {/* TABLE HEAD */}
            <div className="ss-table-head">
              <span>Singer</span>
              <span>Status</span>
              <span>Queue Position</span>
              <span>Songs Sung</span>
              <span>Actions</span>
            </div>

            {/* TABLE ROWS */}
            {singers.map(singer => (
              <div key={singer.id}>
                <div
                  className="ss-row"
                  onClick={() =>
                    setExpandedSinger(expandedSinger === singer.id ? null : singer.id)
                  }
                >
                  <span className="ss-row-name">
                    <span className="ss-avatar">
                      {singer.name.charAt(0).toUpperCase()}
                    </span>
                    {singer.name}
                  </span>
                  <span>{getStatusBadge(singer.currentStatus)}</span>
                  <span className="ss-row-pos">
                    {singer.queuePosition ? `#${singer.queuePosition}` : '—'}
                  </span>
                  <span className="ss-row-songs">
                    {singer.songsSung.length} song{singer.songsSung.length !== 1 ? 's' : ''}
                  </span>
                  <span className="ss-row-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="ss-btn ss-btn--expand"
                      onClick={() =>
                        setExpandedSinger(expandedSinger === singer.id ? null : singer.id)
                      }
                    >
                      {expandedSinger === singer.id ? '▲ Hide' : '▼ Songs'}
                    </button>
                    <button
                      className="ss-btn ss-btn--remove"
                      onClick={() => handleRemoveSinger(singer.id, singer.name)}
                    >
                      Remove
                    </button>
                  </span>
                </div>

                {/* EXPANDED SONGS ROW */}
                {expandedSinger === singer.id && (
                  <div className="ss-expanded">
                    <p className="ss-expanded-title">Songs Sung</p>
                    {singer.songsSung.length === 0 ? (
                      <p className="ss-muted">No songs sung yet.</p>
                    ) : (
                      <div className="ss-songs-list">
                        {singer.songsSung.map((song, i) => (
                          <div key={i} className="ss-song-item">
                            <span className="ss-song-num">#{song.position}</span>
                            <span className="ss-song-title">{song.songTitle}</span>
                            {song.songArtist && (
                              <span className="ss-song-artist">— {song.songArtist}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD SINGER MODAL */}
      {showAddModal && (
        <div className="ss-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ss-modal" onClick={e => e.stopPropagation()}>
            <div className="ss-modal-header">
              <h2>Add Singer to Session</h2>
              <button onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="ss-modal-body">
              <label>Singer Name</label>
              <input
                className="ss-input"
                placeholder="e.g. John Smith"
                value={newSingerName}
                onChange={e => setNewSingerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSinger()}
                autoFocus
              />
              {addError && <p className="ss-error">{addError}</p>}
              <button className="ss-add-btn" onClick={handleAddSinger}>
                🎤 Add Singer
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default SessionSingers;