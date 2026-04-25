import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Shield, Upload, CheckCircle, Clock, XCircle, Star } from 'lucide-react';

const TRUST_LABEL = (s) => s >= 70 ? ['Élevé','var(--success)'] : s >= 40 ? ['Moyen','var(--gold)'] : ['Faible','var(--danger)'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ first_name: user?.first_name||'', last_name: user?.last_name||'', phone: user?.phone||'', country: user?.country||'', bio: user?.bio||'' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [kycFiles, setKycFiles] = useState({ id_document: null, selfie: null });
  const [kycSending, setKycSending] = useState(false);

  useEffect(() => {
    api.get('/kyc/status').then(r => setKycStatus(r.data)).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      toast.success('Profil mis à jour !');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    setSaving(false);
  };

  const submitKYC = async (e) => {
    e.preventDefault();
    if (!kycFiles.id_document || !kycFiles.selfie) return toast.error('Veuillez fournir les deux documents');
    setKycSending(true);
    try {
      const fd = new FormData();
      fd.append('id_document', kycFiles.id_document);
      fd.append('selfie', kycFiles.selfie);
      await api.post('/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documents soumis pour vérification !');
      api.get('/kyc/status').then(r => setKycStatus(r.data));
      await refreshUser();
    } catch { toast.error('Erreur lors de la soumission'); }
    setKycSending(false);
  };

  const [trustLabel, trustColor] = TRUST_LABEL(user?.trust_score || 0);

  const KycBadge = () => {
    const s = kycStatus?.status;
    if (!s || s === 'non_soumis') return <span className="badge badge-rejected"><XCircle size={12}/> Non soumis</span>;
    if (s === 'en_attente') return <span className="badge badge-pending"><Clock size={12}/> En attente</span>;
    if (s === 'verifie') return <span className="badge badge-verified"><CheckCircle size={12}/> Vérifié</span>;
    return <span className="badge badge-rejected"><XCircle size={12}/> Rejeté</span>;
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="section-title" style={{ marginBottom: 32 }}>Mon profil</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {[['profile', <User size={15}/>, 'Profil'], ['kyc', <Shield size={15}/>, 'Vérification']].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-ghost'}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="animate-in">
            {/* Trust score card */}
            <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                {user?.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.first_name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 8 }}>{user?.email} · {user?.role === 'porteur' ? 'Porteur de projet' : user?.role === 'investisseur' ? 'Investisseur' : 'Admin'}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <KycBadge />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} style={{ color: trustColor }} />
                    <span style={{ fontSize: 13, color: trustColor, fontWeight: 600 }}>Score: {user?.trust_score || 0}/100 ({trustLabel})</span>
                  </div>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-3)', borderRadius: 3, minWidth: 100, maxWidth: 180 }}>
                    <div style={{ height: '100%', width: `${user?.trust_score || 0}%`, background: trustColor, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 24 }}>Modifier mon profil</h3>
              <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label>Photo de profil</label>
                  <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} style={{ color: 'var(--text-2)', fontSize: 13 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label>Prénom</label><input className="input" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                  <div className="form-group"><label>Nom</label><input className="input" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label>Téléphone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="form-group"><label>Pays</label>
                    <select className="input" value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                      <option value="">Sélectionner</option>
                      {['France','Maroc','Sénégal','Côte d\'Ivoire','Tunisie','Algérie','Bénin','Cameroun','Canada','Belgique','Suisse','Autre'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Bio</label><textarea className="input" placeholder="Décrivez-vous en quelques mots..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} style={{ minHeight: 80 }} /></div>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? <span className="spinner" /> : 'Sauvegarder'}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === 'kyc' && (
          <div className="animate-in">
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Shield size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontWeight: 700 }}>Vérification d'identité</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Faites vérifier votre profil pour obtenir le badge de confiance</p>
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Statut actuel : <KycBadge /></div>
                {kycStatus?.rejection_reason && (
                  <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>Raison du rejet : {kycStatus.rejection_reason}</div>
                )}
              </div>

              {kycStatus?.status !== 'verifie' && (
                <form onSubmit={submitKYC} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Pièce d'identité (recto/verso)</label>
                      <div style={{ padding: '20px', border: '2px dashed var(--border-light)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-3)' }}>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setKycFiles({...kycFiles, id_document: e.target.files[0]})} style={{ display: 'none' }} id="id-upload" />
                        <label htmlFor="id-upload" style={{ cursor: 'pointer' }}>
                          <Upload size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                          <div style={{ fontSize: 13, color: kycFiles.id_document ? 'var(--success)' : 'var(--text-3)' }}>
                            {kycFiles.id_document ? kycFiles.id_document.name : 'Cliquez pour uploader'}
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Selfie (visage visible)</label>
                      <div style={{ padding: '20px', border: '2px dashed var(--border-light)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-3)' }}>
                        <input type="file" accept=".jpg,.jpeg,.png" onChange={e => setKycFiles({...kycFiles, selfie: e.target.files[0]})} style={{ display: 'none' }} id="selfie-upload" />
                        <label htmlFor="selfie-upload" style={{ cursor: 'pointer' }}>
                          <Upload size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                          <div style={{ fontSize: 13, color: kycFiles.selfie ? 'var(--success)' : 'var(--text-3)' }}>
                            {kycFiles.selfie ? kycFiles.selfie.name : 'Cliquez pour uploader'}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 16px', background: 'rgba(59,130,246,0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.1)' }}>
                    🔒 Vos documents sont traités de manière confidentielle et uniquement par nos équipes de validation.
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={kycSending} style={{ alignSelf: 'flex-start' }}>
                    {kycSending ? <span className="spinner" /> : <><Shield size={16} /> Soumettre pour vérification</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
