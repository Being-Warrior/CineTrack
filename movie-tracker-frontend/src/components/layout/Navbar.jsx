import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, LayoutDashboard, LogOut, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
        ${location.pathname === to
          ? 'bg-cinema-500 text-white shadow-md shadow-cinema-500/30'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Film className="text-cinema-500" size={22} />
          <span className="font-display font-bold text-xl tracking-tight">CineTrack</span>
        </Link>

        {user && (
          <div className="hidden sm:flex items-center gap-1">
            {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <User size={14} className="text-cinema-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 text-sm">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
