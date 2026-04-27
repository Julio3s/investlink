import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Plus, Trash2, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../utils/api';
import CoverImage from '../components/common/CoverImage';

const STATUS_COLOR = { brouillon: '#5f5f68', publie: '#d4a853', 'publié': '#d4a853', en_recherche: '#c49b3f', finance: '#2ecc71', 'financé': '#2ecc71' };
const STATUS_LABEL = { brouillon: 'Brouillon', publie: 'Publie', 'publié': 'Publie', en_recherche: 'En recherche', finance: 'Finance', 'financé': 'Finance' };

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/projects/my').then((r) => {
      setProjects(r.data);
      setLoading(false);
    });

  useEffect(() => {
    void load();
  }, []);

  const del = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Projet supprime');
      void load();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="responsive-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 className="section-title">Mes projets</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 6 }}>{projects.length} projet(s) cree(s)</p>
          </div>
          <Link to="/projects/new" className="btn btn-primary">
            <Plus size={16} /> Nouveau projet
          </Link>
        </div>

        {loading ? (
          <div className="card loading-pulse" style={{ height: 200 }} />
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>Projet</div>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Aucun projet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>Creez votre premier projet pour trouver des investisseurs</p>
            <Link to="/projects/new" className="btn btn-primary">
              <Plus size={16} /> Creer un projet
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projects.map((project) => {
              const statusColor = STATUS_COLOR[project.status] || '#d4a853';
              const statusLabel = STATUS_LABEL[project.status] || project.status;

              return (
                <div key={project.id} className="card responsive-row" style={{ alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, rgba(212,168,83,0.2), rgba(139,105,20,0.15))' }}>
                    <CoverImage
                      src={project.image_url}
                      alt={project.title}
                      style={{ width: '100%', height: '100%' }}
                      imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      fallback={
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                          Img
                        </div>
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700 }}>{project.title}</h3>
                      <span style={{ background: `${statusColor}20`, color: statusColor, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                        {statusLabel}
                      </span>
                      {project.is_validated && <span className="badge badge-verified" style={{ fontSize: 11 }}>Valide</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} /> {project.views_count} vues
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TrendingUp size={12} /> {Number(project.amount_sought).toLocaleString('fr-FR')} {project.currency_code || 'USD'}
                      </span>
                      <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr })}</span>
                    </div>
                  </div>
                  <div className="responsive-row">
                    <Link to={`/projects/${project.id}`} className="btn btn-ghost btn-sm">
                      <Eye size={14} />
                    </Link>
                    <Link to={`/projects/${project.id}/edit`} className="btn btn-outline btn-sm">
                      <Edit size={14} />
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => void del(project.id)}>
                      <Trash2 size={14} />
                    </button>
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
