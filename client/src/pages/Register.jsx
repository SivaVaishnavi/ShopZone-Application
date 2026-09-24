import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', mobile: '', password: '', usertype: 'Customer' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let err = '';
    if (name === 'email') {
      if (value) {
        const val = value.trim();
        if (/^\d+@gmail\.com$/i.test(val)) {
          err = 'Email username cannot be numbers only';
        } else if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val)) {
          err = 'Email must contain letters and be a valid @gmail.com address';
        }
      }
    } else if (name === 'mobile') {
      if (value && !/^\d{10}$/.test(value.trim())) {
        err = 'Mobile number must be exactly 10 digits';
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isEmailValid = validateField('email', form.email);
    const isMobileValid = validateField('mobile', form.mobile);

    const cleanEmail = form.email.trim();
    if (!form.email || !/^(?=.*[a-zA-Z])[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      if (/^\d+@gmail\.com$/i.test(cleanEmail)) {
        setError('⚠️ Email address cannot be numbers only and must contain letters');
      } else {
        setError('⚠️ Email address must contain letters and be a valid @gmail.com domain');
      }
      return;
    }
    if (!form.mobile || !/^\d{10}$/.test(form.mobile.trim())) {
      setError('⚠️ Mobile number must be exactly 10 digits');
      return;
    }
    if (!isEmailValid || !isMobileValid) return;

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

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-header">
            <span className="badge">Start shopping</span>
            <h2>Register</h2>
          </div>

          {error && (
            <p className="error-text" style={{ background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #fca5a5' }}>
              {error}
            </p>
          )}

          <label className="field-group">
            <span>Username</span>
            <input
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field-group">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'input-error' : ''}
              required
            />
            {fieldErrors.email && <span className="field-error-msg">⚠️ {fieldErrors.email}</span>}
          </label>

          <label className="field-group">
            <span>Mobile Number</span>
            <input
              name="mobile"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChange={handleChange}
              maxLength={10}
              className={fieldErrors.mobile ? 'input-error' : ''}
              required
            />
            {fieldErrors.mobile && <span className="field-error-msg">⚠️ {fieldErrors.mobile}</span>}
          </label>

          <label className="field-group">
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
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
