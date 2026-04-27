import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Search,
  MessageSquare,
  Bell,
  Users,
  User,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';

const getItems = (user) => {
  if (!user) {
    return [
      { to: '/', label: 'Accueil', icon: Home },
      { to: '/projects', label: 'Explorer', icon: Search },
      { to: '/login', label: 'Connexion', icon: User },
      { to: '/register', label: 'Inscription', icon: User },
    ];
  }

  const items = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/projects', label: 'Explorer', icon: Search },
    { to: '/community', label: 'Communaute', icon: Users },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Alerts', icon: Bell },
    { to: '/profile', label: 'Profil', icon: User },
  ];

  if (user.role === 'porteur') items.push({ to: '/my-projects', label: 'Projets', icon: Briefcase });
  else if (user.role === 'admin') items.push({ to: '/admin', label: 'Admin', icon: LayoutDashboard });

  return items;
};

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const items = getItems(user);

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        <div className="mobile-bottom-nav__inner" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(({ to, label, icon: Icon }) => {
            const active =
              location.pathname === to ||
              (to !== '/' && location.pathname.startsWith(to));

            return (
              <Link
                key={to}
                to={to}
                className={`mobile-bottom-nav__item ${active ? 'is-active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="mobile-nav-spacer" />
    </>
  );
}
