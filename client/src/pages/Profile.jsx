import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const STATUS_CONFIG = {
  Pending:    { color: '#f59e0b', bg: '#fef3c7', label: 'Pending',    icon: '🕐' },
  Processing: { color: '#3b82f6', bg: '#eff6ff', label: 'Processing', icon: '⚙️' },
  Shipped:    { color: '#8b5cf6', bg: '#f5f3ff', label: 'Shipped',    icon: '🚚' },
  Delivered:  { color: '#10b981', bg: '#ecfdf5', label: 'Delivered',  icon: '✅' },
  Cancelled:  { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled',  icon: '✕' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  return (
    <span
      className="status-badge"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const loadOrders = () => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders.'));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      loadOrders();
    } catch {
      setError('Could not cancel order.');
    }
  };

  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'active', label: 'Active' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled';
    if (activeTab === 'delivered') return o.orderStatus === 'Delivered';
    if (activeTab === 'cancelled') return o.orderStatus === 'Cancelled';
    return true;
  });

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-avatar">{initials}</div>
        <h3 className="profile-name">{user?.username}</h3>
        <p className="profile-email">{user?.email}</p>

        <div className="profile-stats">
          <div className="pstat">
            <span className="pstat-value">{orders.length}</span>
            <span className="pstat-label">Orders</span>
          </div>
          <div className="pstat">
            <span className="pstat-value">{orders.filter(o => o.orderStatus === 'Delivered').length}</span>
            <span className="pstat-label">Delivered</span>
          </div>
        </div>

        <Link to="/products" className="shop-now-btn profile-shop-btn">Browse Products</Link>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </aside>

      <main className="orders-list">
        <div className="orders-header">
          <h2>My Orders</h2>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="order-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`order-tab ${activeTab === t.key ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/products" className="shop-now-btn">Shop Now</Link>
          </div>
        )}

        {filteredOrders.map((o) => {
          const fp = Math.round(o.price - (o.price * (o.discount || 0)) / 100);
          return (
            <div className="order-card" key={o._id}>
              <img
                src={getImageUrl(o.mainImg)}
                alt={o.title}
                onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
              />
              <div className="order-info">
                <div className="order-info-header">
                  <h4>{o.title}</h4>
                  <StatusBadge status={o.orderStatus} />
                </div>
                <div className="order-meta-grid">
                  {o.size && <span>📏 Size: {o.size}</span>}
                  <span>📦 Qty: {o.quantity}</span>
                  <span>💳 {o.paymentMethod}</span>
                  <span>📅 {o.orderDate}</span>
                  {(o.approvedBy || o.approvalStatus === 'Approved') && (
                    <span style={{ color: '#059669', fontWeight: 600 }}>
                      🛡️ Approval Admin: {o.approvedBy || 'ShopZeAdmin'}
                    </span>
                  )}
                </div>
                <div className="order-price-row">
                  <span className="order-price">₹{fp * o.quantity}</span>
                  <span className="order-address">📍 {o.address}, {o.pincode}</span>
                </div>
                {o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Delivered' && (
                  <button className="cancel-order-btn" onClick={() => handleCancel(o._id)}>
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default Profile;
