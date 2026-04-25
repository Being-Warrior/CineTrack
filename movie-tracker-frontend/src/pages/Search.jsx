import { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { useUserContent } from '../hooks/useUserContent.js';
import MovieCard from '../components/ui/MovieCard.jsx';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const { addOrUpdate } = useUserContent();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/content/search?query=${encodeURIComponent(query)}`);
      setResults(data);
      if (!data.length) toast('No results found', { icon: '🔍' });
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero search */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-display font-bold mb-2">Discover Movies & Series</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Search from millions of titles powered by TMDB</p>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Inception, Breaking Bad..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" disabled={searching} className="btn-primary px-6">
            {searching ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Results grid */}
      {searching && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!searching && results.length > 0 && (
        <>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{results.length} results for "{query}"</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((item) => (
              <MovieCard
                key={item.tmdb_id}
                item={item}
                mode="search"
                onAdd={(tmdbData, status) => addOrUpdate(tmdbData, status)}
              />
            ))}
          </div>
        </>
      )}

      {!searching && searched && results.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          <div className="text-5xl mb-3">🎬</div>
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try a different title or keyword</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-20 text-zinc-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">Start searching</p>
          <p className="text-sm mt-1">Type a movie or series name above</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
