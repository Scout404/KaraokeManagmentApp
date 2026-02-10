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
    <div style={{ marginBottom: '30px' }}>
      <h2>Register New Singer</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            required
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        )}

        {success && (
          <div style={{ color: 'green', marginBottom: '10px' }}>
            Singer registered successfully!
          </div>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Register Singer
        </button>
      </form>
    </div>
  );
}

export default SingerRegistrationForm;
