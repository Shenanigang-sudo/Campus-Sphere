import { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import ImageUpload from '../components/ImageUpload';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiMail, FiMapPin, FiGlobe } from 'react-icons/fi';

const initialEventForm = {
  title: '',
  date: '',
  time: '',
  venue: '',
  poster_url: '',
  description: '',
  keywords: '', // We'll split this by comma before sending
  eligibility: '',
  ticket_rate: 'Free',
  duty_leave: false,
  certificates: false,
  activity_points: 0,
  rsvp_link: '',
  organizer_contact: ''
};

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(initialEventForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    club_name: '',
    description: '',
    location: '',
    logo_url: '',
    contact_number: '',
    website_url: '',
    social_links: ''
  });
  const [profileFormLoading, setProfileFormLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // First get profile to know which club this is
      const profileRes = await api.get('/students/me').catch(() => null); // Quick hack, auth handles it actually, let's just use token decode or fetch club from ID
      // Actually, since we don't have a /clubs/me endpoint, we'll fetch from JWT or update backend. 
      // For now, let's just pretend we know the club ID or we fetch all events and filter by our own club.
      // Wait, we need the club ID. In auth.py we included it in the token!
      const tokenStr = localStorage.getItem('token');
      if (tokenStr) {
        const payload = JSON.parse(atob(tokenStr.split('.')[1]));
        const clubId = payload.id;

        const [clubRes, eventsRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/events`)
        ]);

        setProfile(clubRes.data);
        setProfileFormData({
          club_name: clubRes.data.club_name || '',
          description: clubRes.data.description || '',
          location: clubRes.data.location || '',
          logo_url: clubRes.data.logo_url || '',
          contact_number: clubRes.data.contact_number || '',
          website_url: clubRes.data.website_url || '',
          social_links: clubRes.data.social_links || ''
        });
        setEvents(eventsRes.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openCreateModal = () => {
    setFormData(initialEventForm);
    setIsEditing(false);
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setFormData({
      ...event,
      keywords: event.keywords ? event.keywords.join(', ') : '',
      activity_points: event.activity_points || 0
    });
    setIsEditing(true);
    setEditId(event.id);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await api.delete(`/events/${eventId}`);
        setEvents(events.filter(e => e.id !== eventId));
      } catch (err) {
        alert("Failed to delete event");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      // Process form data before sending
      const payload = { ...formData };

      // Convert keywords string to array
      if (typeof payload.keywords === 'string') {
        payload.keywords = payload.keywords.split(',').map(k => k.trim()).filter(k => k);
      }

      // Ensure specific types
      payload.activity_points = parseInt(payload.activity_points) || 0;

      if (isEditing) {
        const res = await api.put(`/events/${editId}`, payload);
        setEvents(events.map(ev => ev.id === editId ? res.data : ev));
      } else {
        const res = await api.post('/events', payload);
        setEvents([res.data, ...events]); // Add to top
      }

      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save event. Please check the form.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData({
      ...profileFormData,
      [name]: value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileFormLoading(true);
    setProfileError('');
    try {
      const res = await api.put('/clubs/me', profileFormData);
      setProfile(res.data);
      setShowProfileModal(false);
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update club profile.');
    } finally {
      setProfileFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 container">
      {/* Dashboard Header */}
      <div className="glass-card p-8 mb-10 overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-dark-800 border border-border overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Club Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-400">
                  {profile?.club_name?.charAt(0) || 'C'}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Club Dashboard</h1>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors font-medium self-start md:self-auto"
                >
                  <FiEdit2 /> Edit Profile
                </button>
              </div>
              <p className="text-gray-500 text-lg font-medium mt-1">{profile?.club_name}</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1"
          >
            <FiPlus className="text-xl" /> Post New Event
          </button>
        </div>

        {/* Club Details Block */}
        {profile && (
          <div className="mt-8 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">About Club</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {profile.description || "No description provided."}
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact & Links</h3>
              {profile.email && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiMail className="text-primary shrink-0" /> {profile.email}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiMapPin className="text-primary shrink-0" /> {profile.location}
                </div>
              )}
              {profile.website_url && (
                <div className="flex items-center gap-2">
                  <FiGlobe className="text-primary shrink-0" />
                  <a 
                    href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className="text-primary hover:underline truncate"
                  >
                    {profile.website_url}
                  </a>
                </div>
              )}
              {profile.social_links && (
                <div className="flex items-center gap-2">
                  <span className="text-primary shrink-0 font-bold text-lg leading-none">@</span>
                  <a 
                    href={profile.social_links.startsWith('http') ? profile.social_links : `https://${profile.social_links}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className="text-primary hover:underline truncate"
                  >
                    Social Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-800 border-b border-border text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Event Details</th>
                <th className="p-4 font-semibold w-1/4">Date & Time</th>
                <th className="p-4 font-semibold w-32 text-center">Status</th>
                <th className="p-4 font-semibold w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.length > 0 ? (
                events.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-dark-800 overflow-hidden shrink-0 border border-border">
                          {event.poster_url ? (
                            <img src={event.poster_url} alt="poster" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">IMG</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{event.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{event.venue}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-300">{new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{event.time}</p>
                    </td>
                    <td className="p-4 text-center">
                      {new Date(event.date) >= new Date() ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-gray-400 rounded-full text-xs font-semibold">
                          Past
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500">
                    <p className="mb-4">No events posted yet.</p>
                    <button onClick={openCreateModal} className="text-primary hover:underline font-medium">Create your first event</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !formLoading && setShowModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-dark-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md px-8 py-5 border-b border-border flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => !formLoading && setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border pb-2">Basic Details</h3>

                  <div>
                    <label className="block text-sm font-medium mb-1">Event Title *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date (YYYY-MM-DD) *</label>
                      <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time (e.g., 10:00 AM) *</label>
                      <input type="text" name="time" required value={formData.time} onChange={handleInputChange} placeholder="10:00 AM - 02:00 PM" className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Venue / Location *</label>
                    <input type="text" name="venue" required value={formData.venue} onChange={handleInputChange} placeholder="Main Auditorium" className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"></textarea>
                  </div>
                </div>

                {/* Media & Links */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold border-b border-border pb-2">Media & Links</h3>

                  <ImageUpload
                    label="Event Poster Image"
                    value={formData.poster_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, poster_url: url }))}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-1">RSVP / Registration Link *</label>
                    <input type="text" name="rsvp_link" required value={formData.rsvp_link} onChange={handleInputChange} placeholder="https://forms.gle/..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Details *</label>
                    <input type="text" name="organizer_contact" required value={formData.organizer_contact} onChange={handleInputChange} placeholder="Phone number or specific email for this event" className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                {/* Categories & Perks */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold border-b border-border pb-2">Categories & Perks</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
                      <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="Tech, Workshop, AI" className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ticket Rate / Entry Fee</label>
                      <input type="text" name="ticket_rate" value={formData.ticket_rate} onChange={handleInputChange} placeholder="Free, $10, etc." className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Eligibility</label>
                    <input type="text" name="eligibility" value={formData.eligibility} onChange={handleInputChange} placeholder="Open to all, CS Students only, etc." className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-dark-800 p-4 rounded-xl border border-border">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="duty_leave" checked={formData.duty_leave} onChange={handleInputChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-sm font-medium">Duty Leave</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="certificates" checked={formData.certificates} onChange={handleInputChange} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-sm font-medium">Certificates</span>
                    </label>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-500">Activity Points</label>
                      <input type="number" name="activity_points" value={formData.activity_points} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Submit Footer */}
                <div className="pt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md py-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 rounded-xl border border-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <FiCheck />
                    )}
                    {isEditing ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !profileFormLoading && setShowProfileModal(false)}></div>
          
          <div className="relative bg-white dark:bg-dark-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in-95">
            <div className="sticky top-0 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md px-8 py-5 border-b border-border flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Club Profile</h2>
              <button onClick={() => !profileFormLoading && setShowProfileModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-8">
              {profileError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <ImageUpload
                  label="Club Logo"
                  value={profileFormData.logo_url}
                  onChange={(url) => setProfileFormData(prev => ({ ...prev, logo_url: url }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Club Name</label>
                    <input type="text" name="club_name" required value={profileFormData.club_name} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" name="location" required value={profileFormData.location} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" required rows="3" value={profileFormData.description} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Number</label>
                    <input type="text" name="contact_number" required value={profileFormData.contact_number} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website URL</label>
                    <input type="text" name="website_url" value={profileFormData.website_url} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Social Links</label>
                    <input type="text" name="social_links" value={profileFormData.social_links} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                  <button type="button" onClick={() => setShowProfileModal(false)} className="px-6 py-2.5 rounded-xl border border-border text-gray-700 dark:text-gray-300 font-medium" disabled={profileFormLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-medium shadow-md shadow-primary/20 flex items-center gap-2" disabled={profileFormLoading}>
                    {profileFormLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FiCheck />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
