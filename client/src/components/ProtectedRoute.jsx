import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages that are for customers only — Admins should not access these
const CUSTOMER_ONLY_PATHS = ['/cart', '/checkout', '/profile', '/wishlist'];

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.usertype !== 'Admin') return <Navigate to="/" replace />;

  // Redirect Admin away from customer-only pages
  if (user.usertype === 'Admin' && CUSTOMER_ONLY_PATHS.includes(location.pathname)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
