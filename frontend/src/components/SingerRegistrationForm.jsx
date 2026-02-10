import { useState } from 'react';
import { singerService } from '../services/singerService';

function SingerRegistrationForm({ onRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      await singerService.registerSinger(formData);
      setSuccess(true);
      setFormData({ name: '' });
      
      // Call parent callback to refresh the list
      if (onRegistered) {
        onRegistered();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to register: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            color: '#f7f7ff',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #2f3144',
              borderRadius: '8px',
              background: '#0c0c15',
              color: '#f7f7ff',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        {error && (
          <div style={{ 
            color: '#ff3b81', 
            marginBottom: '12px',
            fontSize: '13px',
            padding: '8px 12px',
            background: 'rgba(255, 59, 129, 0.1)',
            borderRadius: '6px',
          }}>{error}</div>
        )}

        {success && (
          <div style={{ 
            color: '#4cd964', 
            marginBottom: '12px',
            fontSize: '13px',
            padding: '8px 12px',
            background: 'rgba(76, 217, 100, 0.1)',
            borderRadius: '6px',
          }}>
            Singer registered successfully!
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(90deg, #ff1fcf, #5b21ff)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Register Singer
        </button>
      </form>
    </div>
  );
}

export default SingerRegistrationForm;
