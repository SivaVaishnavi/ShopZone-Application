import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

/* Animated ShopEZ SVG Logo */
const ShopEZLogo = () => (
  <svg
    className="shopez-logo-svg"
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Shopping bag body */}
    <rect x="6" y="16" width="32" height="24" rx="4" fill="white" fillOpacity="0.18" stroke="white" strokeWidth="2" />
    {/* Bag handle */}
    <path d="M15 16 C15 10 29 10 29 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" className="logo-handle" />
    {/* Lightning bolt / EZ mark */}
    <path d="M24 22 L20 29 H24 L20 36" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="logo-bolt" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setMenuOpen(false);
    }
  };

  const wishlistCount = wishlistItems.length;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* ── LOGO ── */}
      <Link to="/" className="navbar-logo-wrap">
        <ShopEZLogo />
        <span className="navbar-logo-text">
          <span className="logo-shop">Shop</span>
          <span className="logo-ez">EZ</span>
        </span>
      </Link>

      {/* ── SEARCH ── */}
      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {/* ── DESKTOP LINKS ── */}
      <div className="navbar-links">
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'nav-active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Products
        </Link>

        {/* Wishlist — hidden on home page and only for logged-in non-Admin users */}
        {user && user.usertype !== 'Admin' && location.pathname !== '/' && (
          <Link to="/wishlist" className={`nav-link nav-wishlist ${isActive('/wishlist') ? 'nav-active' : ''}`}>
            <span className="nav-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlistCount > 0 ? '#f87171' : 'none'} stroke={wishlistCount > 0 ? '#f87171' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={wishlistCount > 0 ? 'heart-filled' : ''}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="nav-badge">{wishlistCount > 9 ? '9+' : wishlistCount}</span>
              )}
            </span>
            Wishlist
          </Link>
        )}

        {/* Cart — hidden for Admin */}
        {user && user.usertype !== 'Admin' && (
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'nav-active' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>
            Cart
          </Link>
        )}

        {user ? (
          <>
            {user.usertype === 'Admin' ? (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'nav-active' : ''}`}>
                <span className="user-avatar-mini">{user.username.slice(0, 1).toUpperCase()}</span>
                ⚙ Admin
              </Link>
            ) : (
              <Link to="/profile" className={`nav-link nav-user ${isActive('/profile') ? 'nav-active' : ''}`}>
                <span className="user-avatar-mini">{user.username.slice(0, 1).toUpperCase()}</span>
                {user.username}
              </Link>
            )}

            <button className="link-btn nav-logout" onClick={logout}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}
      </div>

      {/* ── MOBILE HAMBURGER ── */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span className={`ham-line ${menuOpen ? 'ham-open' : ''}`} />
        <span className={`ham-line ${menuOpen ? 'ham-open' : ''}`} />
        <span className={`ham-line ${menuOpen ? 'ham-open' : ''}`} />
      </button>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit">🔍</button>
          </form>

          <Link to="/products" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🛍 Products</Link>
          {user && user.usertype !== 'Admin' && location.pathname !== '/' && (
            <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              ♡ Wishlist {wishlistCount > 0 && <span className="mobile-badge">{wishlistCount}</span>}
            </Link>
          )}
          {user && user.usertype !== 'Admin' && (
            <Link to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🛒 Cart</Link>
          )}
          {user ? (
            <>
              {user.usertype === 'Admin' ? (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>⚙ Admin</Link>
              ) : (
                <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>👤 {user.username}</Link>
              )}
              <button className="mobile-nav-link mobile-logout" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link mobile-login" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
