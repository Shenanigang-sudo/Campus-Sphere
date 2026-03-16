import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { FiHome } from 'react-icons/fi';
import Galaxy from '../components/ReactBits/Galaxy';

const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'student';
  const [accountType, setAccountType] = useState(initialType);

  // Update URL structure if tabs change
  useEffect(() => {
    setSearchParams({ type: accountType }, { replace: true });
  }, [accountType, setSearchParams]);

  // Common fields + Student specific
  const [formData, setFormData] = useState({
    // Common
    username: '',
    email: '',
    password: '',
    // Student
    name: '',
    course: '',
    academic_year_start: new Date().getFullYear(),
    academic_year_end: new Date().getFullYear() + 4,
    // Organizer
    club_name: '',
    description: '',
    location: '',
    contact_number: '',
    website_url: '',
    social_links: '',
    logo_url: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = accountType === 'student' ? '/auth/register/student' : '/auth/register/club';

      // Filter payload based on type to prevent sending empty irrelevant fields to strict validators
      const payload = accountType === 'student' ? {
        name: formData.name,
        course: formData.course,
        academic_year_start: parseInt(formData.academic_year_start),
        academic_year_end: parseInt(formData.academic_year_end),
        username: formData.username,
        email: formData.email,
        password: formData.password
      } : {
        club_name: formData.club_name,
        description: formData.description,
        location: formData.location,
        contact_number: formData.contact_number,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        website_url: formData.website_url,
        social_links: formData.social_links,
        logo_url: formData.logo_url
      };

      await api.post(endpoint, payload);

      // Navigate to login after successful registration
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder-gray-400";
  const labelClass = "block text-sm font-medium mb-1.5 pl-1 text-gray-200 tracking-wide";

  return (
    <div className="flex min-h-screen relative bg-dark-900 overflow-hidden text-white font-sans w-full">
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

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 w-full max-w-3xl mx-auto pointer-events-none py-20">
        {/* Liquid Glass Card */}
        <div className="w-full p-8 sm:p-10 relative overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2.5rem] pointer-events-auto max-h-[90vh] overflow-y-auto no-scrollbar">

          <h2 className="text-3xl font-bold text-center mb-2 text-white tracking-wide">
            Create Account
          </h2>
          <p className="text-center text-gray-300 mb-8 text-sm font-medium tracking-wide">Join campus sphere</p>

          {/* Account Type Toggle */}
          <div className="flex p-1 mb-8 bg-black/30 rounded-xl border border-white/10">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all tracking-wide ${accountType === 'student' ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => setAccountType('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all tracking-wide ${accountType === 'organizer' ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => setAccountType('organizer')}
            >
              Organizer (Club)
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-8 text-sm text-center backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div className="w-full h-px bg-white/10 my-8"></div>

            {/* Student Fields */}
            {accountType === 'student' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    required={accountType === 'student'}
                  />
                </div>
                <div>
                  <label className={labelClass}>Course (e.g. B.Tech CS)</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className={inputClass}
                    required={accountType === 'student'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Start Year</label>
                    <input
                      type="number"
                      name="academic_year_start"
                      value={formData.academic_year_start}
                      onChange={handleChange}
                      className={inputClass}
                      required={accountType === 'student'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Graduation Year</label>
                    <input
                      type="number"
                      name="academic_year_end"
                      value={formData.academic_year_end}
                      onChange={handleChange}
                      className={inputClass}
                      required={accountType === 'student'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organizer Fields */}
            {accountType === 'organizer' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Club Name</label>
                    <input
                      type="text"
                      name="club_name"
                      value={formData.club_name}
                      onChange={handleChange}
                      className={inputClass}
                      required={accountType === 'organizer'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className={inputClass}
                      required={accountType === 'organizer'}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Location / Department</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    required={accountType === 'organizer'}
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`${inputClass} resize-none`}
                    required={accountType === 'organizer'}
                  ></textarea>
                </div>

                {/* Adding a div around ImageUpload to give it a dark/glass container context if needed */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20">
                  <ImageUpload
                    label="Club Logo"
                    value={formData.logo_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Website URL (Optional)</label>
                    <input
                      type="url"
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Social Links (Optional)</label>
                    <input
                      type="text"
                      name="social_links"
                      value={formData.social_links}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Instagram handle etc."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white font-bold tracking-wide rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : `Sign Up as ${accountType === 'student' ? 'Student' : 'Organizer'}`}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-300 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
