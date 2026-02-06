import { useState } from 'react';
import './App.css';
import SingersList from './components/SingersList';
import SingerRegistrationForm from './components/SingerRegistrationForm';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegistered = () => {
    // Force refresh of the singers list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
      }}>
        <h1>🎤 Karaoke Management System</h1>
      </header>
      
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <SingerRegistrationForm onRegistered={handleRegistered} />
        <hr style={{ margin: '30px 0' }} />
        <SingersList key={refreshKey} />
      </main>
    </div>
  );
}

export default App;