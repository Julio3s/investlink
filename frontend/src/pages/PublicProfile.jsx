import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, MessageSquare, Shield, Star } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import CoverImage from '../components/common/CoverImage';

const ROLE_LABELS = {
  porteur: 'Porteur de projet',
  investisseur: 'Investisseur',
  admin: 'Administration',
};

const getTrustMeta = (score) => {
  if (score >= 70) return ['Eleve', 'var(--success)'];
  if (score >= 40) return ['Moyen', 'var(--gold)'];
  return ['Faible', 'var(--danger)'];
};

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/auth/members/${id}`)
      .then((res) => setMember(res.data))
      .catch((err) => {
        setMember(null);
        toast.error(err.response?.data?.message || 'Profil introuvable');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const startConversation = async () => {
    if (!member) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id === member.id) {
      navigate('/profile');
      return;
    }

    setStartingConversation(true);
    try {
      const res = await api.post('/conversations', { recipient_id: member.id });
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de demarrer la conversation');
    } finally {
      setStartingConversation(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="card loading-pulse" style={{ height: 220, marginBottom: 24 }} />
          <div className="projects-skeleton">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card loading-pulse" style={{ height: 220 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="card" style={{ textAlign: 'center', padding: '72px 24px' }}>
            <h1 className="section-title" style={{ marginBottom: 12 }}>Profil introuvable</h1>
            <p style={{ color: 'var(--text-2)' }}>
              Ce membre n est plus disponible ou son profil n est pas accessible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSelf = user?.id === member.id;
  const [trustLabel, trustColor] = getTrustMeta(member.trust_score || 0);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 1100 }}>
        <div className="responsive-stack" style={{ gap: 24 }}>
          <div className="card responsive-two-col" style={{ gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.8fr)', alignItems: 'start' }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar
                src={member.avatar_url}
                name={`${member.first_name || ''} ${member.last_name || ''}`}
                size={88}
                textStyle={{ fontSize: 30 }}
              />

              <div style={{ flex: 1, minWidth: 220 }}>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  {member.first_name} {member.last_name}
                </h1>
                <div style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 14 }}>
                  {ROLE_LABELS[member.role] || member.role}
                  {member.country ? ` · ${member.country}` : ''}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
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
                      background: `${trustColor}20`,
                      color: trustColor,
                      border: `1px solid ${trustColor}33`,
                    }}
                  >
                    <Star size={11} /> Confiance {trustLabel}
                  </span>
                </div>

                <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: 15 }}>
                  {member.bio || 'Ce membre n a pas encore ajoute de presentation.'}
                </p>
              </div>
            </div>

            <div className="responsive-stack" style={{ gap: 16 }}>
              <div className="card" style={{ padding: 18, background: 'var(--bg-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Score de confiance</span>
                  <span style={{ fontWeight: 700, color: trustColor }}>
                    {member.trust_score || 0}/100
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${member.trust_score || 0}%`, height: '100%', background: trustColor, borderRadius: 999 }} />
                </div>
                <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
                  {member.project_count} projet{member.project_count > 1 ? 's' : ''} public{member.project_count > 1 ? 's' : ''}
                </div>
              </div>

              {isSelf ? (
                <Link to="/profile" className="btn btn-outline mobile-full-width">
                  Gerer mon profil
                </Link>
              ) : (
                <button type="button" className="btn btn-primary mobile-full-width" onClick={startConversation} disabled={startingConversation}>
                  {startingConversation ? <span className="spinner" /> : <><MessageSquare size={16} /> Envoyer un message</>}
                </button>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Briefcase size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>
                Projets publics
              </h2>
            </div>

            {member.projects?.length ? (
              <div className="project-grid">
                {member.projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="card project-card">
                    <CoverImage
                      src={project.image_url}
                      alt={project.title}
                      style={{ width: '100%', height: 180 }}
                      imgStyle={{ width: '100%', height: 180, objectFit: 'cover' }}
                      fallback={
                        <div
                          style={{
                            height: 180,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(212,168,83,0.16), rgba(46,204,113,0.12))',
                            fontWeight: 700,
                          }}
                        >
                          Projet
                        </div>
                      }
                    />
                    <div className="project-card-body">
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {project.sector && <span className="badge badge-sector">{project.sector}</span>}
                        {project.country && <span className="badge">{project.country}</span>}
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{project.title}</h3>
                      <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
                        {Number(project.amount_sought).toLocaleString('fr-FR')} {project.currency_code || 'USD'} recherches
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card" style={{ color: 'var(--text-3)', textAlign: 'center', padding: '48px 24px' }}>
                Aucun projet public a afficher pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
