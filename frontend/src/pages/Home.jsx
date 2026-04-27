import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  MessageSquare,
  Search,
  Star,
  CheckCircle,
  Rocket,
  Briefcase,
  Sparkles,
  Users,
  Globe,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Vérification KYC',
    desc: 'Chaque profil est vérifié manuellement. Badge de confiance attribué après validation.',
    color: '#10b981',
  },
  {
    icon: TrendingUp,
    title: 'Score de confiance',
    desc: "Un score basé sur la complétude du profil, la vérification et l'activité.",
    color: '#3b82f6',
  },
  {
    icon: MessageSquare,
    title: 'Messagerie sécurisée',
    desc: 'Discutez directement avec les porteurs ou investisseurs. Historique complet.',
    color: '#8b5cf6',
  },
  {
    icon: Search,
    title: 'Recherche avancée',
    desc: 'Filtrez par secteur, pays, montant. Trouvez exactement ce que vous cherchez.',
    color: '#f59e0b',
  },
  {
    icon: CheckCircle,
    title: 'Projets validés',
    desc: "L'équipe InvestLink valide les projets pour garantir leur sérieux.",
    color: '#06b6d4',
  },
  {
    icon: Sparkles,
    title: 'IA Assistant',
    desc: 'Notre assistant IA vous guide sur les projets et investissements.',
    color: '#ec4899',
  },
];

const STATS = [
  { value: '500+', label: 'Projets publiés', icon: Globe },
  { value: '1 200+', label: 'Investisseurs actifs', icon: Users },
  { value: '98%', label: 'Taux de satisfaction', icon: Zap },
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
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
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
            <Icon size={18} style={{ color: '#60a5fa' }} />
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

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
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
            <div className="badge badge-sector" style={{ marginBottom: 24, fontSize: 13 }}>
              <Star size={12} /> Plateforme de mise en relation #1
            </div>

            <h1 className="hero-title" style={{ marginBottom: 24 }}>
              Connectez vos{' '}
              <span className="gradient-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                projets
              </span>{' '}
              aux bons{' '}
              <span className="gradient-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                investisseurs
              </span>
            </h1>

            <p className="hero-copy" style={{ marginBottom: 40 }}>
              InvestLink facilite la rencontre entre porteurs de projets innovants et investisseurs visionnaires.
              Simple, sécurisé, et axé sur la confiance.
            </p>

            <div className="hero-actions" style={{ marginBottom: 0 }}>
              {user ? (
                <Link to="/projects" className="btn btn-primary btn-lg">
                  Explorer les projets <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Commencer gratuitement <ArrowRight size={18} />
                  </Link>
                  <Link to="/projects" className="btn btn-outline btn-lg">
                    <Search size={16} /> Explorer
                  </Link>
                </>
              )}
            </div>

            <HeroStats />
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="section-title">Pourquoi InvestLink ?</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 560, marginInline: 'auto' }}>
              Une plateforme pensée pour maximiser la confiance entre toutes les parties
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
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 24,
              padding: '60px 40px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Prêt à démarrer ?
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 32 }}>
              Rejoignez des centaines de porteurs de projets et d&apos;investisseurs sur InvestLink
            </p>

            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/register?role=porteur" className="btn btn-primary btn-lg">
                <Rocket size={18} /> Je porte un projet
              </Link>
              <Link to="/register?role=investisseur" className="btn btn-outline btn-lg">
                <Briefcase size={18} /> Je suis investisseur
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
