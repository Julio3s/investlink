import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Briefcase, Shield, AlertTriangle, CheckCircle, XCircle, Eye, UserX, UserCheck, BarChart2, Activity, Monitor, Globe, Clock3 } from 'lucide-react';

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionsSummary, setSessionsSummary] = useState(null);
  const [trafficHistory, setTrafficHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const r = await api.get('/admin/dashboard');
        setStats(r.data);
      } else if (tab === 'users') {
        const r = await api.get('/admin/users');
        setUsers(r.data);
      } else if (tab === 'kyc') {
        const r = await api.get('/kyc/pending');
        setKyc(r.data);
      } else if (tab === 'reports') {
        const r = await api.get('/admin/reports');
        setReports(r.data);
      } else if (tab === 'traffic') {
        const [sessionsRes, historyRes] = await Promise.all([
          api.get('/admin/sessions?limit=50'),
          api.get('/admin/traffic-history?limit=100'),
        ]);
        setSessions(sessionsRes.data.sessions || []);
        setSessionsSummary(sessionsRes.data.summary || null);
        setTrafficHistory(historyRes.data || []);
      }
    } catch {
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  };

  const validateKyc = async (userId, action, reason = '') => {
    try {
      await api.post(`/kyc/${userId}/validate`, { action, reason });
      toast.success(action === 'approve' ? 'KYC approuvé' : 'KYC rejeté');
      loadData();
    } catch {
      toast.error('Erreur');
    }
  };

  const suspendUser = async (userId, suspend) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`, { suspend, reason: suspend ? 'Suspension par un administrateur' : '' });
      toast.success(suspend ? 'Utilisateur suspendu' : 'Utilisateur réactivé');
      loadData();
    } catch {
      toast.error('Erreur');
    }
  };

  const resolveReport = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status, admin_note: 'Traité par admin' });
      toast.success('Signalement traité');
      loadData();
    } catch {
      toast.error('Erreur');
    }
  };

  const TABS = [
    ['dashboard', <BarChart2 size={15} />, 'Tableau de bord'],
    ['users', <Users size={15} />, 'Utilisateurs'],
    ['kyc', <Shield size={15} />, 'KYC'],
    ['reports', <AlertTriangle size={15} />, 'Signalements'],
    ['traffic', <Activity size={15} />, 'Trafic'],
  ];

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#d4a853,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} style={{ color: 'white' }} />
          </div>
          <h1 className="section-title">Administration</h1>
        </div>

        <div className="responsive-row" style={{ marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {TABS.map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-ghost'}`}>{icon} {label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="animate-in">
            {tab === 'dashboard' && stats ? (
              <div>
                <div className="responsive-stats-5" style={{ marginBottom: 32 }}>
                  {[
                    { label: 'Utilisateurs', value: stats.total_users, icon: Users, color: '#d4a853' },
                    { label: 'Projets', value: stats.total_projects, icon: Briefcase, color: '#8b6914' },
                    { label: 'KYC en attente', value: stats.pending_kyc, icon: Shield, color: '#c49b3f' },
                    { label: 'Signalements', value: stats.open_reports, icon: AlertTriangle, color: '#e74c3c' },
                    { label: 'Conversations', value: stats.total_conversations, icon: BarChart2, color: '#2ecc71' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card" style={{ textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color }}><Icon size={18} /></div>
                      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="responsive-stats-4" style={{ marginBottom: 32 }}>
                  {[
                    { label: 'Sessions', value: stats.total_sessions, icon: Activity, color: '#d4a853' },
                    { label: 'Visiteurs 24 h', value: stats.active_visitors_24h, icon: Globe, color: '#c49b3f' },
                    { label: 'Sessions connectées', value: stats.authenticated_sessions, icon: Monitor, color: '#8b6914' },
                    { label: 'Appareils distincts', value: stats.unique_devices, icon: Clock3, color: '#2ecc71' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card" style={{ textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color }}><Icon size={18} /></div>
                      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {tab === 'traffic' ? (
              <div className="responsive-stack">
                <div className="responsive-stats-4" style={{ marginBottom: 24 }}>
                  {[
                    { label: 'Sessions', value: sessionsSummary?.total_sessions || 0, icon: Activity, color: '#d4a853' },
                    { label: 'IP distinctes', value: sessionsSummary?.unique_ips || 0, icon: Globe, color: '#c49b3f' },
                    { label: 'Sessions authentifiées', value: sessionsSummary?.authenticated_sessions || 0, icon: Shield, color: '#8b6914' },
                    { label: 'Actives sur 24 h', value: sessionsSummary?.active_last_24h || 0, icon: Clock3, color: '#2ecc71' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card" style={{ textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color }}><Icon size={18} /></div>
                      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Sessions actives et récentes</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Visiteur', 'ID navigateur', 'Appareil', 'IP', 'Sessions', 'Dernière page', 'Dernière activité'].map((h) => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700 }}>{session.visitor_name}</div>
                              <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{session.user_email || 'Visiteur non identifié'}</div>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{session.visitor_id || '—'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{session.device_name || 'Appareil inconnu'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{session.ip_address || '—'}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>{session.request_count}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{session.last_path || '/'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{new Date(session.last_seen_at).toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Historique détaillé du trafic</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Date', 'Visiteur', 'Route', 'Méthode', 'Statut', 'IP', 'Appareil'].map((h) => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {trafficHistory.map((entry) => (
                          <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{new Date(entry.created_at).toLocaleString('fr-FR')}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700 }}>{entry.visitor_name}</div>
                              <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{entry.user_email || entry.visitor_id || 'Anonyme'}</div>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{entry.path}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>{entry.method}</td>
                            <td style={{ padding: '12px 16px', color: entry.status_code >= 400 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>{entry.status_code}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{entry.ip_address || '—'}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{entry.device_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'users' ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Utilisateur', 'Email', 'Rôle', 'Vérification', 'Score', 'Statut', 'Actions'].map((h) => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.first_name} {u.last_name}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: 13 }}>{u.email}</td>
                          <td style={{ padding: '12px 16px' }}><span className="badge badge-sector">{u.role}</span></td>
                          <td style={{ padding: '12px 16px' }}>
                            {u.verification_status === 'verifie' ? <span className="badge badge-verified"><CheckCircle size={11} /> Vérifié</span> : u.verification_status === 'en_attente' ? <span className="badge badge-pending"><Eye size={11} /> En attente</span> : <span className="badge badge-rejected"><XCircle size={11} /> Non vérifié</span>}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.trust_score}/100</td>
                          <td style={{ padding: '12px 16px' }}>{u.is_suspended ? <span style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 600 }}>Suspendu</span> : <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>Actif</span>}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => suspendUser(u.id, !u.is_suspended)} className={`btn btn-sm ${u.is_suspended ? 'btn-outline' : 'btn-danger'}`}>
                              {u.is_suspended ? <><UserCheck size={13} /> Réactiver</> : <><UserX size={13} /> Suspendre</>}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {tab === 'kyc' ? (
              <div className="responsive-stack">
                {kyc.length === 0 ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: 48 }}><Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>Aucune vérification en attente</p></div> : kyc.map((k) => (
                  <div key={k.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{k.first_name} {k.last_name}</div>
                        <div style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 12 }}>{k.email} · {k.role}</div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {k.id_document_url ? <a href={k.id_document_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Eye size={13} /> Pièce d'identité</a> : null}
                          {k.selfie_url ? <a href={k.selfie_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Eye size={13} /> Selfie</a> : null}
                        </div>
                      </div>
                      <div className="responsive-row">
                        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }} onClick={() => validateKyc(k.user_id, 'approve')}><CheckCircle size={14} /> Approuver</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { const reason = prompt('Raison du rejet :'); if (reason !== null) validateKyc(k.user_id, 'reject', reason); }}><XCircle size={14} /> Rejeter</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'reports' ? (
              <div className="responsive-stack">
                {reports.length === 0 ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: 48 }}><AlertTriangle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>Aucun signalement ouvert</p></div> : reports.map((r) => (
                  <div key={r.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}><span style={{ color: 'var(--text-2)' }}>Par :</span> {r.reporter_first} {r.reporter_last}{r.reported_first ? <> → <span style={{ color: 'var(--danger)' }}>{r.reported_first} {r.reported_last}</span></> : null}</div>
                        <div style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 4 }}>{r.reason}</div>
                        <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="responsive-row">
                        <button className="btn btn-outline btn-sm" onClick={() => resolveReport(r.id, 'traité')}>Traité</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => resolveReport(r.id, 'fermé')}>Fermer</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
