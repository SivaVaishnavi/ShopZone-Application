import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  { key: 'pending',   label: '⏳ Pending Approval' },
  { key: 'all',       label: 'All Orders' },
  { key: 'active',    label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialSearch ? 'all' : 'pending');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null); // tracks approve/reject in-progress

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders.'));
  }, []);

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
      setMessage('Order status updated.');
    } catch {
      setError('Could not update status.');
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const handleApprove = async (id) => {
    setActionId(id);
    setMessage('');
    setError('');
    try {
      const { data } = await api.put(`/orders/${id}/approve`);
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      setMessage('Order approved — status set to Processing.');
    } catch {
      setError('Could not approve order.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    setMessage('');
    setError('');
    try {
      const { data } = await api.put(`/orders/${id}/reject`);
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
      setMessage('Order rejected — status set to Cancelled.');
    } catch {
      setError('Could not reject order.');
    } finally {
      setActionId(null);
    }
  };

  const hasImage = (o) => o.mainImg && String(o.mainImg).trim() !== '';

  const pendingCount = orders.filter((o) => o.approvalStatus === 'Pending' && hasImage(o)).length;

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch = !q
      || o.name?.toLowerCase().includes(q)
      || o.email?.toLowerCase().includes(q)
      || o.title?.toLowerCase().includes(q);
    const matchesTab =
      activeTab === 'pending'   ? (o.approvalStatus === 'Pending' && hasImage(o)) :
      activeTab === 'all'       ? hasImage(o) :
      activeTab === 'active'    ? (hasImage(o) && o.approvalStatus !== 'Rejected' && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled') :
      activeTab === 'delivered' ? (hasImage(o) && o.orderStatus === 'Delivered') :
      activeTab === 'cancelled' ? (o.orderStatus === 'Cancelled' && hasImage(o)) : true;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="admin-list-page">

      {/* Header */}
      <div className="admin-list-header">
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Customer Orders</h2>
        <input
          className="admin-search-input"
          placeholder="Search by customer or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="order-tabs" style={{ marginTop: '1.2rem' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`order-tab ${activeTab === t.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.key === 'pending' && pendingCount > 0 && (
              <span style={{
                marginLeft: 6, background: '#ef4444', color: 'white',
                borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800,
                padding: '1px 7px', display: 'inline-block',
              }}>
                {pendingCount}
              </span>
            )}
            {t.key === 'all' && (
              <span style={{ marginLeft: 6, opacity: 0.65, fontSize: '0.8em' }}>({orders.filter(hasImage).length})</span>
            )}
          </button>
        ))}
      </div>

      {message && <p className="success-text" style={{ marginTop: '0.7rem' }}>{message}</p>}
      {error   && <p className="error-text"   style={{ marginTop: '0.7rem' }}>{error}</p>}

      {/* Pending notice banner */}
      {activeTab === 'pending' && pendingCount > 0 && (
        <div style={{
          marginTop: '1rem', padding: '12px 18px', borderRadius: 12,
          background: '#fffbeb', border: '1.5px solid #fcd34d',
          color: '#92400e', fontWeight: 600, fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          ⏳ {pendingCount} order{pendingCount > 1 ? 's' : ''} waiting for your approval. Review and Approve or Reject each one below.
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state" style={{ marginTop: '1rem' }}>
          <div className="empty-icon">{activeTab === 'pending' ? '🎉' : '📦'}</div>
          <h3>{activeTab === 'pending' ? 'All caught up!' : 'No orders found'}</h3>
          <p>{activeTab === 'pending' ? 'No pending approvals right now.' : 'Try a different tab or search term.'}</p>
        </div>
      )}

      {/* Order cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
        {filtered.map((o) => {
          const finalPrice = Math.round(o.price - (o.price * (o.discount || 0)) / 100);
          const isEditing  = editingId === o._id;
          const isActing   = actionId === o._id;
          const isPending  = o.approvalStatus === 'Pending';

          return (
            <div
              key={o._id}
              className="order-card"
              style={{
                flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden',
                border: isPending ? '2px solid #fcd34d' : '2px solid transparent',
              }}
            >
              {/* Pending top banner */}
              {isPending && (
                <div style={{
                  background: '#fffbeb', padding: '6px 20px',
                  fontSize: '0.8rem', fontWeight: 700, color: '#92400e',
                  borderBottom: '1px solid #fcd34d',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  ⏳ Awaiting admin approval
                </div>
              )}

              {/* Card body */}
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

                  {/* Customer row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#333' }}>👤 {o.name}</span>
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>{o.email}</span>
                    {o.mobile && <span style={{ fontSize: '0.78rem', color: '#aaa' }}>• {o.mobile}</span>}
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

              {/* Action bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                padding: '12px 20px',
                background: isPending ? '#fffdf0' : '#f8f7ff',
                borderTop: isPending ? '1px solid #fcd34d' : '1px solid #ede9fe',
              }}>
                {/* Approve / Reject — only for pending orders */}
                {isPending && (
                  <>
                    <button
                      className="edit-btn"
                      style={{ background: '#059669', minWidth: 110, fontSize: '0.9rem', padding: '0.45rem 1.1rem' }}
                      onClick={() => handleApprove(o._id)}
                      disabled={isActing}
                    >
                      {isActing ? 'Processing…' : '✅ Approve'}
                    </button>
                    <button
                      className="delete-btn"
                      style={{ minWidth: 110, fontSize: '0.9rem', padding: '0.45rem 1.1rem' }}
                      onClick={() => handleReject(o._id)}
                      disabled={isActing}
                    >
                      {isActing ? 'Processing…' : '✕ Reject'}
                    </button>
                    <span style={{ fontSize: '0.78rem', color: '#92400e', marginLeft: 4 }}>
                      Approving will set status to Processing
                    </span>
                  </>
                )}

                {/* Status editing — only for approved orders */}
                {!isPending && (
                  isEditing ? (
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
                      <button className="delete-btn" style={{ background: '#6b7280' }} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="edit-btn" onClick={() => startEdit(o)}>
                        ✏ Edit Status
                      </button>
                      <Link
                        to={`/admin/customers/${o.userId}/orders`}
                        className="edit-btn"
                        style={{ background: '#2563eb' }}
                      >
                        👤 Customer Orders
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOrders;
