import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';
import api from '../api/axios';

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movingId, setMovingId] = useState(null);
  const [movedIds, setMovedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMoveToCart = async (product) => {
    if (!user) { navigate('/login'); return; }
    setMovingId(product._id);
    try {
      await api.post('/cart', {
        productId: product._id,
        title: product.title,
        mainImg: product.mainImg,
        size: product.sizes?.[0] || '',
        quantity: 1,
        price: product.price,
        discount: product.discount,
      });
      setMovedIds((prev) => new Set([...prev, String(product._id)]));
      showToast(`"${product.title}" moved to cart!`);
    } catch {
      showToast('Could not add to cart', 'error');
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (!user) { navigate('/login'); return; }
    for (const product of items) {
      try {
        await api.post('/cart', {
          productId: product._id,
          title: product.title,
          mainImg: product.mainImg,
          size: product.sizes?.[0] || '',
          quantity: 1,
          price: product.price,
          discount: product.discount,
        });
      } catch { /* continue */ }
    }
    setMovedIds(new Set(items.map((i) => String(i._id))));
    showToast('All items moved to cart!');
  };

  const totalSavings = items.reduce((sum, p) => {
    const discount = Math.round((p.price * (p.discount || 0)) / 100);
    return sum + discount;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="wishlist-empty-icon">
          <span className="heart-big">♡</span>
        </div>
        <h2>Your wishlist is empty</h2>
        <p>Save products you love and come back to them anytime.</p>
        <Link to="/products" className="shop-now-btn">Explore Products</Link>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="wishlist-page">
        <div className="wishlist-header">
          <div>
            <h1>My Wishlist</h1>
            <p className="wishlist-subtitle">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="wishlist-header-actions">
            {items.length > 1 && (
              <button className="move-all-btn" onClick={handleMoveAllToCart}>
                🛒 Move All to Cart
              </button>
            )}
            <button className="clear-wishlist-btn" onClick={clearWishlist}>
              Clear All
            </button>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="wishlist-savings-banner">
            🎉 Buy everything in your wishlist and save <strong>₹{totalSavings}</strong>!
          </div>
        )}

        <div className="wishlist-grid">
          {items.map((product) => {
            const finalPrice = Math.round(product.price - (product.price * (product.discount || 0)) / 100);
            const alreadyMoved = movedIds.has(String(product._id));
            const isMoving = movingId === product._id;

            return (
              <div className="wishlist-card" key={product._id}>
                <button
                  className="wishlist-card-remove"
                  onClick={() => removeFromWishlist(product._id)}
                  title="Remove from wishlist"
                >
                  ✕
                </button>

                {product.discount > 0 && (
                  <span className="discount-badge">{product.discount}% OFF</span>
                )}

                <Link to={`/products/${product._id}`} className="wishlist-card-img-wrap">
                  <img
                    src={getImageUrl(product.mainImg)}
                    alt={product.title}
                    onError={(e) => (e.target.src = 'https://placehold.co/280?text=No+Image')}
                  />
                </Link>

                <div className="wishlist-card-info">
                  <Link to={`/products/${product._id}`} className="wishlist-card-title">
                    {product.title}
                  </Link>

                  {product.category && (
                    <span className="wishlist-card-cat">{product.category}</span>
                  )}

                  <div className="wishlist-card-price">
                    <span className="price">₹{finalPrice}</span>
                    {product.discount > 0 && (
                      <>
                        <span className="mrp">₹{product.price}</span>
                        <span className="savings-tag">Save ₹{product.price - finalPrice}</span>
                      </>
                    )}
                  </div>

                  <button
                    className={`wishlist-cart-btn ${alreadyMoved ? 'moved' : ''}`}
                    onClick={() => handleMoveToCart(product)}
                    disabled={isMoving || alreadyMoved}
                  >
                    {isMoving
                      ? <><span className="btn-spinner" /> Adding…</>
                      : alreadyMoved
                      ? '✓ In Cart'
                      : '🛒 Move to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
