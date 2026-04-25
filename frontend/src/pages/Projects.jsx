import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, Heart, TrendingUp, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SECTORS = ['Technologie', 'Agri-tech', 'Fintech', 'Santé', 'Éducation', 'Énergie', 'Commerce', 'Logistique', 'Immobilier', 'Autre'];

function ProjectCard({ project, onFavorite }) {
  const { user } = useAuth();
  const trustColor = project.trust_score > 66 ? 'var(--success)' : project.trust_score > 33 ? 'var(--gold)' : 'var(--danger)';
  const trustLabel = project.trust_score > 66 ? 'Élevé' : project.trust_score > 33 ? 'Moyen' : 'Faible';

  const statusColors = { brouillon: '#5a6278', publié: '#3b82f6', en_recherche: '#f59e0b', financé: '#10b981' };
  const statusLabels = { brouillon: 'Brouillon', publié: 'Publié', en_recherche: 'En recherche', financé: 'Financé' };

  return (
    <Link to={`/projects/${project.id}`} className="card glow-card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden', textDecoration: 'none' }}>
      <div style={{
        height: 160,
        background: project.image_url
          ? `url(${project.image_url}) center/cover`
          : 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-sector" style={{ fontSize: 11 }}>{project.sector || 'Général'}</span>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          {project.is_validated && (
            <span className="badge badge-verified" style={{ fontSize: 11 }}>✓ Validé</span>
          )}
          {user && user.role === 'investisseur' && (
            <button onClick={(e) => { e.preventDefault(); onFavorite(project.id); }} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: '4px 8px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              <Heart size={14} />
            </button>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
          <span style={{ background: statusColors[project.status] + '22', color: statusColors[project.status], border: `1px solid ${statusColors[project.status]}40`, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
            {statusLabels[project.status]}
          </span>
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{project.title}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {project.solution}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)' }}>
            <MapPin size={12} /> {project.country || 'N/A'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <TrendingUp size={12} style={{ color: trustColor }} />
            <span style={{ color: trustColor, fontWeight: 600 }}>Confiance {trustLabel}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {Number(project.amount_sought).toLocaleString('fr-FR')} €
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Recherché</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white',
            }}>
              {project.first_name?.[0]}
            </div>
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{project.first_name} {project.last_name?.[0]}.</div>
              {project.verification_status === 'verifie' && (
                <div style={{ fontSize: 11, color: 'var(--success)' }}>✓ Vérifié</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sector: '', country: '', status: '', sort: 'recent' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, ...filters };
      if (filters.status === '') delete params.status;
      const res = await api.get('/projects', { params });
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Erreur de chargement'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filters]);

  const handleFavorite = async (id) => {
    if (!user) return toast.error('Connectez-vous');
    try {
      const res = await api.post(`/projects/${id}/favorite`);
      toast.success(res.data.favorited ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch { toast.error('Erreur'); }
  };

  const displayed = search
    ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.sector?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title">Explorer les projets</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 8 }}>{total} projets disponibles</p>
        </div>

        {/* Search & Filters */}
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input className="input" placeholder="Rechercher un projet..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <div style={{ minWidth: 140 }}>
              <select className="input" value={filters.sector} onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))}>
                <option value="">Tous secteurs</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ minWidth: 140 }}>
              <select className="input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">Tous statuts</option>
                <option value="publié">Publié</option>
                <option value="en_recherche">En recherche</option>
                <option value="financé">Financé</option>
              </select>
            </div>
            <div style={{ minWidth: 140 }}>
              <select className="input" value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                <option value="recent">Plus récents</option>
                <option value="popular">Populaires</option>
                <option value="amount_desc">Montant ↓</option>
                <option value="amount_asc">Montant ↑</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card loading-pulse" style={{ height: 340 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)' }}>
            <Search size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p>Aucun projet trouvé</p>
          </div>
        ) : (
          <>
            <div className="grid-3">
              {displayed.map(p => <ProjectCard key={p.id} project={p} onFavorite={handleFavorite} />)}
            </div>

            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40 }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                <span style={{ color: 'var(--text-2)', fontSize: 14 }}>Page {page} / {pages}</span>
                <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
