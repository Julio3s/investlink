import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageSquare, LayoutDashboard, LogOut, User, Briefcase, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => setNotifications(r.data.filter(n => !n.is_read))).catch(() => {});
    }
  }, [user, location.pathname]);

  const unread = notifications.length;

  return (
    <nav className="site-nav" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10, 13, 20, 0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: '70px',
    }}>
      <div className="container nav-shell">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-mark">I</div>
          <span className="nav-brand-text">
            Invest<span className="gradient-text">Link</span>
          </span>
        </Link>

        <div className="nav-actions">
          <Link to="/projects" className="btn btn-ghost btn-sm nav-icon-btn" title="Explorer">
            <Search size={15} />
            <span className="nav-user-label mobile-hide">Explorer</span>
          </Link>
          {user ? (
            <>
              {user.role === 'porteur' && (
                <Link to="/my-projects" className="btn btn-ghost btn-sm nav-icon-btn" title="Mes projets">
                  <Briefcase size={15} />
                  <span className="nav-user-label mobile-hide">Mes projets</span>
                </Link>
              )}
              <Link to="/messages" className="btn btn-ghost btn-sm nav-icon-btn" title="Messages">
                <MessageSquare size={15} />
              </Link>
              <Link to="/notifications" className="btn btn-ghost btn-sm nav-icon-btn" title="Notifications">
                <Bell size={15} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 16, height: 16,
                    background: '#ef4444',
                    borderRadius: '50%',
                    fontSize: 10, fontWeight: 700, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unread}</span>
                )}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-ghost btn-sm nav-icon-btn" title="Administration">
                  <LayoutDashboard size={15} />
                </Link>
              )}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ gap: 8 }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'white',
                    overflow: 'hidden',
                  }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (user.first_name?.[0] || 'U')}
                  </div>
                  <span className="nav-user-label">{user.first_name}</span>
                </button>
                {showMenu && (
                  <div className="nav-menu" onClick={() => setShowMenu(false)}>
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--text)', fontSize: 14, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--bg-3)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <User size={15} /> Mon profil
                    </Link>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--danger)', fontSize: 14, width: '100%', background: 'none', border: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
        ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
