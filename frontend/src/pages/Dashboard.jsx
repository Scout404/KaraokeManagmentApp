import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SingersList from '../components/SingersList';
import SingerRegistrationForm from '../components/SingerRegistrationForm';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
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
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎤 Karaoke Management System</h1>
          <div className="user-info">
            <span className="user-badge">{user.role}</span>
            <span className="username">{user.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <SingerRegistrationForm onRegistered={handleRegistered} />
        <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />
        <SingersList key={refreshKey} />
      </main>
    </div>
  );
}

export default Dashboard;