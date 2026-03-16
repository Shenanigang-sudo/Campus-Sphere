import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiInfo, FiTag, FiAward, FiBookmark, FiX } from 'react-icons/fi';
import { getAuthData, isAuthenticated } from '../services/auth';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Bookmark state
  const isAuth = isAuthenticated();
  const { role } = getAuthData();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Poster Modal state
  const [showFullPoster, setShowFullPoster] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (isAuth && role === 'student') {
      checkBookmarkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (err) {
      setError('Event not found or failed to load.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await api.get('/students/me');
      if (response.data.bookmarked_events && response.data.bookmarked_events.includes(id)) {
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("Failed to check bookmark status", err);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuth || role !== 'student') return;
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await api.delete(`/students/bookmarks/${id}`);
        setIsBookmarked(false);
      } else {
        await api.post(`/students/bookmarks/${id}`);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{error}</h2>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 container">
      {/* Full Poster Modal */}
      {showFullPoster && event.poster_url && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
          onClick={() => setShowFullPoster(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setShowFullPoster(false); }}
          >
            <FiX className="text-2xl" />
          </button>
          <img 
            src={event.poster_url} 
            alt="Full Poster" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
          />
        </div>
      )}

      {/* Hero Section / Poster */}
      <div className="relative w-full h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden mb-8 shadow-2xl bg-gray-100 dark:bg-dark-800 group">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-700"
            onClick={() => setShowFullPoster(true)}
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10"
          style={{ display: event.poster_url ? 'none' : 'flex' }}
        >
          <FiCalendar className="text-6xl text-gray-400 opacity-50" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Link to={`/clubs/${event.club_id}`} className="text-primary-100 hover:text-white font-medium mb-2 text-sm uppercase tracking-wider block transition-colors">
                Presented by {event.club_name}
              </Link>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                {event.title}
              </h1>
            </div>

            {/* Booking/Save Actions placed on image */}
            <div className="flex gap-3">
              {isAuth && role === 'student' && (
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={`p-3 rounded-xl backdrop-blur-md transition-all ${isBookmarked
                      ? 'bg-primary text-white border border-primary/50'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  title={isBookmarked ? "Remove Bookmark" : "Save Event"}
                >
                  <FiBookmark className={isBookmarked ? 'fill-current text-xl' : 'text-xl'} />
                </button>
              )}
              {event.rsvp_link && (
                <a
                  href={event.rsvp_link.startsWith('http') ? event.rsvp_link : `https://${event.rsvp_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 whitespace-nowrap"
                >
                  Register Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content (Left, 2/3 width) */}
        <div className="lg:col-span-2 space-y-8">

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-4">
              <FiInfo className="text-primary" /> About Event
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {event.keywords?.map((keyword, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium border border-border">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Info (Right, 1/3 width) */}
        <div className="space-y-6">

          {/* Overview Card */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-bold border-b border-border pb-3">Event Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <FiCalendar className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Venue</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <FiTag className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Entry Fee</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{event.ticket_rate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perks & Eligibility Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xl font-bold border-b border-border pb-3">Requirements & Perks</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">Eligibility</p>
                <p className="font-medium text-gray-900 dark:text-white">{event.eligibility}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {event.certificates ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
                    <FiAward /> Certificates Provided
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-gray-400 rounded-full text-sm font-semibold">
                    No Certificates
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {event.duty_leave ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-semibold">
                    Duty Leave Provided
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-gray-400 rounded-full text-sm font-semibold">
                    No Duty Leave
                  </span>
                )}
              </div>

              {event.activity_points > 0 && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-semibold">
                    {event.activity_points} Activity Points
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Contact */}
          <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <FiUser className="text-primary" /> Need Help?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Contact the organizer for queries regarding this event.
            </p>
            <p className="font-semibold text-gray-900 dark:text-white break-words">
              {event.organizer_contact}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;
