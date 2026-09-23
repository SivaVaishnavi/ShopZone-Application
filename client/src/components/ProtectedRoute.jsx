import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.usertype !== 'Admin') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
