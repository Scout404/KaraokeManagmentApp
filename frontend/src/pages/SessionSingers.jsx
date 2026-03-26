import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { sessionService } from '../services/sessionService';
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const [newSingerName, setNewSingerName] = useState('');
  const [addError, setAddError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    loadData();
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleReAddSinger = async (singerId) => {
    try {
      await sessionService.reAddSingerToQueue(id, singerId);
      setOpenDropdown(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to re-add singer');
    }
  };

  const handleToggleSkip = async (singerId, currentlySkipping) => {
    try {
      await sessionService.toggleSkipRound(id, singerId);
      loadData();
    } catch (err) {
      setError('Failed to update skip status');
    }
  };

  const handleRemoveSinger = async (singerId, singerName) => {
    if (!window.confirm(`Remove ${singerName} from this session?`)) return;
    try {
      await sessionService.removeSingerFromSession(id, singerId);
      setOpenDropdown(null);
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
            <p className="ss-muted">Use the "＋ Add Singer" button above to get started.</p>
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
                  {/* <span>{getStatusBadge(singer.currentStatus)}</span> */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {getStatusBadge(singer.currentStatus)}
                    {singer.skipNextRound && (
                      <span style={{
                        fontSize: '11px',
                        color: '#f87171',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}>
                        ⏭ Skipping
                      </span>
                    )}
                  </span>
                  <span className="ss-row-pos">
                    {singer.queuePosition ? `#${singer.queuePosition}` : '—'}
                  </span>
                  <span className="ss-row-songs">
                    {singer.songsSung.length} song{singer.songsSung.length !== 1 ? 's' : ''}
                  </span>

                  {/* ACTIONS: Songs button + dropdown for the rest */}
                  <span className="ss-row-actions" onClick={e => e.stopPropagation()}>
                    {/* Songs toggle — stays as a normal button */}
                    <button
                      className="ss-btn ss-btn--expand"
                      onClick={() =>
                        setExpandedSinger(expandedSinger === singer.id ? null : singer.id)
                      }
                    >
                      {expandedSinger === singer.id ? '▲ Hide' : '▼ Songs'}
                    </button>

                    {/* More actions dropdown */}
                    <div
                      className="ss-dropdown-wrapper"
                      ref={openDropdown === singer.id ? dropdownRef : null}
                    >
                      <button
                        className="ss-btn ss-btn--more"
                        onClick={() =>
                          setOpenDropdown(openDropdown === singer.id ? null : singer.id)
                        }
                        aria-label="More actions"
                        title="More actions"
                      >
                        ...
                      </button>

                      {openDropdown === singer.id && (
                        <div className="ss-dropdown-menu">
                          {singer.currentStatus !== 'waiting' && singer.currentStatus !== 'singing' && (
                            <button
                              className="ss-dropdown-item ss-dropdown-item--readd"
                              onClick={() => handleReAddSinger(singer.id)}
                            >
                              ↩ Re-add to Queue
                            </button>
                          )}
                          {singer.currentStatus !== 'singing' && (
                            <button
                              className="ss-dropdown-item ss-dropdown-item--skip"
                              onClick={() => handleToggleSkip(singer.id, singer.skipNextRound)}
                              >
                              {singer.skipNextRound ? '▶ Join Next Round' : '⏭ Skip Next Round'}
                            </button>
                          )}
                          <button
                            className="ss-dropdown-item ss-dropdown-item--remove"
                            onClick={() => handleRemoveSinger(singer.id, singer.name)}
                          >
                            🗑 Remove Singer
                          </button>
                        </div>
                      )}
                    </div>
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