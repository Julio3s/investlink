import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, MessageSquare, Shield, Briefcase, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ICON_MAP = {
  new_message: MessageSquare,
  new_conversation: MessageSquare,
  kyc_result: Shield,
  project_validated: Briefcase,
  account_action: AlertCircle,
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications').then(r => { setNotifs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await api.put('/notifications/all/read').catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('Tout marqué comme lu');
  };

  const markOne = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleClick = (n) => {
    markOne(n.id);
    if (n.reference_type === 'conversation') navigate(`/messages/${n.reference_id}`);
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 className="section-title">Notifications</h1>
            {unread > 0 && <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>{unread} non lue(s)</p>}
          </div>
          {unread > 0 && (
            <button className="btn btn-outline btn-sm" onClick={markAll}>
              <CheckCheck size={14}/> Tout marquer lu
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : notifs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p>Aucune notification pour l'instant</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifs.map(n => {
              const Icon = ICON_MAP[n.type] || Bell;
              const iconColors = {
                new_message: '#3b82f6', new_conversation: '#3b82f6',
                kyc_result: n.title.includes('✅') ? '#10b981' : '#ef4444',
                project_validated: '#10b981', account_action: '#f59e0b',
              };
              const color = iconColors[n.type] || 'var(--text-3)';

              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: '16px 20px',
                    background: n.is_read ? 'var(--bg-2)' : 'rgba(59,130,246,0.06)',
                    border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(59,130,246,0.2)'}`,
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    cursor: n.reference_type ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (n.reference_type) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = n.is_read ? 'var(--border)' : 'rgba(59,130,246,0.2)'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 15 }}>{n.title}</span>
                      {!n.is_read && <span className="unread-dot" style={{ flexShrink: 0, marginTop: 6 }} />}
                    </div>
                    <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 2 }}>{n.message}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
