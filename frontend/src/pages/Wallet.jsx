import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeDollarSign, Lock, Wallet as WalletIcon } from 'lucide-react';
import api from '../utils/api';

const MONEY_FORMAT = (value, currency = 'USD') =>
  `${Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

export default function Wallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/wallet/me')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card loading-pulse" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  const wallet = data?.wallet || {};

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 className="section-title">Portefeuille</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 8 }}>
            Solde initial bloqué, devise multiple, dépôt et retrait en préparation.
          </p>
        </div>

        <div className="responsive-stats-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Solde total', value: MONEY_FORMAT(wallet.total_balance, wallet.base_currency), icon: WalletIcon },
            { label: 'Montant à investir', value: MONEY_FORMAT(wallet.investable_balance, wallet.base_currency), icon: BadgeDollarSign },
            { label: 'Retrait disponible', value: MONEY_FORMAT(wallet.withdrawable_balance, wallet.base_currency), icon: ArrowRight },
            { label: 'Bonus bloqué', value: MONEY_FORMAT(wallet.locked_bonus, wallet.base_currency), icon: Lock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--primary)' }}>
                <Icon size={18} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{value}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Gestion en attente</h2>
              <p style={{ color: 'var(--text-2)', margin: 0 }}>
                Les dépôts et les retraits sont affichés comme fonctions en développement, jusqu&apos;à la configuration de Kikiapai.
              </p>
            </div>
            <div className="responsive-row">
              <Link to="/wallet/deposit" className="btn btn-outline">Dépôt</Link>
              <Link to="/wallet/withdraw" className="btn btn-outline">Retrait</Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 18 }}>Historique récent</h2>
            <span className="badge badge-pending">{data?.supported_currencies?.join(' / ')}</span>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {(data?.transactions || []).length === 0 ? (
              <div style={{ color: 'var(--text-3)' }}>Aucune opération pour le moment.</div>
            ) : (
              data.transactions.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{tx.note || tx.type}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{new Date(tx.created_at).toLocaleString('fr-FR')}</div>
                  </div>
                  <div style={{ fontWeight: 800 }}>
                    {tx.type === 'bonus' ? '+' : ''}
                    {MONEY_FORMAT(tx.amount, tx.currency_code)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
