import { MoreVertical, Phone, Search, Video } from 'lucide-react';
import Avatar from '../common/Avatar';

export default function ChatHeader({ contact, status = 'Hors ligne', typing = false, onProfile }) {
  return (
    <header style={{ padding: 18, borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button type="button" onClick={onProfile} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1, textAlign: 'left' }}>
        <Avatar src={contact?.avatar} name={contact?.name || 'Contact'} size={40} textStyle={{ fontSize: 14 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{contact?.name || 'Conversation'}</div>
          <div style={{ fontSize: 12, color: typing ? '#2563eb' : '#737373' }}>{typing ? 'en train d\'écrire' : status}</div>
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Appel audio"><Phone size={15} /></button>
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Appel vidéo"><Video size={15} /></button>
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Recherche"><Search size={15} /></button>
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Menu"><MoreVertical size={15} /></button>
      </div>
    </header>
  );
}
