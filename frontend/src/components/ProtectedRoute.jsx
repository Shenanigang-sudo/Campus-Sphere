import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getAuthData } from '../services/auth';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const { role } = getAuthData();

  if (!isAuth) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // eslint-disable-next-line react/prop-types
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Role not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
