import { Link } from 'react-router-dom';
import { Search, List, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: Search,     title: 'Discover',     desc: 'Search millions of movies and series via TMDB' },
  { icon: List,       title: 'Track',        desc: 'Manage your watchlist, currently watching, and completed' },
  { icon: Star,       title: 'Rate',         desc: 'Give personal ratings to everything you watch' },
  { icon: TrendingUp, title: 'Your Stats',   desc: 'See how many titles you\'ve tracked across categories' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-fade-in">
      {/* Hero */}
      <div className="mb-16">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-cinema-500 bg-cinema-500/10 px-3 py-1 rounded-full mb-4">
          Your personal cinema tracker
        </span>
        <h1 className="text-5xl sm:text-6xl font-display font-bold leading-tight mb-4">
          Track Every{' '}
          <span className="text-cinema-500">Frame</span>{' '}
          of Your Journey
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
          Discover, track, rate, and organize every movie and series you've watched or want to watch.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn-ghost">Sign In</Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-cinema-500/10 rounded-xl flex items-center justify-center mb-4">
              <Icon className="text-cinema-500" size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
