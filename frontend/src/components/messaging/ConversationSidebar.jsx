import { Plus, Search } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  search,
  onSearch,
  onSelectConversation,
  onCreateConversation,
  loading,
  unreadCount,
}) {
  return (
    <aside style={{ background: 'var(--bg-3)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Conversations</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{unreadCount} messages non lus</p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onCreateConversation}>
            <Plus size={15} /> Nouvelle
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            className="input"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher une conversation"
            style={{ paddingLeft: 38, background: '#fff' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="loading-pulse" style={{ height: 74, borderRadius: 12, background: '#fff', border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontStyle: 'italic' }}>Aucun message</div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={activeConversationId === conversation.id}
              onSelect={() => onSelectConversation(conversation)}
              unreadCount={conversation.unread_count || 0}
            />
          ))
        )}
      </div>
    </aside>
  );
}
