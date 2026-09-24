import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/image';

const ORDER_STATUSES = ['Order placed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

const STATUS_CONFIG = {
  'Order placed':     { color: '#f59e0b', bg: '#fef3c7', icon: '🕐' },
  Processing:         { color: '#3b82f6', bg: '#eff6ff', icon: '⚙️' },
  Shipped:            { color: '#8b5cf6', bg: '#f5f3ff', icon: '🚚' },
  'Out for delivery': { color: '#0ea5e9', bg: '#e0f2fe', icon: '🛵' },
  Delivered:          { color: '#10b981', bg: '#ecfdf5', icon: '✅' },
  Cancelled:          { color: '#ef4444', bg: '#fef2f2', icon: '✕' },
};

const APPROVAL_CONFIG = {
  Pending:  { color: '#d97706', bg: '#fef3c7', icon: '⏳', label: 'Pending Approval' },
  Approved: { color: '#059669', bg: '#d1fae5', icon: '✅', label: 'Approved' },
  Rejected: { color: '#dc2626', bg: '#fee2e2', icon: '✕',  label: 'Rejected' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Order placed'];
  return (
    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      {cfg.icon} {status}
    </span>
  );
};

const ApprovalBadge = ({ status }) => {
  const cfg = APPROVAL_CONFIG[status] || APPROVAL_CONFIG.Pending;
  return (
    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`, fontWeight: 700 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const TABS = [
  { key: 'all',       label: 'All Orders' },
  { key: 'active',    label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const AdminCustomerOrders = () => {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/user/${userId}`)
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders for this customer.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const startEdit = (order) => {
    setEditingId(order._id);
    setEditStatus(order.orderStatus);
    setMessage('');
    setError('');
  };

  const saveStatus = async (id) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { orderStatus: editStatus });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, orderStatus: data.orderStatus } : o)));
      setMessage('Order status updated successfully.');
    } catch {
      setError('Could not update status.');
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const hasImage = (o) => o.mainImg && String(o.mainImg).trim() !== '';
  const validOrders = orders.filter(hasImage);

  const customer = validOrders.length > 0
    ? { name: validOrders[0].name, email: validOrders[0].email, mobile: validOrders[0].mobile }
    : (orders.length > 0 ? { name: orders[0].name, email: orders[0].email, mobile: orders[0].mobile } : null);

  const totalSpend = validOrders.reduce((sum, o) => {
    const fp = Math.round(o.price - (o.price * (o.discount || 0)) / 100);
    return sum + fp * o.quantity;
  }, 0);

  const filtered = orders.filter((o) => {
    if (activeTab === 'all')       return hasImage(o);
    if (activeTab === 'active')    return hasImage(o) && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled';
    if (activeTab === 'delivered') return hasImage(o) && o.orderStatus === 'Delivered';
    if (activeTab === 'cancelled') return o.orderStatus === 'Cancelled' && hasImage(o);
    return hasImage(o);
  });

  return (
    <div className="admin-list-page">
      {/* Back nav */}
      <div style={{ marginBottom: '1.2rem' }}>
        <Link to="/admin/users" className="secondary-btn" style={{ fontSize: '0.85rem' }}>
          ← Back to Customers
        </Link>
      </div>

      {/* Customer header card */}
      <div className="admin-customer-header">
        <div className="admin-customer-avatar">
          {customer ? customer.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
            {customer ? customer.name : 'Customer'}
          </h2>
          {customer && (
            <p style={{ color: '#888', fontSize: '0.88rem', margin: '4px 0 0' }}>
              {customer.email}{customer.mobile ? ` • ${customer.mobile}` : ''}
            </p>
          )}
        </div>
        <div className="admin-customer-stats">
          <div className="admin-cstat">
            <span className="admin-cstat-val">{validOrders.length}</span>
            <span className="admin-cstat-label">Orders</span>
          </div>
          <div className="admin-cstat">
            <span className="admin-cstat-val">
              {validOrders.filter(o => o.orderStatus === 'Delivered').length}
            </span>
            <span className="admin-cstat-label">Delivered</span>
          </div>
          <div className="admin-cstat">
            <span className="admin-cstat-val">₹{totalSpend.toLocaleString()}</span>
            <span className="admin-cstat-label">Total Spend</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="order-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`order-tab ${activeTab === t.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && <p className="success-text" style={{ marginTop: '0.6rem' }}>{message}</p>}
      {error && <p className="error-text" style={{ marginTop: '0.6rem' }}>{error}</p>}
      {loading && <p style={{ marginTop: '1rem', color: '#888' }}>Loading orders…</p>}

      {/* Empty state */}
      {!loading && filtered.length === 0 && !error && (
        <div className="empty-state" style={{ marginTop: '1rem' }}>
          <div className="empty-icon">🛍️</div>
          <h3>No orders found</h3>
          <p>
            {activeTab === 'all'
              ? 'This customer hasn\'t placed any orders yet.'
              : 'No orders match this filter.'}
          </p>
        </div>
      )}

      {/* Order cards — same structure as Profile page */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
          {filtered.map((o) => {
            const finalPrice = Math.round(o.price - (o.price * (o.discount || 0)) / 100);
            const isEditing = editingId === o._id;
            return (
              <div
                className="order-card"
                key={o._id}
                style={{ flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}
              >
                {/* Top row: image + info */}
                <div style={{ display: 'flex', gap: 16, padding: '18px 20px', alignItems: 'flex-start' }}>
                  <img
                    src={getImageUrl(o.mainImg)}
                    alt={o.title}
                    onError={(e) => (e.target.src = 'https://placehold.co/88x88?text=No+Img')}
                    style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
                  />

                  <div className="order-info" style={{ flex: 1 }}>
                    <div className="order-info-header">
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{o.title}</h4>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {!isEditing && <StatusBadge status={o.orderStatus} />}
                        <ApprovalBadge status={o.approvalStatus || 'Pending'} />
                      </div>
                    </div>

                    <div className="order-meta-grid">
                      {o.size && <span>📏 Size: {o.size}</span>}
                      <span>📦 Qty: {o.quantity}</span>
                      <span>💳 {o.paymentMethod}</span>
                      <span>📅 {o.orderDate}</span>
                      {o.deliveryDate && <span>🚚 Deliver by: {o.deliveryDate}</span>}
                      {(o.approvedBy || o.approvalStatus === 'Approved') && (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          🛡️ Approval Admin: {o.approvedBy || 'ShopZeAdmin'}
                        </span>
                      )}
                    </div>

                    <div className="order-price-row" style={{ marginTop: 6 }}>
                      <span className="order-price">₹{finalPrice * o.quantity}</span>
                      <span className="order-address">📍 {o.address}, {o.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom action bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                  padding: '12px 20px', background: '#f8f7ff',
                  borderTop: '1px solid #ede9fe',
                }}>
                  {isEditing ? (
                    <>
                      <select
                        className="admin-status-select"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <button className="edit-btn" onClick={() => saveStatus(o._id)} disabled={saving}>
                        {saving ? 'Saving…' : '✓ Save'}
                      </button>
                      <button
                        className="delete-btn"
                        style={{ background: '#6b7280' }}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="edit-btn" onClick={() => startEdit(o)}>
                      ✏ Edit Status
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCustomerOrders;
