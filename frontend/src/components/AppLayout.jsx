import { useNavigate } from 'react-router-dom';
import './AppLayout.css';

function AppLayout({ user, onLogout, activeSessions = [], currentSessionId = null, children }) {
  const navigate = useNavigate();

  return (
    <div className="app-root">
      {/* HEADER */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-brand">Karaoke Manager</span>
          {/* <label className="app-search-wrap">
            <input className="app-search" placeholder="Search sessions..." />
          </label> */}
        </div>
        <div className="app-header-right">
          <nav className="app-nav">
            <a className="app-nav-link" onClick={() => navigate('/dashboard')}>Home</a>
            <a className="app-nav-link" onClick={() => navigate('/sessions')}>Sessions</a>
            {/* <a className="app-nav-link" href="#">Library</a> */}
          </nav>
          <button className="app-profile-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* SIDEBAR */}
        <aside className="app-sidebar">
          <div className="app-sidebar-section">
            <p className="app-sidebar-label">Navigation</p>
            <button
              className={`app-sidebar-item ${!currentSessionId ? 'app-sidebar-item--active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <span>🏠</span> Home
            </button>
            <button
              className="app-sidebar-item"
              onClick={() => navigate('/sessions')}
            >
              <span>🕐</span> All Sessions
            </button>
            {currentSessionId && (
              <button
                className="app-sidebar-item"
                onClick={() => navigate(`/session/${currentSessionId}/singers`)}
              >
                <span>👥</span> Manage Singers
              </button>
            )}
            {/* <button className="app-sidebar-item">
              <span>🎵</span> Song Library
            </button> */}
          </div>

          {/* ACTIVE SESSIONS IN SIDEBAR */}
          {activeSessions.length > 0 && (
            <div className="app-sidebar-section">
              <p className="app-sidebar-label">Active Sessions</p>
              {activeSessions.map(session => (
                <button
                  key={session.id}
                  className={`app-sidebar-item app-sidebar-item--session ${
                    currentSessionId === String(session.id) ? 'app-sidebar-item--active' : ''
                  }`}
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <span className="app-session-dot" />
                  <span className="app-session-name">{session.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* <div className="app-sidebar-bottom">
            <button className="app-sidebar-item" onClick={onLogout}>
              <span>🚪</span> Logout
            </button>
          </div> */}
        </aside>

        {/* PAGE CONTENT */}
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;