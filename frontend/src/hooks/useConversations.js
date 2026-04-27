import { useCallback, useEffect, useMemo, useState } from 'react';
import { messageService } from '../services/messageService';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await messageService.fetchConversations();
      setConversations(rows);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = useMemo(
    () => conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0),
    [conversations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...conversations].sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
    if (!q) return rows;
    return rows.filter((conv) => {
      const name = `${conv.user1_first_name || ''} ${conv.user1_last_name || ''} ${conv.user2_first_name || ''} ${conv.user2_last_name || ''}`.toLowerCase();
      const message = (conv.last_message || '').toLowerCase();
      const project = (conv.project_title || '').toLowerCase();
      return name.includes(q) || message.includes(q) || project.includes(q);
    });
  }, [conversations, search]);

  return {
    conversations: filtered,
    search,
    setSearch,
    loading,
    error,
    reload: load,
    unreadCount,
    setConversations,
  };
}
