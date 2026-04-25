import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Shield, TrendingUp, MessageSquare, Search, Star, CheckCircle } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '88vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '80px 0',
      }}>
        {/* Background effects */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container">
          <div className="animate-in" style={{ maxWidth: 700 }}>
            <div className="badge badge-sector" style={{ marginBottom: 24, fontSize: 13 }}>
              <Star size={12} /> Plateforme de mise en relation #1
            </div>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginBottom: 24,
            }}>
              Connectez vos{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }} className="gradient-text">projets</span>
              {' '}aux bons{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }} className="gradient-text">investisseurs</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
              InvestLink facilite la rencontre entre porteurs de projets innovants et investisseurs visionnaires. 
              Simple, sécurisé, et axé sur la confiance.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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

            <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
              {[['500+', 'Projets publiés'], ['1 200+', 'Investisseurs actifs'], ['98%', 'Taux de satisfaction']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>{n}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="section-title">Pourquoi InvestLink ?</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>
              Une plateforme pensée pour maximiser la confiance entre toutes les parties
            </p>
          </div>

          <div className="grid-3">
            {[
              { icon: Shield, title: 'Vérification KYC', desc: 'Chaque profil est vérifié manuellement. Badge de confiance attribué après validation.', color: '#10b981' },
              { icon: TrendingUp, title: 'Score de confiance', desc: 'Un score basé sur la complétude du profil, la vérification et l\'activité.', color: '#3b82f6' },
              { icon: MessageSquare, title: 'Messagerie sécurisée', desc: 'Discutez directement avec les porteurs ou investisseurs. Historique complet.', color: '#8b5cf6' },
              { icon: Search, title: 'Recherche avancée', desc: 'Filtrez par secteur, pays, montant. Trouvez exactement ce que vous cherchez.', color: '#f59e0b' },
              { icon: CheckCircle, title: 'Projets validés', desc: 'L\'équipe InvestLink valide les projets pour garantir leur sérieux.', color: '#06b6d4' },
              { icon: Star, title: 'IA Assistant', desc: 'Notre assistant IA vous guide sur les projets et investissements.', color: '#ec4899' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card glow-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${color}30`,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 24,
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Prêt à démarrer ?
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 32 }}>
              Rejoignez des centaines de porteurs de projets et d'investisseurs sur InvestLink
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=porteur" className="btn btn-primary btn-lg">
                🚀 Je porte un projet
              </Link>
              <Link to="/register?role=investisseur" className="btn btn-outline btn-lg">
                💼 Je suis investisseur
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
