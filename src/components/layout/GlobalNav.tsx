import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import logo from '../../assets/logo.png';
import { Home, LayoutDashboard, BookOpen, FlaskConical, LogOut } from 'lucide-react';

const navItems = [
  { path: '/home', label: 'Inicio', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/modules', label: 'Módulos', icon: BookOpen },
  { path: '/lab', label: 'Laboratorio', icon: FlaskConical },
];

export default function GlobalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Don't show nav on public pages
  const publicPaths = ['/', '/login', '/register'];
  if (publicPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-hextech-black/95 backdrop-blur-sm border-b border-hextech-gold/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 group"
          >
            <img 
              src={logo} 
              alt="Academia Challengers" 
              className="w-10 h-10 object-contain rounded-full group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-hextech-gold font-bold text-lg hidden sm:inline group-hover:text-hextech-gold-light transition-colors">
              Academia Challengers
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
                    flex items-center gap-2 group
                    ${isActive
                      ? 'bg-hextech-gold/10 text-hextech-gold border border-hextech-gold/20'
                      : 'text-gray-400 hover:text-hextech-gold hover:bg-hextech-gold/5'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-hextech-gold' : 'text-gray-500 group-hover:text-hextech-gold'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-400 text-sm hidden lg:block">
                {user.displayName || user.email}
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
