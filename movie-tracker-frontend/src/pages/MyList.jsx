import { useState } from 'react';
import { List, Plus, Eye, CheckCircle, XCircle, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserContent } from '../hooks/useUserContent.js';
import MovieCard from '../components/ui/MovieCard.jsx';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';

const TABS = [
  { key: '',          label: 'All',       Icon: LayoutGrid },
  { key: 'watchlist', label: 'Watchlist', Icon: Plus },
  { key: 'watching',  label: 'Watching',  Icon: Eye },
  { key: 'completed', label: 'Completed', Icon: CheckCircle },
  { key: 'dropped',   label: 'Dropped',   Icon: XCircle },
];

const MyList = () => {
  const [activeTab, setActiveTab] = useState('');
  const { list, loading, updateEntry, removeEntry } = useUserContent(activeTab);

  const stats = {
    watchlist: list.filter(i => i.status === 'watchlist').length,
    watching:  list.filter(i => i.status === 'watching').length,
    completed: list.filter(i => i.status === 'completed').length,
    dropped:   list.filter(i => i.status === 'dropped').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <List className="text-cinema-500" size={28} />
            My List
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {list.length} title{list.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Link to="/search" className="btn-primary text-sm">+ Discover More</Link>
      </div>

      {/* Stats row */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-up">
          {[
            { label: 'Watchlist', count: stats.watchlist, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Watching',  count: stats.watching,  color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Completed', count: stats.completed, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Dropped',   count: stats.dropped,   color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`card p-4 flex items-center gap-3 ${bg}`}>
              <span className={`text-2xl font-display font-bold ${color}`}>{count}</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${activeTab === key
                ? 'bg-cinema-500 text-white shadow-md shadow-cinema-500/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {list.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              mode="list"
              onUpdate={updateEntry}
              onRemove={removeEntry}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-400 animate-fade-in">
          <div className="text-5xl mb-3">🎞️</div>
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm mt-1 mb-4">
            {activeTab ? `No titles with status "${activeTab}"` : 'Your list is empty'}
          </p>
          <Link to="/search" className="btn-primary text-sm">Discover titles</Link>
        </div>
      )}
    </div>
  );
};

export default MyList;
