import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, allProducts: 0, allOrders: 0 });
  const [banner, setBanner] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data)).catch(() => setError('Could not load stats.'));
    api.get('/admin/settings').then((res) => setBanner(res.data.banner || ''));
  }, []);

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/admin/settings', { banner });
      setMessage('Banner updated!');
    } catch {
      setError('Could not update banner.');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {error && <p className="error-text">{error}</p>}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total users</p>
          <p className="stat-value">{stats.totalUsers}</p>
          <Link to="/admin/users">View all</Link>
        </div>
        <div className="stat-card">
          <p className="stat-label">All Products</p>
          <p className="stat-value">{stats.allProducts}</p>
          <Link to="/admin/products">Manage</Link>
        </div>
       
        <div className="stat-card">
          <p className="stat-label">All Orders</p>
          <p className="stat-value">{stats.allOrders}</p>
          <Link to="/admin/orders">View all</Link>
        </div>
        <div className="stat-card">
          <p className="stat-label">Add Product</p>
          <p className="stat-value">(new)</p>
          <Link to="/admin/add-product">Add now</Link>
        </div>
      </div>

      <form className="banner-form" onSubmit={handleUpdateBanner}>
        <h3>Update banner</h3>
        {message && <p className="success-text">{message}</p>}
        <input placeholder="Banner url" value={banner} onChange={(e) => setBanner(e.target.value)} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
