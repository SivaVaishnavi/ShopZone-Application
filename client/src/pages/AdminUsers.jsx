import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data)).catch(() => setError('Could not load users.'));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="admin-list-page">
      <div className="admin-list-header">
        <h2>All Customers</h2>
        <input
          className="admin-search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="error-text" style={{ marginTop: '0.6rem' }}>{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u._id}>
              <td style={{ fontWeight: 600 }}>{u.username}</td>
              <td>{u.email}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <Link
                  to={`/admin/orders?search=${encodeURIComponent(u.email || u.username)}`}
                  className="edit-btn"
                  style={{ background: '#2563eb', whiteSpace: 'nowrap' }}
                >
                  View Orders
                </Link>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No customers found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
