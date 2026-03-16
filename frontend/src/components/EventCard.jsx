import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiBookmark } from 'react-icons/fi';
import { motion } from 'framer-motion';

// eslint-disable-next-line react/prop-types
const EventCard = ({ event, onBookmark, isBookmarked = false, showBookmarkBtn = false }) => {
  // Format dates
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card group flex flex-col h-full hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-dark-800">
        {event.poster_url ? (
          <img 
            src={event.poster_url} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
               // Fallback if image fails to load
               e.target.style.display = 'none';
               e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Placeholder if no image or image fails */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-700 dark:to-dark-800"
          style={{ display: event.poster_url ? 'none' : 'flex' }}
        >
          <FiCalendar className="text-4xl text-gray-400 dark:text-gray-500" />
        </div>

        {/* Categories/Tags Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {event.keywords && event.keywords.slice(0, 2).map((keyword, idx) => (
            <span key={idx} className="px-3 py-1 text-xs font-semibold bg-white/90 dark:bg-dark-900/90 text-gray-800 dark:text-gray-100 backdrop-blur-sm rounded-full shadow-sm">
              {keyword}
            </span>
          ))}
        </div>

        {/* Bookmark Action Overlay */}
        {showBookmarkBtn && (
           <button 
             onClick={(e) => {
               e.preventDefault();
               if(onBookmark) onBookmark(event.id);
             }}
             className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-dark-900/90 hover:bg-primary hover:text-white backdrop-blur-sm rounded-full shadow-sm transition-colors z-10 text-gray-600 dark:text-gray-300"
           >
             <FiBookmark className={isBookmarked ? 'fill-current text-primary' : ''} />
           </button>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        {/* Organizer Link */}
        <Link 
          to={`/clubs/${event.club_id}`}
          className="text-sm text-primary hover:underline font-medium mb-2 truncate"
        >
          {event.club_name}
        </Link>
        
        <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white">
          {event.title}
        </h3>
        
        <div className="space-y-2 mt-auto text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-primary/70 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="text-primary/70 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="text-primary/70 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 pt-0 mt-auto">
        <Link 
          to={`/events/${event.id}`} 
          className="block w-full py-2.5 text-center bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;
