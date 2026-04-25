import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MapPin, Eye, Heart, MessageSquare, Shield, TrendingUp, FileText, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => { setProject(r.data); setLoading(false); }).catch(() => { setLoading(false); toast.error('Projet introuvable'); });
  }, [id]);

  const handleContact = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'investisseur') return toast.error('Seuls les investisseurs peuvent contacter les porteurs');
    setContacting(true);
    try {
      const res = await api.post('/conversations', { project_id: id, recipient_id: project.owner_id });
      toast.success('Conversation créée !');
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setContacting(false); }
  };

  const handleReport = async () => {
    const reason = prompt('Motif du signalement :');
    if (!reason) return;
    try {
      await api.post('/admin/reports', { reported_project_id: id, reason });
      toast.success('Signalement envoyé');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="page"><div className="container"><div className="card loading-pulse" style={{ height: 400 }} /></div></div>;
  if (!project) return <div className="page"><div className="container"><p>Projet introuvable</p></div></div>;

  const trustColor = project.trust_score > 66 ? 'var(--success)' : project.trust_score > 33 ? 'var(--gold)' : 'var(--danger)';
  const trustLabel = project.trust_score > 66 ? 'Élevé' : project.trust_score > 33 ? 'Moyen' : 'Faible';

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
              {project.image_url ? (
                <img src={project.image_url} alt="" style={{ width: '100%', height: 240, objectFit: 'cover' }} />
              ) : (
                <div style={{ height: 180, background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🚀</div>
              )}
              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {project.sector && <span className="badge badge-sector">{project.sector}</span>}
                  {project.is_validated && <span className="badge badge-verified">✓ Validé</span>}
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-3)' }}>
                    <Eye size={14} /> {project.views_count} vues
                  </span>
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>{project.title}</h1>
                <div style={{ display: 'flex', gap: 16, color: 'var(--text-3)', fontSize: 13 }}>
                  {project.country && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {project.country}</span>}
                  <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr })}</span>
                </div>
              </div>
            </div>

            {/* Sections */}
            {[
              { label: '🎯 Problème identifié', content: project.problem_description },
              { label: '💡 Solution proposée', content: project.solution },
              { label: '🏪 Marché cible', content: project.target_market },
              { label: '📊 Modèle économique', content: project.business_model },
            ].map(({ label, content }) => (
              <div key={label} className="card animate-in">
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>{label}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: 15 }}>{content}</p>
              </div>
            ))}

            {/* Pitch deck */}
            {project.pitch_deck_url && (
              <div className="card animate-in">
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📄 Pitch Deck</h3>
                <a href={project.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ gap: 8 }}>
                  <FileText size={16} /> Télécharger le pitch deck
                </a>
              </div>
            )}

            {/* Updates */}
            {project.updates?.length > 0 && (
              <div className="card animate-in">
                <button onClick={() => setShowUpdates(!showUpdates)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                  📈 Mises à jour ({project.updates.length})
                  {showUpdates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {showUpdates && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {project.updates.map(u => (
                      <div key={u.id} style={{ padding: 16, background: 'var(--bg-3)', borderRadius: 10, borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>{u.title}</div>
                        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{u.content}</p>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: fr })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 90 }}>
            {/* Amount */}
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))', borderColor: 'rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 8 }}>Montant recherché</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>
                {Number(project.amount_sought).toLocaleString('fr-FR')} €
              </div>
              {user && user.role === 'investisseur' && user.id !== project.owner_id && (
                <button className="btn btn-primary" onClick={handleContact} disabled={contacting} style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                  {contacting ? <span className="spinner" /> : <><MessageSquare size={16} /> Je suis intéressé</>}
                </button>
              )}
            </div>

            {/* Owner */}
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Porteur</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {project.avatar_url ? <img src={project.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : project.first_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{project.first_name} {project.last_name}</div>
                  {project.verification_status === 'verifie' && <div className="badge badge-verified" style={{ marginTop: 4 }}><Shield size={10} /> Profil vérifié</div>}
                </div>
              </div>
              {project.bio && <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6 }}>{project.bio}</p>}
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-3)', borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Score de confiance</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${project.trust_score}%`, background: trustColor, borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ color: trustColor, fontWeight: 600, fontSize: 13 }}>{trustLabel}</span>
                </div>
              </div>
            </div>

            {/* Report */}
            {user && user.id !== project.owner_id && (
              <button className="btn btn-ghost btn-sm" onClick={handleReport} style={{ color: 'var(--text-3)', justifyContent: 'center' }}>
                <Flag size={14} /> Signaler ce projet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
