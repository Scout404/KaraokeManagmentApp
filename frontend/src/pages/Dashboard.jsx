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
      <div className="modal-overlay" onClick={() => setShowAddSingerModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add New Singer</h2>
            <button className="modal-close" onClick={() => setShowAddSingerModal(false)}>
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