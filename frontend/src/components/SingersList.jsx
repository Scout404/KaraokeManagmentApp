import { useState, useEffect } from 'react';
import { singerService } from '../services/singerService';

function SingersList() {
  const [singers, setSingers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSingers();
  }, []);

  const loadSingers = async () => {
    try {
      setLoading(true);
      const data = await singerService.getAllSingers();
      setSingers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load singers: ' + err.message);
      console.error('Error loading singers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this singer?')) {
      try {
        await singerService.deleteSinger(id);
        loadSingers(); // Reload the list
      } catch (err) {
        setError('Failed to delete singer: ' + err.message);
      }
    }
  };

  if (loading) return <div>Loading singers...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Registered Singers</h2>
      {singers.length === 0 ? (
        <p>No singers registered yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Registered</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {singers.map((singer) => (
              <tr key={singer.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{singer.id}</td>
                <td style={{ padding: '10px' }}>{singer.name}</td>
                <td style={{ padding: '10px' }}>{singer.phoneNumber || 'N/A'}</td>
                <td style={{ padding: '10px' }}>
                  {new Date(singer.registeredAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => handleDelete(singer.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SingersList;
