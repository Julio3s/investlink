import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <MessageSquare size={60} style={{ color: '#bfdbfe', margin: '0 auto 16px' }} />
        <h1 className="section-title" style={{ marginBottom: 10 }}>Votre messagerie est vide</h1>
        <p style={{ color: '#737373', marginBottom: 20, maxWidth: 520 }}>
          Lancez une conversation avec un porteur de projet ou un investisseur.
        </p>
        <Link to="/projects" className="btn btn-primary">Explorer les projets</Link>
      </div>
    </div>
  );
}
