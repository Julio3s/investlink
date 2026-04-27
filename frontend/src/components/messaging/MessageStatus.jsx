import { Check, CheckCheck } from 'lucide-react';

export default function MessageStatus({ status = 'sent' }) {
  if (status === 'read') {
    return <CheckCheck size={13} style={{ color: '#60a5fa' }} aria-label="Lu" />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={13} style={{ color: '#94a3b8' }} aria-label="Reçu" />;
  }

  return <Check size={13} style={{ color: '#94a3b8' }} aria-label="Envoyé" />;
}
