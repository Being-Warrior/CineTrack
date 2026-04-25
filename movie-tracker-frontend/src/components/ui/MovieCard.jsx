import { useState } from 'react';
import { Star, Plus, Eye, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
  watchlist: { label: 'Watchlist', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Plus },
  watching:  { label: 'Watching',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Eye },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle },
  dropped:   { label: 'Dropped',   color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
};

const STATUSES = Object.keys(STATUS_CONFIG);

const MovieCard = ({ item, onAdd, onUpdate, onRemove, mode = 'search' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [rating, setRating] = useState(item.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  // item shape differs slightly between search result and user_content
  const title      = item.title;
  const year       = item.release_year;
  const poster     = item.poster_url;
  const overview   = item.overview;
  const tmdbRating = item.imdb_rating;
  const type       = item.content_type;
  const status     = item.status;
  const entryId    = item.id;

  const handleStatusSelect = (s) => {
    setShowMenu(false);
    if (mode === 'search') {
      onAdd(item, s);
    } else {
      onUpdate(entryId, s, rating || undefined);
    }
  };

  const handleRating = (r) => {
    setRating(r);
    if (mode === 'list') onUpdate(entryId, status, r);
  };

  return (
    <div className="card overflow-hidden group animate-scale-in flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {/* Type badge */}
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
          {type === 'series' ? 'Series' : 'Movie'}
        </span>

        {/* TMDB rating */}
        {tmdbRating && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold bg-black/60 text-yellow-400 px-2 py-0.5 rounded-md backdrop-blur-sm">
            ★ {tmdbRating}
          </span>
        )}

        {/* Status badge on list mode */}
        {status && (
          <div className={`absolute bottom-2 left-2 status-badge ${STATUS_CONFIG[status]?.color}`}>
            {STATUS_CONFIG[status]?.label}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2">{title}</h3>
          {year && <p className="text-xs text-zinc-400 mt-0.5">{year}</p>}
        </div>

        {overview && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{overview}</p>
        )}

        {/* Star rating — only on list mode */}
        {mode === 'list' && (
          <div className="flex gap-0.5 mt-1">
            {[1,2,3,4,5,6,7,8,9,10].map((r) => (
              <button
                key={r}
                onClick={() => handleRating(r)}
                onMouseEnter={() => setHoverRating(r)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-sm transition-colors ${
                  r <= (hoverRating || rating) ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-2 flex gap-2">
          {/* Status dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="w-full flex items-center justify-between gap-1 btn-primary text-xs py-2 px-3"
            >
              <span>{status ? STATUS_CONFIG[status]?.label : 'Add to List'}</span>
              <ChevronDown size={12} />
            </button>

            {showMenu && (
              <div className="absolute bottom-full mb-1 left-0 w-full card shadow-lg z-20 overflow-hidden">
                {STATUSES.map((s) => {
                  const Icon = STATUS_CONFIG[s].icon;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusSelect(s)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors
                        ${status === s ? 'text-cinema-500' : 'text-zinc-700 dark:text-zinc-300'}`}
                    >
                      <Icon size={13} />
                      {STATUS_CONFIG[s].label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remove button on list mode */}
          {mode === 'list' && (
            <button
              onClick={() => onRemove(entryId)}
              className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Remove"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
