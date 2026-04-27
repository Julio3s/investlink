import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Briefcase,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';

const getNavigation = (user) => {
  if (!user) {
    return {
      primary: [
        { to: '/', label: 'Accueil', icon: Home },
        { to: '/projects', label: 'Explorer', icon: Search },
        { to: '/login', label: 'Connexion', icon: User },
      ],
      secondary: [
        { to: '/register', label: 'Inscription', icon: User },
      ],
    };
  }

  const primary = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/projects', label: 'Explorer', icon: Search },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const secondary = [
    { to: '/community', label: 'Communaute', icon: Users },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profil', icon: User },
  ];

  if (user.role === 'porteur') secondary.push({ to: '/my-projects', label: 'Mes projets', icon: Briefcase });
  if (user.role === 'admin') secondary.push({ to: '/admin', label: 'Admin', icon: LayoutDashboard });

  return { primary, secondary };
};

export default function MobileBottomNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigation = useMemo(() => getNavigation(user), [user]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (to) =>
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <>
      {open && <button type="button" className="mobile-bottom-sheet__backdrop" onClick={() => setOpen(false)} aria-label="Fermer le menu mobile" />}

      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        <div className="mobile-bottom-nav__inner" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {navigation.primary.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-bottom-nav__item ${isActive(to) ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          <button
            type="button"
            className={`mobile-bottom-nav__item ${open ? 'is-active' : ''}`}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
            <span>Plus</span>
          </button>
        </div>
      </nav>

      <div className={`mobile-bottom-sheet ${open ? 'is-open' : ''}`}>
        <div className="mobile-bottom-sheet__handle" />
        <div className="mobile-bottom-sheet__content">
          {navigation.secondary.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-bottom-sheet__item ${isActive(to) ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          {user && (
            <button
              type="button"
              className="mobile-bottom-sheet__item is-danger"
              onClick={logout}
            >
              <LogOut size={18} />
              <span>Deconnexion</span>
            </button>
          )}
        </div>
      </div>

      <div className="mobile-nav-spacer" />
    </>
  );
}
