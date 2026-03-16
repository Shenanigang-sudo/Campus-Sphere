import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { FiMapPin, FiGlobe, FiPhone, FiInfo, FiMail } from 'react-icons/fi';
import { getAuthData, isAuthenticated } from '../services/auth';

const ClubPage = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Bookmark state support for events list
  const isAuth = isAuthenticated();
  const { role } = getAuthData();
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    fetchClubData();
    if (isAuth && role === 'student') {
      fetchBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchClubData = async () => {
    setIsLoading(true);
    try {
      const clubRes = await api.get(`/clubs/${id}`);
      setClub(clubRes.data);

      const eventsRes = await api.get(`/clubs/${id}/events`);
      setEvents(eventsRes.data);
    } catch (err) {
      setError('Club not found or failed to load.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/students/me');
      if (response.data.bookmarked_events) {
        setBookmarkedIds(new Set(response.data.bookmarked_events));
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    }
  };

  const handleBookmarkToggle = async (eventId) => {
    if (!isAuth || role !== 'student') return;

    try {
      if (bookmarkedIds.has(eventId)) {
        await api.delete(`/students/bookmarks/${eventId}`);
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        await api.post(`/students/bookmarks/${eventId}`);
        setBookmarkedIds(prev => new Set(prev).add(eventId));
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 container">
      {/* Club Header Header */}
      <div className="glass-card overflow-hidden mb-12 relative">
        <div className="h-48 bg-gradient-to-r from-primary to-blue-500 w-full opacity-90"></div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-20">

          <div className="w-40 h-40 rounded-full border-4 border-white dark:border-dark-800 bg-white dark:bg-dark-900 overflow-hidden shadow-xl shrink-0">
            {club.logo_url ? (
              <img src={club.logo_url} alt={club.club_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex justify-center items-center bg-gray-100 dark:bg-dark-800 text-6xl text-gray-300 font-bold">
                {club.club_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-grow mt-4 md:mt-0 pt-16 md:pt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {club.club_name}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-border">
                <FiMapPin className="text-primary" /> {club.location}
              </div>

              {club.website_url && (
                <a href={club.website_url.startsWith('http') ? club.website_url : `https://${club.website_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-colors">
                  <FiGlobe className="text-primary" /> Website
                </a>
              )}

              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-border">
                <FiPhone className="text-primary" /> {club.contact_number}
              </div>
              
              {club.email && (
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-border">
                  <FiMail className="text-primary" /> {club.email}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-3">
              <FiInfo className="text-primary" /> About Us
            </h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
              {club.description}
            </p>

            {club.social_links && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Social Media</p>
                <a 
                  href={club.social_links.startsWith('http') ? club.social_links : `https://${club.social_links}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-medium break-all"
                >
                  {club.social_links}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Events Feed */}
        <div className="lg:col-span-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Events by {club.club_name} ({events.length})
          </h3>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  showBookmarkBtn={isAuth && role === 'student'}
                  isBookmarked={bookmarkedIds.has(event.id)}
                  onBookmark={handleBookmarkToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/50 dark:bg-dark-800/50 rounded-2xl border border-dashed border-border mb-8">
              <div className="text-5xl mb-4 opacity-50">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No upcoming events</h3>
              <p className="text-gray-500">This club hasn't posted any events yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubPage;
