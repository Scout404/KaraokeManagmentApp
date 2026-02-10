import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SingersList from '../components/SingersList';
import SingerRegistrationForm from '../components/SingerRegistrationForm';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddSingerModal, setShowAddSingerModal] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRegistered = () => {
    setRefreshKey((prev) => prev + 1);
    setShowAddSingerModal(false);
  };

  if (!user) return null;

return (
  <div className="dashboard">
    <header className="dashboard-header">
      <div className="header-left">
        <span className="app-title">Karaoke Management</span>
        <span className="app-subtitle">Live Session</span>
      </div>
      <div className="header-right">
        <input
            className="search-input"
            placeholder="Search songs or singers..."
          />
          <button
            onClick={() => setShowAddSingerModal(true)}
            className="add-singer-button"
          >
            + Add Singer
          </button>
      </div>
    </header>

    <div className="dashboard-body">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
      <div className="logo">VibeLounge</div>
      <nav className="nav">
        <button className="nav-item active">
          <span className="menu-icon">📋</span> Queue
        </button>
        <button className="nav-item">
          <span className="menu-icon">🎤</span> Singers
        </button>
        <button className="nav-item">
          <span className="menu-icon">📊</span> Insights
        </button>
      </nav>

      <div className="sidebar-bottom">
        <span className="user-role">{user.role}</span>
        <span className="username">{user.username}</span>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </aside>

    {/* CENTER COLUMN */}
    <div className="main">
      <header className="topbar">
        <div className="session-info">
          <h1>Session Overview</h1>
          <p>Friday Night Live – Neon Room</p>
        </div>

        
      </header>

      <div className="content-grid">
        <section className="stats">
          <div className="stat-card">
            <span>Total Singers</span>
            <h3>24</h3>
            <p>+12% from last week</p>
          </div>
          <div className="stat-card">
            <span>Songs Today</span>
            <h3>142</h3>
            <p>+5% vs target</p>
          </div>
          <div className="stat-card">
            <span>Wait Time</span>
            <h3>45m</h3>
            <p>Peak hours active</p>
          </div>
        </section>

        <section className="now-playing">
          <div className="badge-row">
            <span className="badge on-air">On Air</span>
            <span className="badge room">Neon Room</span>
          </div>
          <div className="now-playing-main">
            <h4>Now Singing</h4>
            <h2>Sarah J.</h2>
            <p>"Don't Stop Believin'" – Journey</p>
          </div>
          <div className="controls">
            <button className="control-btn">⏮</button>
            <button className="control-btn play">⏯</button>
            <button className="control-btn">⏭</button>
          </div>
        </section>
      </div>

      <section className="bottom-strip">
        <h3>Singer Directory</h3>
        <button className="link-button">Manage All Singers →</button>
      </section>
    </div>

    {/* RIGHT SIDEBAR */}
    <aside className="right-panel">
      <div className="queue-header">
        <h3>Queue Preview</h3>
        <span>Next 5</span>
      </div>
      <SingersList key={refreshKey} />
      <button className="insert-btn">+ Insert into Queue</button>
    </aside>
    </div>

    {/* MODAL */}
    {showAddSingerModal && (
      <div 
        onClick={() => setShowAddSingerModal(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#151521',
            borderRadius: '16px',
            border: '1px solid #26263a',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #26263a',
          }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f7f7ff' }}>Add New Singer</h2>
            <button 
              onClick={() => setShowAddSingerModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#a0a0b5',
                padding: 0,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#f7f7ff';
                e.target.style.background = '#1a1b2b';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#a0a0b5';
                e.target.style.background = 'none';
              }}
            >
              ×
            </button>
          </div>
          <SingerRegistrationForm onRegistered={handleRegistered} />
        </div>
      </div>
    )}
  </div>
);

}

export default Dashboard;