import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data)).catch(() => setError('Could not load orders.'));
  }, []);

  return (
    <div className="admin-list-page">
      <h2>All Orders</h2>
      {error && <p className="error-text">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr><th>Product</th><th>Customer</th><th>Qty</th><th>Price</th><th>Status</th><th>Ordered On</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.title}</td>
              <td>{o.name} ({o.email})</td>
              <td>{o.quantity}</td>
              <td>₹{o.price}</td>
              <td>{o.orderStatus}</td>
              <td>{o.orderDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
