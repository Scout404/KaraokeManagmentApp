import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Displayqueue.css';

function Displayqueue() {
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

    if (!user) return null;

    return (
        <div className="Displayqueue">
            <header className="Displayqueue-header">
                <div className="Displayqueue-header-left">   
                    <span className="Displayqueue-app-title">Valentine</span>
                    <span className="Displayqueue-app-subtitle">Karaoke By Ruben</span>
                </div>
            </header>

              <div className="Displayqueue-main">  
              <div className="Displayqueue-main-content">
                <div className="Displayqueue-left-panel">
                  <div className="Displayqueue-left-panel-header">Singing Now</div>
                  <div className="Displayqueue-left-panel-content">
                  </div>
                </div>

                <div className="Displayqueue-right-panel">
                  <div className="Displayqueue-right-panel-header">Upcoming Stars</div>
                  <div className="Displayqueue-right-panel-content">
                  </div>
                </div>
              </div>
            

              </div>

        </div>
    );
}

export default Displayqueue;