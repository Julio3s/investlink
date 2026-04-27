import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, MapPin, Search, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import CoverImage from '../components/common/CoverImage';

const SECTORS = ['Technologie', 'Agri-tech', 'Fintech', 'Sante', 'Santé', 'Education', 'Éducation', 'Energie', 'Énergie', 'Commerce', 'Logistique', 'Immobilier', 'Autre'];

function ProjectCard({ project, onFavorite }) {
  const { user } = useAuth();
  const trustColor = project.trust_score > 66 ? 'var(--success)' : project.trust_score > 33 ? 'var(--gold)' : 'var(--danger)';
  const trustLabel = project.trust_score > 66 ? 'Eleve' : project.trust_score > 33 ? 'Moyen' : 'Faible';

  const statusColors = { brouillon: '#5f5f68', publie: '#d4a853', 'publié': '#d4a853', en_recherche: '#c49b3f', finance: '#2ecc71', 'financé': '#2ecc71' };
  const statusLabels = { brouillon: 'Brouillon', publie: 'Publie', 'publié': 'Publie', en_recherche: 'En recherche', finance: 'Finance', 'financé': 'Finance' };
  const statusColor = statusColors[project.status] || '#d4a853';
  const statusLabel = statusLabels[project.status] || project.status;

  return (
    <Link to={`/projects/${project.id}`} className="card glow-card project-card">
      <div style={{ height: 160, backgroundColor: 'rgba(212,168,83,0.08)', position: 'relative', overflow: 'hidden' }}>
        <CoverImage
          src={project.image_url}
          alt={project.title}
          style={{ width: '100%', height: '100%' }}
          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          fallback={
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(139,105,20,0.1))',
              }}
            />
          }
        />

        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="badge badge-sector" style={{ fontSize: 11 }}>
            {project.sector || 'General'}
          </span>
        </div>

        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          {project.is_validated && (
            <span className="badge badge-verified" style={{ fontSize: 11 }}>
              Valide
            </span>
          )}
          {user?.role === 'investisseur' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavorite(project.id);
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: 8,
                padding: '4px 8px',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Heart size={14} />
            </button>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
          <span
            style={{
              background: `${statusColor}22`,
              color: statusColor,
              border: `1px solid ${statusColor}40`,
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="project-card-body">
        <h3 style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {project.title}
        </h3>
        <p
          style={{
            color: 'var(--text-2)',
            fontSize: 13,
            lineHeight: 1.6,
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
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

        <div className="project-card-footer">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {Number(project.amount_sought).toLocaleString('fr-FR')} EUR
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Recherche</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar
              src={project.avatar_url}
              name={`${project.first_name || ''} ${project.last_name || ''}`}
              size={32}
              textStyle={{ fontSize: 13 }}
            />
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>
                {project.first_name} {project.last_name?.[0]}.
              </div>
              {project.verification_status === 'verifie' && (
                <div style={{ fontSize: 11, color: 'var(--success)' }}>Verifie</div>
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
    } catch {
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [page, filters]);

  const handleFavorite = async (id) => {
    if (!user) return toast.error('Connectez-vous');
    try {
      const res = await api.post(`/projects/${id}/favorite`);
      toast.success(res.data.favorited ? 'Ajoute aux favoris' : 'Retire des favoris');
    } catch {
      toast.error('Erreur');
    }
  };

  const displayed = search
    ? projects.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.sector?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title">Explorer les projets</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 8 }}>{total} projets disponibles</p>
        </div>

        <div className="card" style={{ marginBottom: 32 }}>
          <div className="project-filters">
            <div className="project-search-field">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input className="input" placeholder="Rechercher un projet..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <div className="project-filter-field">
              <select className="input" value={filters.sector} onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}>
                <option value="">Tous secteurs</option>
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
            <div className="project-filter-field">
              <select className="input" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                <option value="">Tous statuts</option>
                <option value="publie">Publie</option>
                <option value="publié">Publie</option>
                <option value="en_recherche">En recherche</option>
                <option value="finance">Finance</option>
                <option value="financé">Finance</option>
              </select>
            </div>
            <div className="project-filter-field">
              <select className="input" value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
                <option value="recent">Plus recents</option>
                <option value="popular">Populaires</option>
                <option value="amount_desc">Montant desc</option>
                <option value="amount_asc">Montant asc</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="projects-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card loading-pulse" style={{ height: 340 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)' }}>
            <Search size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p>Aucun projet trouve</p>
          </div>
        ) : (
          <>
            <div className="project-grid">
              {displayed.map((project) => (
                <ProjectCard key={project.id} project={project} onFavorite={handleFavorite} />
              ))}
            </div>

            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40 }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ color: 'var(--text-2)', fontSize: 14 }}>
                  Page {page} / {pages}
                </span>
                <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
