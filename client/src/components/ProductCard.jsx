import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getImageUrl } from '../utils/image';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const StarRating = ({ rating = 4.2, count = 128 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= full ? 'star-full' : i === full+1 && half ? 'star-half' : 'star-empty'}`}>★</span>
      ))}
      <span className="rating-count">({count})</span>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const liked = isWishlisted(product._id);
  const [addStatus, setAddStatus] = useState('idle'); // idle | loading | done

  const finalPrice = Math.round(product.price - (product.price * (product.discount || 0)) / 100);
  const savings = product.price - finalPrice;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (addStatus !== 'idle') return;
    setAddStatus('loading');
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
      setAddStatus('done');
      setTimeout(() => setAddStatus('idle'), 2000);
    } catch {
      setAddStatus('idle');
    }
  };

  return (
    <div className="product-card">
      <button
        className={`wishlist-btn ${liked ? 'wished' : ''}`}
        onClick={() => toggleWishlist(product)}
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {liked ? '❤️' : '🤍'}
      </button>

      {product.discount > 0 && (
        <span className="discount-badge">{product.discount}% OFF</span>
      )}

      <Link to={`/products/${product._id}`} className="product-image-container">
        <img
          src={getImageUrl(product.mainImg)}
          alt={product.title}
          loading="lazy"
          onError={(e) => (e.target.src = 'https://placehold.co/300?text=No+Image')}
        />
        <div className="card-hover-overlay">
          <span>Quick View</span>
        </div>
      </Link>

      <div className="product-info">
        <StarRating rating={product.rating || 4.2} count={product.reviewCount || 128} />

        <h3 title={product.title}>{product.title}</h3>

        <p className="product-desc">{product.description?.slice(0, 65)}…</p>

        <div className="price-box">
          <span className="price">₹{finalPrice}</span>
          {product.discount > 0 && (
            <>
              <span className="mrp">₹{product.price}</span>
              <span className="savings-tag">Save ₹{savings}</span>
            </>
          )}
        </div>

        <button
          className={`quick-add-btn ${addStatus === 'done' ? 'added' : ''}`}
          onClick={handleQuickAdd}
          disabled={addStatus === 'loading'}
        >
          {addStatus === 'loading' && <span className="btn-spinner" />}
          {addStatus === 'done' ? '✓ Added to Cart' : 'Add to Cart'}
        </button>

        <Link to={`/products/${product._id}`} className="view-detail-link">
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
