import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import RelatedProducts from '../components/RelatedProducts';
import { getImageUrl } from '../utils/image';
import { fallbackProducts } from '../assets/fallbackProducts';

// ── Helpers ──────────────────────────────────────────────────────────────────

const TrustBadge = ({ icon, text }) => (
  <div className="trust-badge">
    <span className="trust-icon">{icon}</span>
    <span>{text}</span>
  </div>
);

const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type}`}>
    <span>{type === 'success' ? '✓' : '✕'}</span>
    <span>{message}</span>
    <button className="toast-close" onClick={onClose}>✕</button>
  </div>
);

const Stars = ({ rating, size = 'sm', interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || rating) : rating;
  const full = Math.floor(display);
  const half = !interactive && display % 1 >= 0.5;

  return (
    <span className={`stars stars-${size}`}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = interactive ? i <= display : i <= full;
        const isHalf = !interactive && !filled && i === full + 1 && half;
        return (
          <span
            key={i}
            className={`star ${filled ? 'star-full' : isHalf ? 'star-half' : 'star-empty'}`}
            onClick={interactive ? () => onRate(i) : undefined}
            onMouseEnter={interactive ? () => setHover(i) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            style={interactive ? { cursor: 'pointer' } : {}}
          >★</span>
        );
      })}
    </span>
  );
};

const RatingBar = ({ label, value, total }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rating-bar-row">
      <span className="rbar-label">{label} ★</span>
      <div className="rbar-track"><div className="rbar-fill" style={{ width: `${pct}%` }} /></div>
      <span className="rbar-count">{value}</span>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [addStatus, setAddStatus] = useState('idle');
  const [buyStatus, setBuyStatus] = useState('idle');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', body: '' });
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | loading | done | error
  const [reviewError, setReviewError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load product ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setSelectedImage(res.data.mainImg);
        if (res.data.sizes?.length) setSize(res.data.sizes[0]);
      })
      .catch(() => {
        const found = fallbackProducts.find((p) => String(p._id) === String(id));
        if (found) {
          setProduct(found);
          setSelectedImage(found.mainImg);
          if (found.sizes?.length) setSize(found.sizes[0]);
        } else {
          showToast('Could not load product', 'error');
        }
      });
  }, [id]);

  // ── Load reviews ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Try live API first
    api.get(`/products/${id}/reviews`)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          // Fall back to embedded reviews from fallback data
          const found = fallbackProducts.find((p) => String(p._id) === String(id));
          if (found?.reviews?.length) setReviews(found.reviews);
        }
      })
      .catch(() => {
        const found = fallbackProducts.find((p) => String(p._id) === String(id));
        if (found?.reviews?.length) setReviews(found.reviews);
      });
  }, [id]);

  // ── Cart actions ──────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (addStatus !== 'idle') return;
    setAddStatus('loading');
    try {
      await api.post('/cart', { productId: product._id, title: product.title, mainImg: product.mainImg, size, quantity, price: product.price, discount: product.discount });
      setAddStatus('done');
      showToast('Added to cart successfully!', 'success');
      setTimeout(() => setAddStatus('idle'), 2500);
    } catch (err) {
      setAddStatus('idle');
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  };

  const handleShopNow = async () => {
    if (!user) { navigate('/login'); return; }
    setBuyStatus('loading');
    try {
      await api.post('/cart', { productId: product._id, title: product.title, mainImg: product.mainImg, size, quantity, price: product.price, discount: product.discount });
      navigate('/cart');
    } catch {
      setBuyStatus('idle');
      navigate('/cart');
    }
  };

  // ── Submit review ─────────────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!reviewForm.rating) { setReviewError('Please select a star rating.'); return; }
    if (!reviewForm.body.trim()) { setReviewError('Please write your review.'); return; }
    setReviewError('');
    setSubmitStatus('loading');
    try {
      const { data } = await api.post(`/products/${id}/reviews`, reviewForm);
      // Prepend the new review and update product rating display
      setReviews(prev => [data, ...prev.filter(r => r.userId !== data.userId)]);
      setProduct(prev => prev ? { ...prev, reviewCount: (prev.reviewCount || 0) + 1 } : prev);
      setReviewForm({ rating: 0, title: '', body: '' });
      setSubmitStatus('done');
      showToast('Your review was submitted!', 'success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review.');
      setSubmitStatus('idle');
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!product) return (
    <div className="product-page-skeleton">
      <div className="skeleton-gallery">
        <div className="skeleton-thumbs">{[0,1,2].map(i => <div key={i} className="skeleton-thumb" />)}</div>
        <div className="skeleton-main-img" />
      </div>
      <div className="skeleton-info">
        <div className="skeleton-line" style={{ width: '60%', height: '2rem' }} />
        <div className="skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton-line" style={{ width: '80%' }} />
        <div className="skeleton-line" style={{ width: '30%', height: '2.5rem' }} />
      </div>
    </div>
  );

  const finalPrice = Math.round(product.price - (product.price * (product.discount || 0)) / 100);
  const savings = product.price - finalPrice;
  const images = [product.mainImg, ...(product.carousel || [])];
  const rating = product.rating || 4.2;
  const reviewCount = product.reviewCount || reviews.length || 0;

  // Compute bar distribution from loaded reviews
  const dist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => Math.round(r.rating) === n).length,
  }));

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Product hero ── */}
      <div className="product-page">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="thumbnail-list">
            {images.map((img, index) => (
              <img key={index} src={getImageUrl(img)} onClick={() => setSelectedImage(img)}
                className={selectedImage === img ? 'thumb-active' : ''}
                onError={(e) => (e.target.src = 'https://placehold.co/100')}
                alt={`Thumbnail ${index + 1}`} />
            ))}
          </div>
          <div className="main-image-wrapper">
            <img className="main-product-image" src={getImageUrl(selectedImage)} alt={product.title}
              onError={(e) => (e.target.src = 'https://placehold.co/400')} />
            <button
              className={`detail-wishlist-btn ${isWishlisted(product._id) ? 'wished' : ''}`}
              onClick={() => toggleWishlist(product)}
              aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              {isWishlisted(product._id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="product-detail-info">
          {product.category && <span className="product-category-tag">{product.category}</span>}
          <h1>{product.title}</h1>

          <div className="detail-rating-row">
            <Stars rating={rating} size="md" />
            <span className="detail-rating-num">{rating}</span>
            <a href="#reviews" className="detail-review-link">({reviewCount.toLocaleString()} reviews)</a>
          </div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-price">
            <span className="price">₹{finalPrice}</span>
            {product.discount > 0 && (<>
              <span className="mrp">₹{product.price}</span>
              <span className="discount-chip">{product.discount}% OFF</span>
            </>)}
          </div>
          {product.discount > 0 && <p className="savings-info">You save ₹{savings} on this order</p>}

          {product.sizes?.length > 0 && (
            <div className="size-selector">
              <h3>Select Size</h3>
              <div className="size-btn-group">
                {product.sizes.map(s => (
                  <button key={s} className={size === s ? 'size-btn active' : 'size-btn'} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="qty-selector">
            <h3>Quantity</h3>
            <div className="qty-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="detail-actions">
            <button className={`secondary-btn detail-btn ${addStatus === 'done' ? 'btn-success' : ''}`}
              onClick={handleAddToCart} disabled={addStatus === 'loading'}>
              {addStatus === 'loading' ? <span className="btn-spinner" /> : addStatus === 'done' ? '✓ Added!' : '🛒 Add to Cart'}
            </button>
            <button className="shop-now-btn detail-btn" onClick={handleShopNow} disabled={buyStatus === 'loading'}>
              {buyStatus === 'loading' ? <span className="btn-spinner" /> : '⚡ Buy Now'}
            </button>
          </div>

          <div className="trust-badges">
            <TrustBadge icon="🚚" text="Free Delivery" />
            <TrustBadge icon="↩" text="Easy Returns" />
            <TrustBadge icon="🔒" text="Secure Payment" />
            <TrustBadge icon="✅" text="Genuine Product" />
          </div>
        </div>
      </div>

      {/* ── Reviews section ── */}
      <section className="reviews-section" id="reviews">
        <div className="reviews-inner">
          <h2 className="reviews-heading">Ratings &amp; Reviews</h2>

          {/* Summary */}
          <div className="reviews-summary">
            <div className="rating-big-box">
              <span className="rating-big-num">{rating}</span>
              <Stars rating={rating} size="lg" />
              <span className="rating-big-sub">{reviewCount.toLocaleString()} ratings</span>
            </div>

            <div className="rating-bars">
              {dist.map(({ n, count }) => (
                <RatingBar key={n} label={n} value={count} total={reviews.length} />
              ))}
            </div>
          </div>

          {/* Write a review */}
          <div className="write-review-box">
            <h3>Write a Review</h3>
            {!user ? (
              <p className="review-login-prompt">
                <button className="review-login-btn" onClick={() => navigate('/login')}>Log in</button> to share your experience
              </p>
            ) : (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="review-field">
                  <label>Your Rating <span className="req">*</span></label>
                  <div className="star-picker">
                    <Stars rating={reviewForm.rating} size="lg" interactive onRate={r => setReviewForm(f => ({ ...f, rating: r }))} />
                    {reviewForm.rating > 0 && (
                      <span className="star-picker-label">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="review-field">
                  <label>Review Title</label>
                  <input
                    type="text"
                    placeholder="Summarise your experience"
                    value={reviewForm.title}
                    maxLength={80}
                    onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="review-field">
                  <label>Review <span className="req">*</span></label>
                  <textarea
                    rows={4}
                    placeholder="What did you like or dislike? How was the quality?"
                    value={reviewForm.body}
                    maxLength={1000}
                    onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                  />
                  <span className="char-count">{reviewForm.body.length}/1000</span>
                </div>
                {reviewError && <p className="error-text">{reviewError}</p>}
                <button type="submit" className="submit-review-btn" disabled={submitStatus === 'loading'}>
                  {submitStatus === 'loading' ? <><span className="btn-spinner" /> Submitting…</> : submitStatus === 'done' ? '✓ Submitted!' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Review cards */}
          <div className="review-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <span className="no-reviews-icon">💬</span>
                <p>No reviews yet — be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((r, i) => (
                <div className="review-card" key={r._id || i}>
                  <div className="review-card-header">
                    <div className="reviewer-avatar">{(r.username || 'U').slice(0, 1).toUpperCase()}</div>
                    <div className="reviewer-meta">
                      <span className="reviewer-name">{r.username}</span>
                      {r.verified && <span className="verified-badge">✓ Verified Purchase</span>}
                      {r.createdAt && (
                        <span className="review-date">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="review-stars-inline">
                      <Stars rating={r.rating} size="sm" />
                    </div>
                  </div>
                  {r.title && <p className="review-title">{r.title}</p>}
                  <p className="review-body">{r.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <RelatedProducts productId={id} />
    </>
  );
};

export default ProductDetail;
