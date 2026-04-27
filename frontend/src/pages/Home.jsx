import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  MessageSquare,
  Search,
  CheckCircle,
  Rocket,
  Briefcase,
  Sparkles,
  Users,
  Globe,
  Zap,
  Eye,
  Heart,
  PlusCircle,
  Wallet,
  FileText,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Vérification systématique',
    desc: "Chaque profil fait l'objet d'un contrôle d'identité rigoureux. Nous ne transigeons pas avec la sécurité de nos membres.",
    color: '#2ecc71',
  },
  {
    icon: TrendingUp,
    title: 'Évaluation continue',
    desc: "Notre indicateur de confiance reflète l'engagement et la fiabilité. Un baromètre objectif, mis à jour en permanence.",
    color: '#d4a853',
  },
  {
    icon: MessageSquare,
    title: 'Correspondance privée',
    desc: 'Un canal de communication direct, horodaté et archivé. Chaque échange compte, chaque accord laisse une trace.',
    color: '#8b6914',
  },
  {
    icon: Search,
    title: 'Recherche précise',
    desc: "Filtre par secteur d'activité, zone géographique ou volume de financement. Ne perds plus de temps sur des projets hors cible.",
    color: '#f59e0b',
  },
  {
    icon: CheckCircle,
    title: 'Sélection exigeante',
    desc: 'Nos équipes examinent chaque dossier avant publication. Seuls les projets documentés et cohérents sont retenus.',
    color: '#06b6d4',
  },
  {
    icon: Sparkles,
    title: 'Assistance algorithmique',
    desc: 'Notre intelligence artificielle identifie les correspondances pertinentes et signale les anomalies éventuelles. Un allié discret.',
    color: '#ec4899',
  },
];

const STATS = [
  { value: '500+', label: 'Projets accompagnés', icon: Globe },
  { value: '1 200+', label: 'Investisseurs référencés', icon: Users },
  { value: '98%', label: 'Projets financés avec succès', icon: Zap },
];

const PROJETS_RECOMMANDES = [
  {
    id: 'ecopulse',
    name: 'EcoPulse',
    sector: 'Greentech',
    amount: '250 000€',
    description: "Solution de supervision énergétique pour parcs immobiliers tertiaires. Déploiement en Europe de l'Ouest.",
    progress: 72,
    verified: true,
    interested: 18,
    gradient: 'linear-gradient(135deg, rgba(46,204,113,0.22), rgba(212,168,83,0.18))',
  },
  {
    id: 'medichain',
    name: 'MediChain',
    sector: 'HealthTech',
    amount: '1 200 000€',
    description: 'Infrastructure blockchain appliquée à la transmission de données médicales. Phase pilote en Afrique subsaharienne.',
    progress: 45,
    verified: true,
    interested: 31,
    gradient: 'linear-gradient(135deg, rgba(212,168,83,0.22), rgba(139,105,20,0.18))',
  },
  {
    id: 'flowpay',
    name: 'FlowPay',
    sector: 'Fintech',
    amount: '500 000€',
    description: 'Système de règlement interbancaire pour les petites et moyennes entreprises. Couverture multi-devises.',
    progress: 18,
    verified: false,
    interested: 9,
    gradient: 'linear-gradient(135deg, rgba(139,105,20,0.22), rgba(196,155,63,0.18))',
  },
  {
    id: 'deepfarm',
    name: 'DeepFarm',
    sector: 'AgriTech',
    amount: '800 000€',
    description: "Plateforme d'analyse prédictive pour l'agriculture en zone semi-aride. Algorithmes propriétaires.",
    progress: 91,
    verified: true,
    interested: 44,
    gradient: 'linear-gradient(135deg, rgba(212,168,83,0.2), rgba(46,204,113,0.22))',
  },
];

const ACTIVITE_RECENTE = [
  {
    icon: Heart,
    text: 'Sophie Laurent a ajouté EcoPulse à sa liste de projets à suivre.',
    time: 'Il y a deux heures',
    color: '#c49b3f',
  },
  {
    icon: MessageSquare,
    text: 'Marc Dubois vous a adressé un message concernant MediChain.',
    time: 'Il y a cinq heures',
    color: '#8b6914',
  },
  {
    icon: TrendingUp,
    text: 'Votre indice de confiance a progressé de cinq points.',
    time: 'Hier',
    color: '#2ecc71',
  },
  {
    icon: Eye,
    text: 'Douze investisseurs ont consulté le dossier MediChain.',
    time: 'Hier',
    color: '#d4a853',
  },
  {
    icon: Shield,
    text: 'Votre profil est désormais vérifié dans son intégralité.',
    time: 'Avant-hier',
    color: '#06b6d4',
  },
];

function HeroBackground() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(139,105,20,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

function HeroStats() {
  return (
    <div className="stats-row" style={{ marginTop: 48, alignItems: 'center' }}>
      {STATS.map(({ value, label, icon: Icon }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={18} style={{ color: '#f5d782' }} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="card glow-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}30`,
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <div>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

function DashboardStatCard({ icon: Icon, value, label, children }) {
  return (
    <div className="card glow-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: 'rgba(212,168,83,0.12)',
          border: '1px solid rgba(212,168,83,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} style={{ color: '#f5d782' }} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em' }}>{value}</div>
      <div style={{ color: 'var(--text-2)', fontSize: 14 }}>{label}</div>
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.first_name?.trim();
  const dashboardStats = user?.stats || {};

  return (
    <div>
      {user ? (
        <>
          <section style={{ padding: '32px 0 20px' }}>
            <div className="container">
              <div className="card animate-in" style={{ padding: 28 }}>
                <div className="responsive-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>
                      {firstName ? `Bonjour, ${firstName}` : 'Bonjour'}
                    </h1>
                    <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
                      Votre espace de travail. Suivez l&apos;évolution de vos projets et de vos échanges.
                    </p>
                  </div>
                </div>

                <div className="responsive-row" style={{ alignItems: 'stretch' }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={18}
                        style={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-3)',
                        }}
                      />
                      <input
                        className="input"
                        placeholder="Rechercher un projet, un secteur, un investisseur..."
                        style={{ minHeight: 48, borderRadius: 14, paddingLeft: 46 }}
                      />
                    </div>
                  </div>
                  <div className="responsive-row" style={{ minWidth: 280 }}>
                    <Link to="/projects/new" className="btn btn-primary mobile-full-width">
                      <PlusCircle size={16} /> Publier un projet
                    </Link>
                    <Link to="/projects" className="btn btn-outline mobile-full-width">
                      <Wallet size={16} /> Consulter mon portefeuille
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ padding: '12px 0 24px' }}>
            <div className="container">
              <div style={{ marginBottom: 20 }}>
                <h2 className="section-title" style={{ fontSize: 24 }}>Vue d&apos;ensemble</h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 16,
                }}
                className="responsive-stats-4"
              >
                <DashboardStatCard
                  icon={Eye}
                  value={dashboardStats.projetsVues || 0}
                  label="Consultations"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>
                    <TrendingUp size={14} /> +24% ce mois
                  </div>
                </DashboardStatCard>

                <DashboardStatCard
                  icon={MessageSquare}
                  value={dashboardStats.messages || 0}
                  label="Messages reçus"
                >
                  {(dashboardStats.messages || 0) > 0 ? (
                    <span
                      style={{
                        width: 'fit-content',
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.24)',
                        color: '#f87171',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      3 non lus
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Aucun message non lu</span>
                  )}
                </DashboardStatCard>

                <DashboardStatCard
                  icon={Heart}
                  value={dashboardStats.favoris || 0}
                  label="Projets suivis"
                >
                  <div style={{ color: 'var(--text-3)', fontSize: 12 }}>dans quatre secteurs</div>
                </DashboardStatCard>

                <DashboardStatCard
                  icon={TrendingUp}
                  value={`${dashboardStats.scoreConfiance || 0}%`}
                  label="Indice de confiance"
                >
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${dashboardStats.scoreConfiance || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #d4a853, #8b6914)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </DashboardStatCard>
              </div>
            </div>
          </section>

          <section style={{ padding: '24px 0' }}>
            <div className="container">
              <div className="responsive-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="section-title" style={{ fontSize: 24 }}>Opportunités suggérées</h2>
                <Link to="/projects" className="btn btn-ghost btn-sm">
                  Consulter l&apos;ensemble <ArrowRight size={16} />
                </Link>
              </div>

              <div className="project-grid">
                {PROJETS_RECOMMANDES.map((project) => (
                  <Link key={project.id} to="/projects" className="card project-card glow-card">
                    <div
                      style={{
                        height: 180,
                        padding: 16,
                        background: project.gradient,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <span className="badge badge-sector">{project.sector}</span>
                        {project.verified && (
                          <span className="badge badge-verified">
                            <Shield size={11} /> Vérifié
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.05em', color: 'rgba(255,255,255,0.18)' }}>
                        {project.name.slice(0, 2)}
                      </div>
                    </div>

                    <div className="project-card-body">
                      <h3 style={{ fontWeight: 700, fontSize: 18 }}>{project.name}</h3>
                      <p
                        style={{
                          color: 'var(--text-2)',
                          fontSize: 14,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text-2)', fontSize: 13 }}>
                        <span>{project.amount}</span>
                        <span>{project.interested} investisseurs intéressés</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${project.progress}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #d4a853, #8b6914)',
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{project.progress}% rempli</div>
                      </div>

                      <div className="project-card-footer">
                        <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>Voir le détail</span>
                        <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '24px 0 80px' }}>
            <div className="container">
              <div className="responsive-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="section-title" style={{ fontSize: 24 }}>Activité récente</h2>
                <Link to="/notifications" className="btn btn-ghost btn-sm">
                  Historique complet <ArrowRight size={16} />
                </Link>
              </div>

              <div className="card">
                {ACTIVITE_RECENTE.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={`${item.text}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        padding: index === 0 ? '0 0 18px' : index === ACTIVITE_RECENTE.length - 1 ? '18px 0 0' : '18px 0',
                        borderBottom: index === ACTIVITE_RECENTE.length - 1 ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: `${item.color}18`,
                          border: `1px solid ${item.color}28`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} color={item.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{item.text}</div>
                        <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>{item.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section
            className="home-hero"
            style={{
              minHeight: '88vh',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              padding: '80px 0',
            }}
          >
            <HeroBackground />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <div className="animate-in" style={{ maxWidth: 760 }}>
                <div
                  className="badge"
                  style={{
                    marginBottom: 24,
                    fontSize: 13,
                    background: '#050507',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Shield size={12} /> La rigueur avant l&apos;enthousiasme
                </div>

                <h1 className="hero-title" style={{ marginBottom: 24 }}>
                  Trouver le financement juste, pour le projet{' '}
                  <span className="gradient-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    juste
                  </span>
                  , au moment juste
                </h1>

                <p className="hero-copy" style={{ marginBottom: 40 }}>
                  InvestLink met en relation des porteurs de projets sérieux et des investisseurs avisés. Sans
                  intermédiaire superflu. Sans promesse inconsidérée. Avec méthode.
                </p>

                <div className="hero-actions" style={{ marginBottom: 0 }}>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <Rocket size={18} /> Présenter mon projet
                  </Link>
                  <Link to="/projects" className="btn btn-outline btn-lg">
                    <Search size={16} /> Consulter les opportunités
                  </Link>
                </div>

                <HeroStats />
              </div>
            </div>
          </section>

          <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h2 className="section-title">Notre méthode en six principes</h2>
                <p style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 560, marginInline: 'auto' }}>
                  Une discipline claire, des critères constants et une exécution attentive à chaque étape.
                </p>
              </div>

              <div className="feature-grid">
                {FEATURES.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div
                style={{
                  background: '#050507',
                  border: '1px solid rgba(139,105,20,0.35)',
                  borderRadius: 24,
                  padding: '60px 40px',
                  textAlign: 'center',
                }}
              >
                <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
                  Prenez une décision éclairée
                </h2>
                <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 32 }}>
                  Des centaines de projets et d&apos;investisseurs utilisent déjà notre plateforme. Rejoignez-les en toute confiance.
                </p>

                <div className="hero-actions" style={{ justifyContent: 'center' }}>
                  <Link to="/register?role=porteur" className="btn btn-primary btn-lg">
                    <FileText size={18} /> Déposer un projet
                  </Link>
                  <Link to="/register?role=investisseur" className="btn btn-outline btn-lg">
                    <Briefcase size={18} /> Étudier les dossiers
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
