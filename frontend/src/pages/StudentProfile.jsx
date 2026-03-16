import { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { FiUser, FiMail, FiBook, FiAward, FiBookmark, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    course: '',
    academic_year_start: '',
    academic_year_end: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, bookmarksRes] = await Promise.all([
        api.get('/students/me'),
        api.get('/students/bookmarks')
      ]);
      setProfile(profileRes.data);
      setBookmarks(bookmarksRes.data);
      setEditFormData({
        name: profileRes.data.name,
        course: profileRes.data.course,
        academic_year_start: profileRes.data.academic_year_start,
        academic_year_end: profileRes.data.academic_year_end
      });
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkToggle = async (eventId) => {
    try {
      await api.delete(`/students/bookmarks/${eventId}`);
      // Remove from local state
      setBookmarks(prev => prev.filter(b => b.id !== eventId));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        ...editFormData,
        academic_year_start: parseInt(editFormData.academic_year_start),
        academic_year_end: parseInt(editFormData.academic_year_end),
      };
      
      const res = await api.put('/students/me', payload);
      setProfile(res.data);
      setShowEditModal(false);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 container">
      {/* Profile Header */}
      <div className="glass-card p-8 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-primary/20 shrink-0 border-4 border-white dark:border-dark-800 z-10">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        <div className="text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            <button 
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors font-medium self-center md:self-auto"
            >
              <FiEdit2 /> Edit Profile
            </button>
          </div>
          <p className="text-primary font-medium mb-4">@{profile.username}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-800 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
              <FiMail className="text-primary" /> {profile.email}
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-800 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
              <FiBook className="text-primary" /> {profile.course}
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-800 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
              <FiAward className="text-primary" /> Class of {profile.academic_year_end}
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Events Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-border pb-4">
          <FiBookmark className="text-primary" /> My Saved Events
        </h2>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showBookmarkBtn={true}
                isBookmarked={true}
                onBookmark={handleBookmarkToggle}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center border-dashed border-2 border-border/50">
            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookmark className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Saved Events</h3>
            <p className="text-gray-500 mb-6">You haven't bookmarked any upcoming events yet. Discover what's happening on campus!</p>
            <a href="/" className="inline-block bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-m hover:shadow-lg shadow-primary/20">
              Browse Events
            </a>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !formLoading && setShowEditModal(false)}></div>
          
          <div className="relative bg-white dark:bg-dark-900 w-full max-w-lg rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in-95 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <button onClick={() => !formLoading && setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX className="text-xl" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input type="text" name="name" required value={editFormData.name} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Course Details</label>
                <input type="text" name="course" required value={editFormData.course} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Year</label>
                  <input type="number" name="academic_year_start" required value={editFormData.academic_year_start} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Graduation Year</label>
                  <input type="number" name="academic_year_end" required value={editFormData.academic_year_end} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 rounded-xl border border-border text-gray-700 dark:text-gray-300 font-medium" disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-medium shadow-md shadow-primary/20 flex items-center gap-2" disabled={formLoading}>
                  {formLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FiCheck />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
