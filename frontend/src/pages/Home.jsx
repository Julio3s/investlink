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
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'On verifie, vous dormez',
    desc: 'KYC obligatoire, identite confirmee, passe verifie. Les mythos restent dehors.',
    color: '#10b981',
  },
  {
    icon: TrendingUp,
    title: 'Score qui parle cash',
    desc: 'Votre reputation, vos deals, votre activite. Ca monte ou ca descend. Assumez.',
    color: '#3b82f6',
  },
  {
    icon: MessageSquare,
    title: 'Parlez business, pas meteo',
    desc: 'Chat direct avec preuves, documents, historique. Zero perte de temps.',
    color: '#8b5cf6',
  },
  {
    icon: Search,
    title: 'Filtrez comme un sniper',
    desc: 'Secteur, ticket, zone geo, stade du projet. Trouvez la cible. Bang.',
    color: '#f59e0b',
  },
  {
    icon: CheckCircle,
    title: 'Projets filtres au laser',
    desc: "Pas de copier-coller, pas de bullshit decks. Chaque projet est inspecte avant d'etre liste.",
    color: '#06b6d4',
  },
  {
    icon: Sparkles,
    title: 'IA qui sent les coups',
    desc: 'Notre intelligence artificielle detecte les deals chauds et les patterns suspects avant vous.',
    color: '#ec4899',
  },
];

const STATS = [
  { value: '500+', label: 'Deals conclus', icon: Globe },
  { value: '1 200+', label: 'Bailleurs prets a sortir le chequier', icon: Users },
  { value: '98%', label: 'Moins de bullshit que vos concurrents', icon: Zap },
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
              <Zap size={12} /> Fini la chasse aux pigeons
            </div>

            <h1 className="hero-title" style={{ marginBottom: 24 }}>
              Votre projet merite{' '}
              <span className="gradient-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                mieux
              </span>{' '}
              qu&apos;un PowerPoint dans le vide
            </h1>

            <p className="hero-copy" style={{ marginBottom: 40 }}>
              InvestLink balance votre projet directement dans la gueule des bons investisseurs. Pas de bullshit,
              pas de networking force, pas de rendez-vous steriles. Du concret.
            </p>

            <div className="hero-actions" style={{ marginBottom: 0 }}>
              {user ? (
                <Link to="/projects" className="btn btn-primary btn-lg">
                  Je cherche des pepites <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <Rocket size={18} /> Je trouve des investisseurs
                  </Link>
                  <Link to="/projects" className="btn btn-outline btn-lg">
                    <Search size={16} /> Je cherche des pepites
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
            <h2 className="section-title">Ce qui fait taire les sceptiques</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 560, marginInline: 'auto' }}>
              Une machine faite pour couper court aux promesses creuses et faire avancer les vrais deals.
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
              border: '1px solid rgba(139,92,246,0.35)',
              borderRadius: 24,
              padding: '60px 40px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Arretez de perdre du temps
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 32 }}>
              Les deals se font ici. Pas dans les salons feutres, pas au golf. Ici.
            </p>

            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/register?role=porteur" className="btn btn-primary btn-lg">
                <Rocket size={18} /> Je leve des fonds
              </Link>
              <Link to="/register?role=investisseur" className="btn btn-outline btn-lg">
                <Briefcase size={18} /> Je deploie mon capital
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
