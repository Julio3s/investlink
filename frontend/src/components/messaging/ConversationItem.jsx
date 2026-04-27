import Avatar from '../common/Avatar';

export default function ConversationItem({ conversation, active, onSelect, unreadCount = 0, online = false }) {
  const name =
    `${conversation.user1_first_name || ''} ${conversation.user1_last_name || ''}`.trim() ||
    `${conversation.user2_first_name || ''} ${conversation.user2_last_name || ''}`.trim();
  const avatar = conversation.user1_avatar || conversation.user2_avatar;
  const preview = conversation.last_message || 'Aucun message';

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        background: active ? '#eff6ff' : 'transparent',
        border: 'none',
        borderBottom: '1px solid #e5e7eb',
        color: '#171717',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={avatar} name={name} size={40} textStyle={{ fontSize: 14 }} />
          <span style={{ position: 'absolute', right: 1, bottom: 1, width: 10, height: 10, borderRadius: '50%', background: online ? '#10b981' : '#a3a3a3', border: '2px solid #fff' }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <strong style={{ fontSize: 14, fontWeight: unreadCount > 0 ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</strong>
            {unreadCount > 0 && <span className="badge badge-pending" style={{ borderRadius: 999 }}>{unreadCount}</span>}
          </div>
          <div style={{ color: '#737373', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }}>
            {preview}
          </div>
        </div>
      </div>
    </button>
  );
}
