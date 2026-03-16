import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAuthData, isAuthenticated, clearAuthData } from '../services/auth';
import { FiCalendar, FiLogOut, FiUser, FiHome, FiGrid } from 'react-icons/fi';
import GooeyNav from './ReactBits/GooeyNav';

const Navbar = () => {
  const isAuth = isAuthenticated();
  const { role } = getAuthData();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    clearAuthData();
    navigate('/');
  };

  // Define navigation items for GooeyNav based on role
  const navItems = [
    { label: 'Home', href: '/', onClick: (e) => { e.preventDefault(); navigate('/'); } }
  ];

  if (isAuth) {
    if (role === 'student') {
      navItems.push({ label: 'Profile', href: '/profile', onClick: (e) => { e.preventDefault(); navigate('/profile'); } });
    } else if (role === 'organizer') {
      navItems.push({ label: 'Dashboard', href: '/dashboard', onClick: (e) => { e.preventDefault(); navigate('/dashboard'); } });
    }
  }

  // Determine initial active index based on current path
  const getInitialActiveIndex = () => {
    const index = navItems.findIndex(item => item.href === location.pathname);
    return index !== -1 ? index : 0;
  };

  const NavLink = ({ to, icon, label, isActive }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 text-primary font-semibold' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-800 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
                .brand-serif { font-family: 'Playfair Display', serif; letter-spacing: 0.1em; }
              `}
            </style>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 brand-serif uppercase tracking-widest">
              CAMPUS SPHERE
            </span>
          </Link>

          {/* Desktop Navigation using GooeyNav */}
          <div className="hidden md:flex items-center gap-2">
            <GooeyNav 
              items={navItems} 
              initialActiveIndex={getInitialActiveIndex()} 
            />
            
            {!isAuth ? (
              <div className="flex items-center gap-3 ml-4 border-l border-border/50 pl-4">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-dark-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl font-medium bg-primary text-white hover:bg-primary-600 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border/50">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors ml-2"
                  title="Logout"
                >
                  <FiLogOut />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
