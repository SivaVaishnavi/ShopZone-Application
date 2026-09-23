import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', usertype: 'Customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password, form.usertype);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <span className="auth-kicker">ShopZe</span>
          <h1>Create your account</h1>
          <p>Join thousands of shoppers enjoying seamless buying, tracking, and personalized recommendations.</p>
          <ul className="auth-benefits">
            <li>Exclusive deals</li>
            <li>Tracked deliveries</li>
            <li>Simple profile management</li>
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-header">
            <span className="badge">Start shopping</span>
            <h2>Register</h2>
          </div>

          {error && <p className="error-text">{error}</p>}

          <label className="field-group">
            <span>Username</span>
            <input name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} required />
          </label>

          <label className="field-group">
            <span>Email address</span>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>

          <label className="field-group">
            <span>Account type</span>
            <select name="usertype" value={form.usertype} onChange={handleChange}>
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          </label>

          <button type="submit" disabled={loading} className="primary-btn auth-submit">
            {loading ? 'Registering...' : 'Create account'}
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
