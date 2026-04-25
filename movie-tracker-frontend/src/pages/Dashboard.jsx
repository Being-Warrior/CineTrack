import { useState, useEffect } from 'react';
import {
  PlusCircle, List, Newspaper, Star, Trash2,
  ChevronDown, ExternalLink, Loader2, Film,
  Tv, LayoutGrid, Eye, CheckCircle, XCircle, Plus,
} from 'lucide-react';
import { useContent } from '../hooks/useContent.js';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';

// ─── constants ───────────────────────────────────────────────────────────────
const GENRES = [
  'Action','Adventure','Animation','Comedy','Crime','Documentary',
  'Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Other',
];
const PLATFORMS = [
  'Netflix','Amazon Prime','Disney+','HBO Max','Apple TV+','Hulu',
  'YouTube','Hotstar','Sony LIV','ZEE5','Theater','DVD/Blu-ray','Other',
];
const STATUS_CONFIG = {
  watchlist: { label: 'Watchlist', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',   Icon: Plus },
  watching:  { label: 'Watching',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', Icon: Eye },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', Icon: CheckCircle },
  dropped:   { label: 'Dropped',   color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',         Icon: XCircle },
};

const EMPTY_FORM = {
  title: '', content_type: 'movie', release_year: '',
  genre: '', platform: '', status: 'watchlist',
  rating: '', overview: '', notes: '',
};

// ─── sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ label, count, color, bg }) => (
  <div className={`card p-4 flex items-center gap-3 ${bg}`}>
    <span className={`text-2xl font-display font-bold ${color}`}>{count}</span>
    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{label}</span>
  </div>
);

const ContentRow = ({ item, onUpdate, onDelete }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [editStatus, setEditStatus] = useState(item.status);
  const [editRating, setEditRating] = useState(item.rating || '');
  const cfg = STATUS_CONFIG[item.status];

  const save = () => {
    onUpdate(item.id, { status: editStatus, rating: editRating ? Number(editRating) : undefined });
    setShowEdit(false);
  };

  return (
    <div className="card p-3 flex gap-3 items-start animate-fade-in">
      {/* Poster / icon */}
      <div className="w-10 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
        {item.poster_url
          ? <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover rounded-lg" />
          : item.content_type === 'series'
            ? <Tv size={18} className="text-zinc-400" />
            : <Film size={18} className="text-zinc-400" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm leading-tight truncate">{item.title}</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {item.release_year && `${item.release_year} · `}
              {item.genre && `${item.genre} · `}
              {item.platform && item.platform}
            </p>
          </div>
          <span className={`status-badge shrink-0 ${cfg?.color}`}>{cfg?.label}</span>
        </div>

        {item.rating && (
          <p className="text-xs text-yellow-500 mt-1">{'★'.repeat(Math.round(item.rating / 2))} {item.rating}/10</p>
        )}
        {item.notes && (
          <p className="text-xs text-zinc-400 mt-1 italic line-clamp-1">"{item.notes}"</p>
        )}

        {/* Edit inline */}
        {showEdit && (
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="input-field py-1 text-xs flex-1 min-w-[110px]"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <input
              type="number" min="1" max="10"
              placeholder="Rating 1-10"
              value={editRating}
              onChange={(e) => setEditRating(e.target.value)}
              className="input-field py-1 text-xs w-24"
            />
            <button onClick={save} className="btn-primary py-1 px-3 text-xs">Save</button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={() => setShowEdit((p) => !p)}
          className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Edit"
        >
          <ChevronDown size={14} className={showEdit ? 'rotate-180' : ''} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const NewsCard = ({ article }) => (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="card p-3 flex gap-3 hover:shadow-md transition-shadow group animate-fade-in"
  >
    {article.image && (
      <img
        src={article.image}
        alt={article.title}
        className="w-16 h-16 object-cover rounded-lg shrink-0"
      />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-cinema-500 transition-colors">
        {article.title}
      </p>
      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{article.source?.name}</p>
      <p className="text-xs text-zinc-400">{new Date(article.publishedAt).toLocaleDateString()}</p>
    </div>
    <ExternalLink size={14} className="text-zinc-300 group-hover:text-cinema-500 shrink-0 mt-1 transition-colors" />
  </a>
);

// ─── main Dashboard ───────────────────────────────────────────────────────────
const TABS = [
  { key: '',          label: 'All',       Icon: LayoutGrid },
  { key: 'watchlist', label: 'Watchlist', Icon: Plus },
  { key: 'watching',  label: 'Watching',  Icon: Eye },
  { key: 'completed', label: 'Completed', Icon: CheckCircle },
  { key: 'dropped',   label: 'Dropped',   Icon: XCircle },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const { list, loading, addContent, updateContent, deleteContent } = useContent(activeTab);

  // Add form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // News state
  const [news, setNews]           = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsMsg, setNewsMsg]     = useState('');
  const [newsFetched, setNewsFetched] = useState(false);

  const fetchNews = async () => {
    setNewsLoading(true);
    setNewsFetched(true);
    try {
      const { data } = await api.get('/content/news');
      setNews(data.articles || []);
      setNewsMsg(data.message || '');
    } catch {
      setNewsMsg('Failed to fetch news');
    } finally {
      setNewsLoading(false);
    }
  };

  // Stats
  const stats = {
    watchlist: list.filter(i => i.status === 'watchlist').length,
    watching:  list.filter(i => i.status === 'watching').length,
    completed: list.filter(i => i.status === 'completed').length,
    dropped:   list.filter(i => i.status === 'dropped').length,
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      release_year: form.release_year ? Number(form.release_year) : undefined,
      rating:       form.rating       ? Number(form.rating)       : undefined,
    };
    const ok = await addContent(payload);
    if (ok) setForm(EMPTY_FORM);
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-3xl font-display font-bold">
          Welcome back, <span className="text-cinema-500">{user?.username}</span> 👋
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Track your cinematic journey all in one place
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Watchlist" count={stats.watchlist} color="text-blue-500"  bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard label="Watching"  count={stats.watching}  color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard label="Completed" count={stats.completed} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard label="Dropped"   count={stats.dropped}   color="text-red-500"   bg="bg-red-50 dark:bg-red-900/20" />
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_300px] gap-6">

        {/* ── LEFT: Add Form ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle size={18} className="text-cinema-500" />
            <h2 className="font-display font-semibold text-lg">Add Title</h2>
          </div>

          <form onSubmit={handleSubmit} className="card p-4 space-y-3">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium mb-1">Title *</label>
              <input
                type="text" name="title" value={form.title}
                onChange={handleFormChange} placeholder="e.g. Interstellar"
                className="input-field py-2 text-sm" required
              />
            </div>

            {/* Type + Status row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Type *</label>
                <select name="content_type" value={form.content_type} onChange={handleFormChange} className="input-field py-2 text-sm">
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleFormChange} className="input-field py-2 text-sm">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year + Rating row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Year</label>
                <input
                  type="number" name="release_year" value={form.release_year}
                  onChange={handleFormChange} placeholder="2024" min="1888" max="2099"
                  className="input-field py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Rating (1-10)</label>
                <input
                  type="number" name="rating" value={form.rating}
                  onChange={handleFormChange} placeholder="8" min="1" max="10"
                  className="input-field py-2 text-sm"
                />
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-xs font-medium mb-1">Genre</label>
              <select name="genre" value={form.genre} onChange={handleFormChange} className="input-field py-2 text-sm">
                <option value="">Select genre</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs font-medium mb-1">Where to Watch / Watched</label>
              <select name="platform" value={form.platform} onChange={handleFormChange} className="input-field py-2 text-sm">
                <option value="">Select platform</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Overview */}
            <div>
              <label className="block text-xs font-medium mb-1">Description (optional)</label>
              <textarea
                name="overview" value={form.overview}
                onChange={handleFormChange} placeholder="Short description..."
                rows={2} className="input-field py-2 text-sm resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium mb-1">Personal Notes (optional)</label>
              <textarea
                name="notes" value={form.notes}
                onChange={handleFormChange} placeholder="Your thoughts..."
                rows={2} className="input-field py-2 text-sm resize-none"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Add to My List'}
            </button>
          </form>
        </div>

        {/* ── MIDDLE: My List ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <List size={18} className="text-cinema-500" />
            <h2 className="font-display font-semibold text-lg">My List</h2>
            <span className="text-xs text-zinc-400 ml-auto">{list.length} titles</span>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all
                  ${activeTab === key
                    ? 'bg-cinema-500 text-white shadow-md shadow-cinema-500/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-3 flex gap-3 items-start">
                  <div className="w-10 h-14 skeleton rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-2.5 skeleton rounded w-1/2" />
                    <div className="h-2.5 skeleton rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : list.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((item) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  onUpdate={updateContent}
                  onDelete={deleteContent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-400">
              <div className="text-4xl mb-2">🎞️</div>
              <p className="font-medium text-sm">Nothing here yet</p>
              <p className="text-xs mt-1">Add a title using the form on the left</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: News ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={18} className="text-cinema-500" />
            <h2 className="font-display font-semibold text-lg">Related News</h2>
          </div>

          {!newsFetched ? (
            <div className="card p-5 text-center">
              <div className="text-3xl mb-2">📰</div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                Get news related to your watchlist and watched titles
              </p>
              <button onClick={fetchNews} className="btn-primary text-sm w-full">
                Load News Feed
              </button>
            </div>
          ) : newsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-3 flex gap-3">
                  <div className="w-16 h-16 skeleton rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 skeleton rounded w-full" />
                    <div className="h-3 skeleton rounded w-4/5" />
                    <div className="h-2.5 skeleton rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-3">
              <button onClick={fetchNews} className="btn-ghost text-xs w-full py-1.5">
                ↻ Refresh
              </button>
              {news.map((article, i) => (
                <NewsCard key={i} article={article} />
              ))}
            </div>
          ) : (
            <div className="card p-5 text-center text-zinc-400">
              <p className="text-sm">{newsMsg || 'No news found for your titles'}</p>
              <button onClick={fetchNews} className="btn-ghost text-xs mt-3">Try Again</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
