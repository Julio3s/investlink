import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, Upload } from 'lucide-react';

const SECTORS = ['Technologie', 'Agri-tech', 'Fintech', 'Santé', 'Éducation', 'Énergie', 'Commerce', 'Logistique', 'Immobilier', 'Autre'];
const CURRENCIES = ['USD', 'EUR', 'XOF', 'GBP', 'CAD'];

export default function CreateProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    problem_description: '',
    solution: '',
    target_market: '',
    business_model: '',
    amount_sought: '',
    currency_code: 'USD',
    sector: '',
    country: '',
    status: 'brouillon',
  });
  const [files, setFiles] = useState({ pitch_deck: null, project_image: null });

  useEffect(() => {
    if (isEdit) {
      api.get(`/projects/${id}`).then((r) => {
        const p = r.data;
        setForm({
          title: p.title,
          problem_description: p.problem_description,
          solution: p.solution,
          target_market: p.target_market,
          business_model: p.business_model,
          amount_sought: p.amount_sought,
          currency_code: p.currency_code || 'USD',
          sector: p.sector || '',
          country: p.country || '',
          status: p.status,
        });
      });
    }
  }, [id, isEdit]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (files.pitch_deck) data.append('pitch_deck', files.pitch_deck);
      if (files.project_image) data.append('project_image', files.project_image);

      if (isEdit) {
        await api.put(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      toast.success(isEdit ? 'Projet mis à jour' : 'Projet créé avec succès');
      navigate('/my-projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 780 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title">{isEdit ? 'Modifier le projet' : 'Nouveau projet'}</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 8 }}>Renseignez les informations de votre dossier.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Informations générales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Titre du projet *</label>
                <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: AgroConnect — Plateforme B2B pour agriculteurs" required />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Secteur</label>
                  <select className="input" value={form.sector} onChange={(e) => set('sector', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {SECTORS.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pays</label>
                  <select className="input" value={form.country} onChange={(e) => set('country', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {['Bénin', 'Sénégal', "Côte d'Ivoire", 'Mali', 'Burkina Faso', 'Togo', 'Niger', 'Cameroun', 'Ghana', 'Nigeria', 'France', 'Belgique', 'Canada', 'Autre'].map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Montant recherché *</label>
                  <input className="input" type="number" value={form.amount_sought} onChange={(e) => set('amount_sought', e.target.value)} placeholder="50000" required min="1000" />
                </div>
                <div className="form-group">
                  <label>Devise *</label>
                  <select className="input" value={form.currency_code} onChange={(e) => set('currency_code', e.target.value)}>
                    {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Statut</label>
                  <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                    <option value="brouillon">Brouillon</option>
                    <option value="publié">Publié</option>
                    <option value="en_recherche">En recherche de financement</option>
                    <option value="financé">Financé</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Description du projet</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'problem_description', label: 'Problème identifié *', placeholder: 'Quel problème résolvez-vous ?' },
                { key: 'solution', label: 'Solution proposée *', placeholder: 'Comment résolvez-vous ce problème ?' },
                { key: 'target_market', label: 'Marché cible *', placeholder: 'À qui s’adresse votre solution ?' },
                { key: 'business_model', label: 'Modèle économique *', placeholder: 'Comment allez-vous générer des revenus ?' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <textarea className="input" value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} required style={{ minHeight: 100 }} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Médias</h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Pitch Deck (PDF)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--bg-3)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 14, color: 'var(--text-2)' }}>
                  <Upload size={16} />
                  {files.pitch_deck ? files.pitch_deck.name : 'Choisir un PDF'}
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setFiles((current) => ({ ...current, pitch_deck: e.target.files[0] }))} />
                </label>
              </div>
              <div className="form-group">
                <label>Image du projet</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--bg-3)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 14, color: 'var(--text-2)' }}>
                  <Upload size={16} />
                  {files.project_image ? files.project_image.name : 'Choisir une image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFiles((current) => ({ ...current, project_image: e.target.files[0] }))} />
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/my-projects')}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={16} /> {isEdit ? 'Enregistrer' : 'Créer le projet'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
