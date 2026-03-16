import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { setAuthData } from '../services/auth';
import { FiHome, FiCalendar } from 'react-icons/fi';
import Galaxy from '../components/ReactBits/Galaxy';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { access_token, role } = response.data;

      setAuthData(access_token, role);

      // Navigate to intended page or default dashboard
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (role === 'student') navigate('/profile');
        else if (role === 'organizer') navigate('/dashboard');
        else navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative bg-dark-900 overflow-hidden text-white font-sans w-full">
      {/* Background will be Galaxy component here eventually. For now, solid dark. */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Galaxy transparent={false} />
      </div>

      {/* Absolute Home Button */}
      <div className="absolute top-6 right-6 z-50">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white rounded-full transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
        >
          <FiHome className="text-lg" />
          <span className="font-semibold tracking-wide">Home</span>
        </Link>
      </div>

      {/* Left side: Website Name & Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative z-10 p-12 pointer-events-none">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
            .brand-serif { font-family: 'Playfair Display', serif; letter-spacing: 0.1em; }
          `}
        </style>
        <h1 className="text-6xl lg:text-8xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] text-center leading-tight brand-serif font-medium">
          CAMPUS <br/>
          SPHERE
        </h1>
      </div>

      {/* Right side: Login Card Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 w-full max-w-2xl lg:max-w-none mx-auto lg:mx-0 pointer-events-none">
        
        {/* The glass card with liquid effect matching the reference */}
        <div className="w-full max-w-md p-8 sm:p-10 relative overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl pointer-events-auto">

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-center mb-10 text-white tracking-wide">
              Login
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-6 text-sm text-center backdrop-blur-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-colors focus-within:bg-white/10 focus-within:border-white/30">
                  <span className="text-gray-300 mr-3">✉</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Email or Username"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-colors focus-within:bg-white/10 focus-within:border-white/30">
                  <span className="text-gray-300 mr-3">🔒</span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white font-medium tracking-wide rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-300 font-medium tracking-wide">
                Don't have an account?{' '}
                <Link to="/register?type=student" className="text-white hover:underline transition-all font-semibold">
                  Register
                </Link>
              </p>
              <div className="mt-2">
                <Link to="/register?type=organizer" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Or register as Organizer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
