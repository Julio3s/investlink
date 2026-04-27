import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CoverImage from '../components/common/CoverImage';
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  FileText,
  Globe,
  MessageSquare,
  PlusCircle,
  Rocket,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Vérification systématique',
    desc: "Chaque profil fait l'objet d'un contrôle d'identité rigoureux. Nous ne transigeons pas avec la sécurité des membres.",
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

function HeroStats() {
  return (
    <div className="stats-row" style={{ marginTop: 40, alignItems: 'center' }}>
      {STATS.map(({ value, label, icon: Icon }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(201,154,46,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 24px rgba(24,49,83,0.08)' }}>
            <Icon size={18} style={{ color: '#c99a2e' }} />
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
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

function ProjectPreview({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="card project-card glow-card">
      <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(31,95,191,0.16), rgba(201,154,46,0.14))' }}>
        <CoverImage
          src={project.image_url}
          alt={project.title}
          style={{ width: '100%', height: '100%' }}
          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
          fallback={<div style={{ width: '100%', height: '100%' }} />}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(24,49,83,0.72) 100%)' }} />
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-sector">{project.sector || 'Général'}</span>
          {project.status && <span className="badge badge-pending">{project.status}</span>}
        </div>
      </div>

      <div className="project-card-body">
        <h3 style={{ fontWeight: 700, fontSize: 18 }}>{project.title}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.solution || project.problem_description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text-2)', fontSize: 13, flexWrap: 'wrap' }}>
          <span>{Number(project.amount_sought || 0).toLocaleString('fr-FR')} {project.currency_code || 'USD'}</span>
          <span>{project.views_count || 0} vues</span>
        </div>
        <div className="project-card-footer">
          <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>Voir le détail</span>
          <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.first_name?.trim();
  const dashboardStats = user?.stats || {};
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await api.get('/projects', { params: { page: 1, limit: 4, sort: 'recent' } });
        if (alive) setFeaturedProjects(res.data.projects || []);
      } catch {
        if (alive) setFeaturedProjects([]);
      } finally {
        if (alive) setProjectsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

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
                      <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input className="input" placeholder="Rechercher un projet, un secteur, un investisseur..." style={{ minHeight: 48, borderRadius: 14, paddingLeft: 46 }} />
                    </div>
                  </div>
                  <div className="responsive-row" style={{ minWidth: 280 }}>
                    <Link to="/projects/new" className="btn btn-primary mobile-full-width">
                      <PlusCircle size={16} /> Publier un projet
                    </Link>
                    <Link to="/wallet" className="btn btn-outline mobile-full-width">
                      <Wallet size={16} /> Portefeuille
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
              <div className="responsive-stats-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                <div className="card">
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>{dashboardStats.projetsVues || 0}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 12 }}>Consultations</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>{dashboardStats.messages || 0}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 12 }}>Messages reçus</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>{dashboardStats.favoris || 0}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 12 }}>Projets suivis</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>{dashboardStats.scoreConfiance || 0}%</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 12 }}>Indice de confiance</div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ padding: '24px 0' }}>
            <div className="container">
              <div className="responsive-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="section-title" style={{ fontSize: 24 }}>
                  {featuredProjects.length === 1 ? 'Projet du moment' : 'Opportunités suggérées'}
                </h2>
                <Link to="/projects" className="btn btn-ghost btn-sm">
                  Consulter l&apos;ensemble <ArrowRight size={16} />
                </Link>
              </div>

              {projectsLoading ? (
                <div className="projects-skeleton">
                  {[...Array(3)].map((_, index) => <div key={index} className="card loading-pulse" style={{ height: 320 }} />)}
                </div>
              ) : featuredProjects.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '56px 24px' }}>
                  Aucun projet n&apos;est encore publié.
                </div>
              ) : (
                <div className="project-grid">
                  {featuredProjects.map((project) => <ProjectPreview key={project.id} project={project} />)}
                </div>
              )}
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

              <div className="card" style={{ display: 'grid', gap: 14 }}>
                {[
                  ['Sophie Laurent a ajouté EcoPulse à sa liste de projets à suivre.', 'Il y a deux heures'],
                  ['Marc Dubois vous a adressé un message concernant MediChain.', 'Il y a cinq heures'],
                  ['Votre indice de confiance a progressé de cinq points.', 'Hier'],
                ].map(([text, time]) => (
                  <div key={text} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                    <div>{text}</div>
                    <div style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{time}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="home-hero" style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '80px 0' }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <div className="animate-in" style={{ maxWidth: 760 }}>
                <div className="badge" style={{ marginBottom: 24, fontSize: 13, background: 'rgba(255,255,255,0.82)', color: 'var(--primary)', border: '1px solid rgba(31,95,191,0.16)', boxShadow: '0 12px 30px rgba(24,49,83,0.08)' }}>
                  <Shield size={12} /> La rigueur avant l&apos;enthousiasme
                </div>

                <h1 className="hero-title" style={{ marginBottom: 24 }}>
                  Trouver le financement juste, pour le projet <span className="gradient-text" style={{ fontStyle: 'italic' }}>juste</span>, au moment juste
                </h1>

                <p className="hero-copy" style={{ marginBottom: 40 }}>
                  InvestLink met en relation des porteurs de projets sérieux et des investisseurs avisés. Sans intermédiaire superflu. Sans promesse inconsidérée. Avec méthode.
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
                {FEATURES.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
              </div>
            </div>
          </section>

          <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(237,244,255,0.96))', border: '1px solid rgba(201,154,46,0.26)', borderRadius: 24, padding: '60px 40px', textAlign: 'center', boxShadow: '0 24px 60px rgba(24,49,83,0.08)' }}>
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
