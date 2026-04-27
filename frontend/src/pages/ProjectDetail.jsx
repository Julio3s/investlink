import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Download, Expand, Eye, FileText, Flag, MapPin, MessageSquare, Shield, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getFileUrl } from '../utils/fileUrl';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import CoverImage from '../components/common/CoverImage';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((r) => {
        setProject(r.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Projet introuvable');
      });
  }, [id]);

  const handleContact = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'investisseur') return toast.error('Seuls les investisseurs peuvent contacter les porteurs');

    setContacting(true);
    try {
      const res = await api.post('/conversations', { project_id: id, recipient_id: project.owner_id });
      toast.success('Conversation creee');
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setContacting(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Motif du signalement :');
    if (!reason) return;
    try {
      await api.post('/admin/reports', { reported_project_id: id, reason });
      toast.success('Signalement envoye');
    } catch {
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card loading-pulse" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <div className="container">
          <p>Projet introuvable</p>
        </div>
      </div>
    );
  }

  const trustColor = project.trust_score > 66 ? 'var(--success)' : project.trust_score > 33 ? 'var(--gold)' : 'var(--danger)';
  const trustLabel = project.trust_score > 66 ? 'Eleve' : project.trust_score > 33 ? 'Moyen' : 'Faible';
  const projectImageUrl = getFileUrl(project.image_url);

  return (
    <div className="page">
      <div className="container">
        <div className="responsive-two-col" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
              {project.image_url ? (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowImagePreview(true)}
                    style={{
                      width: '100%',
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      display: 'block',
                      cursor: 'zoom-in',
                    }}
                  >
                    <CoverImage
                      src={project.image_url}
                      alt={project.title}
                      style={{ width: '100%', height: 240 }}
                      imgStyle={{ width: '100%', height: 240, objectFit: 'cover' }}
                      fallback={
                        <div
                          style={{
                            height: 180,
                            background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(139,105,20,0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 48,
                          }}
                        >
                          Projet
                        </div>
                      }
                    />
                  </button>

                  <div
                    style={{
                      position: 'absolute',
                      right: 16,
                      bottom: 16,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setShowImagePreview(true)}
                      style={{
                        background: 'rgba(10, 13, 20, 0.78)',
                        color: 'white',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      <Expand size={14} /> Agrandir
                    </button>
                    <a
                      href={projectImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(10, 13, 20, 0.78)',
                        color: 'white',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      <Eye size={14} /> Ouvrir
                    </a>
                    <a
                      href={projectImageUrl}
                      download
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(10, 13, 20, 0.78)',
                        color: 'white',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      <Download size={14} /> Telecharger
                    </a>
                  </div>
                </div>
              ) : (
                <CoverImage
                  src={project.image_url}
                  alt={project.title}
                  style={{ width: '100%', height: 240 }}
                  imgStyle={{ width: '100%', height: 240, objectFit: 'cover' }}
                  fallback={
                    <div
                      style={{
                        height: 180,
                        background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(139,105,20,0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                      }}
                    >
                      Projet
                    </div>
                  }
                />
              )}

              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {project.sector && <span className="badge badge-sector">{project.sector}</span>}
                  {project.is_validated && <span className="badge badge-verified">Valide</span>}
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-3)' }}>
                    <Eye size={14} /> {project.views_count} vues
                  </span>
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>{project.title}</h1>
                <div style={{ display: 'flex', gap: 16, color: 'var(--text-3)', fontSize: 13, flexWrap: 'wrap' }}>
                  {project.country && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={13} /> {project.country}
                    </span>
                  )}
                  <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr })}</span>
                </div>
              </div>
            </div>

            {[
              { label: 'Probleme identifie', content: project.problem_description },
              { label: 'Solution proposee', content: project.solution },
              { label: 'Marche cible', content: project.target_market },
              { label: 'Modele economique', content: project.business_model },
            ].map(({ label, content }) => (
              <div key={label} className="card animate-in">
                <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>{label}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: 15 }}>{content}</p>
              </div>
            ))}

            {project.pitch_deck_url && (
              <div className="card animate-in">
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Pitch deck</h3>
                <a href={getFileUrl(project.pitch_deck_url)} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ gap: 8 }}>
                  <FileText size={16} /> Telecharger le pitch deck
                </a>
              </div>
            )}

            {project.updates?.length > 0 && (
              <div className="card animate-in">
                <button
                  onClick={() => setShowUpdates(!showUpdates)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  Mises a jour ({project.updates.length})
                  {showUpdates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {showUpdates && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {project.updates.map((update) => (
                      <div key={update.id} style={{ padding: 16, background: 'var(--bg-3)', borderRadius: 10, borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>{update.title}</div>
                        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{update.content}</p>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="project-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 90 }}>
            <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(139,105,20,0.05))', borderColor: 'rgba(212,168,83,0.2)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 8 }}>Montant recherche</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em' }}>
                {Number(project.amount_sought).toLocaleString('fr-FR')} {project.currency_code || 'USD'}
              </div>
              {user?.role === 'investisseur' && user.id !== project.owner_id && (
                <button className="btn btn-primary mobile-full-width" onClick={handleContact} disabled={contacting} style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                  {contacting ? <span className="spinner" /> : <><MessageSquare size={16} /> Je suis interesse</>}
                </button>
              )}
            </div>

            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>
                Porteur
              </h4>
              <Link to={`/members/${project.owner_id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar
                  src={project.avatar_url}
                  name={`${project.first_name || ''} ${project.last_name || ''}`}
                  size={48}
                  textStyle={{ fontSize: 18 }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {project.first_name} {project.last_name}
                  </div>
                  {project.verification_status === 'verifie' && (
                    <div className="badge badge-verified" style={{ marginTop: 4 }}>
                      <Shield size={10} /> Profil verifie
                    </div>
                  )}
                </div>
              </Link>
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

            {user && user.id !== project.owner_id && (
              <button className="btn btn-ghost btn-sm mobile-full-width" onClick={handleReport} style={{ color: 'var(--text-3)', justifyContent: 'center' }}>
                <Flag size={14} /> Signaler ce projet
              </button>
            )}
          </div>
        </div>
      </div>

      {showImagePreview && project.image_url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image du projet ${project.title}`}
          onClick={() => setShowImagePreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1600,
            background: 'rgba(4, 7, 13, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(1100px, 100%)',
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16 }}>{project.title}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={projectImageUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <Eye size={14} /> Ouvrir
                </a>
                <a href={projectImageUrl} download className="btn btn-outline btn-sm">
                  <Download size={14} /> Telecharger
                </a>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowImagePreview(false)}>
                  <X size={14} /> Fermer
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: 12,
                overflow: 'hidden',
              }}
            >
              <img
                src={projectImageUrl}
                alt={project.title}
                style={{
                  width: '100%',
                  maxHeight: '78vh',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.18)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
