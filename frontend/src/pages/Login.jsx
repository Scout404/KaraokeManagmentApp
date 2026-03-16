import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService'; // adjust path if needed
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(formData.username, formData.password);
      // data = { token: "...", user: { id, username, email, role } }
      
      authService.saveUser({
        ...data.user,
        token: data.token,
      });

      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid username or password';
      setError(message);
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

          {/* <a href="/register" className="register-link">
            Don't have an account? Register
          </a> */}
        </form>
      </div>
    </div>
  );
}

export default Login;