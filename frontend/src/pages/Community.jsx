import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquare, Search, Shield, Users } from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';

const ROLE_LABELS = {
  porteur: 'Porteur de projet',
  investisseur: 'Investisseur',
  admin: 'Administration',
};

const trustLabel = (score) => {
  if (score >= 70) return ['Eleve', 'var(--success)'];
  if (score >= 40) return ['Moyen', 'var(--gold)'];
  return ['Faible', 'var(--danger)'];
};

export default function Community() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [startingId, setStartingId] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (role) params.role = role;
      const res = await api.get('/auth/members', { params });
      setMembers(res.data);
    } catch {
      toast.error('Impossible de charger la communaute');
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadMembers();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, role]);

  const startConversation = async (member) => {
    setStartingId(member.id);
    try {
      const res = await api.post('/conversations', { recipient_id: member.id });
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de demarrer la conversation');
    } finally {
      setStartingId('');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Users size={22} style={{ color: 'var(--primary)' }} />
            <h1 className="section-title">Communaute</h1>
          </div>
          <p style={{ color: 'var(--text-2)' }}>
            Retrouvez les membres du site et lancez une discussion sans passer par une fiche projet.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 28 }}>
          <div className="project-filters">
            <div className="project-search-field">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  className="input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un membre..."
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
            <div className="project-filter-field">
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Tous les roles</option>
                <option value="porteur">Porteurs</option>
                <option value="investisseur">Investisseurs</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="projects-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card loading-pulse" style={{ height: 230 }} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <Users size={42} style={{ marginBottom: 14, opacity: 0.4 }} />
            <p>Aucun membre ne correspond a votre recherche.</p>
          </div>
        ) : (
          <div className="project-grid">
            {members.map((member) => {
              const [label, color] = trustLabel(member.trust_score || 0);

              return (
                <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar
                      src={member.avatar_url}
                      name={`${member.first_name || ''} ${member.last_name || ''}`}
                      size={56}
                      textStyle={{ fontSize: 20 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 17 }}>
                        {member.first_name} {member.last_name}
                      </div>
                      <div style={{ color: 'var(--text-2)', fontSize: 13 }}>
                        {ROLE_LABELS[member.role] || member.role}
                        {member.country ? ` · ${member.country}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {member.verification_status === 'verifie' && (
                      <span className="badge badge-verified">
                        <Shield size={11} /> Profil verifie
                      </span>
                    )}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}33`,
                      }}
                    >
                      Confiance {label}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, minHeight: 68 }}>
                    {member.bio || 'Ce membre n a pas encore ajoute de presentation.'}
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary mobile-full-width"
                    onClick={() => void startConversation(member)}
                    disabled={startingId === member.id}
                    style={{ marginTop: 'auto' }}
                  >
                    {startingId === member.id ? <span className="spinner" /> : <><MessageSquare size={16} /> Discuter</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
