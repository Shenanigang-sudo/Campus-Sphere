import { jwtDecode } from 'jwt-decode';

export const setAuthData = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export const getAuthData = () => {
  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
  };
};

export const isAuthenticated = () => {
  const { token } = getAuthData();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      clearAuthData();
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
