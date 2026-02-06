import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO: Replace with actual API call later
    // For now, we'll use mock authentication
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock credentials (we'll replace this with real auth later)
      if (formData.username === 'admin' && formData.password === 'admin123') {
        // Store auth token/user info (we'll use localStorage for now)
        localStorage.setItem('user', JSON.stringify({
          username: formData.username,
          role: 'Admin'
        }));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else if (formData.username === 'worker' && formData.password === 'worker123') {
        localStorage.setItem('user', JSON.stringify({
          username: formData.username,
          role: 'Worker'
        }));
        
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎤 Karaoke Management</h1>
          <p>Admin & Worker Login</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Admin: admin / admin123<br />
            Worker: worker / worker123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;