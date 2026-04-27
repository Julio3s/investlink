import { Link, useParams } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const COPY = {
  deposit: {
    title: 'Dépôt en développement',
    text: 'La configuration des dépôts est en attente. Nous gardons cette zone visible pour la prochaine intégration Kikiapai.',
  },
  withdraw: {
    title: 'Retrait en développement',
    text: 'La configuration des retraits est en attente. Le solde de départ reste bloqué et non retirable.',
  },
};

export default function WalletOperation() {
  const { operation } = useParams();
  const copy = COPY[operation] || COPY.deposit;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card" style={{ textAlign: 'center', padding: '72px 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--primary)' }}>
            <Wrench size={28} />
          </div>
          <h1 className="section-title" style={{ marginBottom: 12 }}>{copy.title}</h1>
          <p style={{ color: 'var(--text-2)', margin: '0 auto 24px', maxWidth: 520, lineHeight: 1.7 }}>{copy.text}</p>
          <Link to="/wallet" className="btn btn-primary">Retour au portefeuille</Link>
        </div>
      </div>
    </div>
  );
}
