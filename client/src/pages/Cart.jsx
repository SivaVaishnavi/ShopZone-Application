import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/image';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();

  const loadCart = () => {
    api.get('/cart')
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load cart.'));
  };

  useEffect(() => { loadCart(); }, []);

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      await api.delete(`/cart/${id}`);
      loadCart();
    } catch {
      setError('Could not remove item.');
    } finally {
      setRemoving(null);
    }
  };

  const handleQtyChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) { handleRemove(item._id); return; }
    try {
      await api.patch(`/cart/${item._id}`, { quantity: newQty });
      loadCart();
    } catch {
      // silently skip if endpoint not available
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, quantity: newQty } : i));
    }
  };

  const totalMRP = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = items.reduce((sum, i) => sum + (i.price * i.quantity * (i.discount || 0)) / 100, 0);
  const deliveryCharges = 0;
  const finalPrice = Math.round(totalMRP - discountAmount + deliveryCharges);

  if (items.length === 0 && !error) return (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything yet.</p>
      <Link to="/products" className="shop-now-btn">Start Shopping</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-items">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          {items.length > 0 && (
            <span className="cart-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {error && <p className="error-text">{error}</p>}

        {items.map((item) => {
          const itemFinalPrice = Math.round(item.price - (item.price * (item.discount || 0)) / 100);
          return (
            <div className={`cart-item ${removing === item._id ? 'removing' : ''}`} key={item._id}>
              <Link to={`/products/${item.productId || ''}`}>
                <img
                  src={getImageUrl(item.mainImg)}
                  alt={item.title}
                  onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
                />
              </Link>
              <div className="cart-item-info">
                <h4>{item.title}</h4>
                {item.size && <p className="cart-meta">Size: <strong>{item.size}</strong></p>}
                <div className="cart-price-row">
                  <span className="cart-item-price">₹{itemFinalPrice}</span>
                  {item.discount > 0 && <span className="cart-item-mrp">₹{item.price}</span>}
                  {item.discount > 0 && <span className="cart-discount-tag">{item.discount}% OFF</span>}
                </div>
                <div className="cart-item-footer">
                  <div className="qty-control">
                    <button onClick={() => handleQtyChange(item, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item, +1)}>+</button>
                  </div>
                  <span className="cart-item-total">Total: ₹{itemFinalPrice * item.quantity}</span>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item._id)}
                    disabled={removing === item._id}
                  >
                    {removing === item._id ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="price-details">
          <h3>Price Summary</h3>
          <div className="price-row">
            <span>Total MRP ({items.length} items)</span>
            <span>₹{totalMRP}</span>
          </div>
          <div className="price-row savings">
            <span>Discount</span>
            <span>− ₹{Math.round(discountAmount)}</span>
          </div>
          <div className="price-row">
            <span>Delivery</span>
            <span className="free-delivery">FREE</span>
          </div>
          <div className="price-divider" />
          <div className="price-row final-row">
            <span>Total Amount</span>
            <span>₹{finalPrice}</span>
          </div>
          {discountAmount > 0 && (
            <p className="savings-banner">🎉 You're saving ₹{Math.round(discountAmount)} on this order!</p>
          )}
          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
