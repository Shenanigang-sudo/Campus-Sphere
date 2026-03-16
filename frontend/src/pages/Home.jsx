import { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import PixelTrail from '../components/ReactBits/PixelTrail';
import SpotlightCard from '../components/ReactBits/SpotlightCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { getAuthData, isAuthenticated } from '../services/auth';
import { Link } from 'react-router-dom';

const categories = ["All", "Tech", "Art", "Speaking", "Music", "Workshop", "Sports"];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const isAuth = isAuthenticated();
  const { role } = getAuthData();

  useEffect(() => {
    fetchEvents();
    fetchClubs();
    if (isAuth && role === 'student') {
      fetchBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, dateFrom, dateTo]); // Re-fetch when category or dates change

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/events';
      const params = {};

      if (searchQuery) params.q = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      if (Object.keys(params).length > 0) {
        endpoint = '/events/search';
      }

      const response = await api.get(endpoint, { params });
      
      // Sort newest events first (Assuming higher ID = newer, or use created_at if available)
      const sortedEvents = response.data.sort((a, b) => {
        if (b.created_at && a.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.id - a.id; 
      });
      
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      setClubs(response.data);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleBookmarkToggle = async (eventId) => {
    if (!isAuth || role !== 'student') return; // Only students can bookmark

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

  return (
    <div className="space-y-12 pb-12">

      {/* Hero Section with PixelTrail Background - Enlarged to 90vh */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden min-h-[90vh]" style={{ background: '#000000' }}>
        {/* PixelTrail fills the whole hero section */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <PixelTrail
            gridSize={30}
            trailSize={0.15}
            maxAge={500}
            interpolate={5}
            color="#1e40af"
          />
        </div>

        {/* Text content sits on top */}
        <div className="relative space-y-8 py-20 max-w-5xl" style={{ zIndex: 2, pointerEvents: 'none' }}>
          <h1 className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-2xl leading-tight tracking-tight">
            Discover Your Next
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              Campus Experience
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto drop-shadow-md">
            Find, Register and Bookmark for the best clubs and events happening around campus.
          </p>
        </div>
      </section>

      {/* Main Content Area in Container */}
      <div className="container mx-auto px-4 py-12 max-w-7xl space-y-12">
        {/* Search and Filter Section inside SpotlightCard */}
        <SpotlightCard className="p-6 md:p-8 max-w-4xl mx-auto !bg-white/50 dark:!bg-dark-800/50 !border-border shadow-lg" spotlightColor="rgba(34, 197, 94, 0.15)">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search for events, clubs, or keywords..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm text-gray-800 dark:text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                Search
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">From:</span>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm text-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">To:</span>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm text-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </form>

          <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide relative z-10">
            <FiFilter className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-500 font-medium shrink-0 mr-2">Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-white/50 dark:bg-dark-900/50 border-gray-200 dark:border-dark-700 text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:bg-primary/5'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SpotlightCard>

        {/* Clubs Horizontal Scroll */}
        {clubs.length > 0 && (
          <section className="py-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-2">
              Campus Clubs
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-4 pt-2 scrollbar-hide px-2">
              {clubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="flex flex-col items-center gap-3 min-w-[100px] group transition-transform hover:scale-105"
                >
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-800 border-2 border-transparent group-hover:border-primary/50 shadow-sm flex items-center justify-center overflow-hidden transition-all text-2xl font-bold text-gray-400">
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.club_name} className="w-full h-full object-cover" />
                    ) : (
                      club.club_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-2 max-w-[100px] group-hover:text-primary transition-colors">
                    {club.club_name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Events Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === 'All' && !searchQuery ? 'Upcoming Events' : 'Search Results'}
            </h2>
            <div className="text-sm text-gray-500">
              Showing {events.length} events
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-xl bg-gray-200 dark:bg-dark-800 animate-pulse border border-border"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
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
            <div className="text-center py-20 bg-white/50 dark:bg-dark-800/50 rounded-2xl border border-dashed border-border">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any events matching your search criteria. Try adjusting your filters or search terms.
              </p>
              {(searchQuery || selectedCategory !== 'All' || dateFrom || dateTo) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setDateFrom(''); setDateTo(''); }}
                  className="mt-6 text-primary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Footer Section */}
      <footer className="mt-12 mx-4 mb-4 rounded-2xl glass-card py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p className="font-medium">
          Made by Students, for Students ❤️<br />
          May your life prosper with DL's!
        </p>
      </footer>
    </div>
  );
};

export default Home;
