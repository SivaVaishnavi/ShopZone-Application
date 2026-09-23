import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
  { value: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
];

const StepBar = ({ step }) => (
  <div className="step-bar">
    {['Cart', 'Delivery', 'Payment', 'Confirm'].map((label, i) => (
      <div key={label} className={`step-item ${i + 1 <= step ? 'step-done' : ''} ${i + 1 === step ? 'step-active' : ''}`}>
        <div className="step-circle">{i + 1 <= step && i + 1 < step ? '✓' : i + 1}</div>
        <span className="step-label">{label}</span>
        {i < 3 && <div className={`step-connector ${i + 1 < step ? 'connector-done' : ''}`} />}
      </div>
    ))}
  </div>
);

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ mobile: '', address: '', pincode: '', paymentMethod: 'COD' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(2); // 1=cart, 2=delivery, 3=payment, 4=confirm

  useEffect(() => {
    api.get('/cart')
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load cart.'));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const totalMRP = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = items.reduce((sum, i) => sum + (i.price * i.quantity * (i.discount || 0)) / 100, 0);
  const finalPrice = Math.round(totalMRP - discountAmount);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 2) {
      if (!form.mobile || !form.address || !form.pincode) {
        setError('Please fill all delivery fields.');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      for (const item of items) {
        await api.post('/orders', {
          name: user.username,
          email: user.email,
          mobile: form.mobile,
          address: form.address,
          pincode: form.pincode,
          title: item.title,
          mainImg: item.mainImg,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          paymentMethod: form.paymentMethod,
          orderDate: new Date().toISOString().split('T')[0],
          cartItemId: item._id,
        });
      }
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !error) return (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Add some items before checking out.</p>
      <button className="shop-now-btn" onClick={() => navigate('/products')}>Browse Products</button>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-main">
        <StepBar step={step} />

        {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}

        {/* Step 2 — Delivery */}
        {step === 2 && (
          <form className="checkout-form" onSubmit={handleNext}>
            <h2 className="checkout-section-title">📦 Delivery Details</h2>
            <div className="checkout-field">
              <label>Mobile Number</label>
              <input
                name="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={handleChange}
                required
                maxLength={10}
              />
            </div>
            <div className="checkout-field">
              <label>Full Address</label>
              <textarea
                name="address"
                placeholder="House No, Street, City, State"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>
            <div className="checkout-field">
              <label>Pincode</label>
              <input
                name="pincode"
                placeholder="6-digit pincode"
                value={form.pincode}
                onChange={handleChange}
                required
                maxLength={6}
              />
            </div>
            <button type="submit" className="checkout-btn">Continue to Payment →</button>
          </form>
        )}

        {/* Step 3 — Payment */}
        {step === 3 && (
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <h2 className="checkout-section-title">💳 Payment Method</h2>
            <div className="payment-options">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`payment-option ${form.paymentMethod === opt.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={form.paymentMethod === opt.value}
                    onChange={handleChange}
                  />
                  <span className="payment-icon">{opt.icon}</span>
                  <div className="payment-text">
                    <strong>{opt.label}</strong>
                    <span>{opt.desc}</span>
                  </div>
                  {form.paymentMethod === opt.value && <span className="payment-check">✓</span>}
                </label>
              ))}
            </div>

            <div className="checkout-address-summary">
              <h4>Delivering to:</h4>
              <p>{form.address}, {form.pincode}</p>
              <p>📞 {form.mobile}</p>
              <button type="button" className="edit-address-btn" onClick={() => setStep(2)}>Edit</button>
            </div>

            <div className="checkout-actions">
              <button type="button" className="secondary-btn" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="checkout-btn" disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Placing order…</> : `Place Order · ₹${finalPrice}`}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Order summary sidebar */}
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <div className="checkout-items-list">
          {items.map((item) => {
            const fp = Math.round(item.price - (item.price * (item.discount || 0)) / 100);
            return (
              <div className="checkout-item-row" key={item._id}>
                <img src={getImageUrl(item.mainImg)} alt={item.title} onError={(e) => (e.target.src = 'https://placehold.co/50')} />
                <div>
                  <p className="ci-title">{item.title}</p>
                  {item.size && <p className="ci-meta">Size: {item.size}</p>}
                  <p className="ci-meta">Qty: {item.quantity}</p>
                </div>
                <span className="ci-price">₹{fp * item.quantity}</span>
              </div>
            );
          })}
        </div>
        <div className="summary-divider" />
        <div className="summary-row"><span>Subtotal</span><span>₹{totalMRP}</span></div>
        <div className="summary-row green"><span>Discount</span><span>− ₹{Math.round(discountAmount)}</span></div>
        <div className="summary-row"><span>Delivery</span><span className="free-delivery">FREE</span></div>
        <div className="summary-divider" />
        <div className="summary-row total"><span>Total</span><span>₹{finalPrice}</span></div>
        {discountAmount > 0 && (
          <p className="savings-banner">🎉 You save ₹{Math.round(discountAmount)}!</p>
        )}
      </div>
    </div>
  );
};

export default Checkout;
