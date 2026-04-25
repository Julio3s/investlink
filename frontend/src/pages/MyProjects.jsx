import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_COLOR = { brouillon: '#5a6278', publié: '#3b82f6', en_recherche: '#f59e0b', financé: '#10b981' };
const STATUS_LABEL = { brouillon: 'Brouillon', publié: 'Publié', en_recherche: 'En recherche', financé: 'Financé' };

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/projects/my').then(r => { setProjects(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Projet supprimé'); load(); } catch { toast.error('Erreur'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 className="section-title">Mes projets</h1>
            <p style={{ color: 'var(--text-2)', marginTop: 6 }}>{projects.length} projet(s) créé(s)</p>
          </div>
          <Link to="/projects/new" className="btn btn-primary"><Plus size={16} /> Nouveau projet</Link>
        </div>

        {loading ? <div className="card loading-pulse" style={{ height: 200 }} /> : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Aucun projet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>Créez votre premier projet pour trouver des investisseurs</p>
            <Link to="/projects/new" className="btn btn-primary"><Plus size={16} /> Créer un projet</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: p.image_url ? `url(${p.image_url}) center/cover` : 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {!p.image_url && '🚀'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 700 }}>{p.title}</h3>
                    <span style={{ background: STATUS_COLOR[p.status] + '20', color: STATUS_COLOR[p.status], borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                      {STATUS_LABEL[p.status]}
                    </span>
                    {p.is_validated && <span className="badge badge-verified" style={{ fontSize: 11 }}>✓ Validé</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {p.views_count} vues</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={12} /> {Number(p.amount_sought).toLocaleString('fr-FR')} €</span>
                    <span>{formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: fr })}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/projects/${p.id}`} className="btn btn-ghost btn-sm"><Eye size={14} /></Link>
                  <Link to={`/projects/${p.id}/edit`} className="btn btn-outline btn-sm"><Edit size={14} /></Link>
                  <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
