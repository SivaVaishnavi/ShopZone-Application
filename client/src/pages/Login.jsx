import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <span className="auth-kicker">ShopZe</span>
          <h1>Welcome back</h1>
          <p>Access your account to track orders, save favorites, and continue shopping with confidence.</p>
          <ul className="auth-benefits">
            <li>Fast checkout</li>
            <li>Order tracking</li>
            <li>Member-only offers</li>
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-header">
            <span className="badge">Secure access</span>
            <h2>Login</h2>
          </div>

          {error && <p className="error-text">{error}</p>}

          <label className="field-group">
            <span>Email address</span>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          </label>

          <button type="submit" disabled={loading} className="primary-btn auth-submit">
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
