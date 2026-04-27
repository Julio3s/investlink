import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { messageService } from '../services/messageService';

export function useMessages(conversationId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const cursorRef = useRef(null);
  const loadingRef = useRef(false);

  const mergeUniqueMessages = useCallback((rows) => {
    const seen = new Set();
    return rows.filter((message) => {
      if (!message?.id || seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
  }, []);

  const loadMessages = useCallback(async (mode = 'replace') => {
    if (!conversationId || loadingRef.current) return;
    if (mode === 'prepend' && (!cursorRef.current || !hasMore)) return;

    loadingRef.current = true;
    mode === 'prepend' ? setLoadingMore(true) : setLoading(true);
    setError(null);

    try {
      const rows = await messageService.fetchMessages(conversationId, {
        limit: 30,
        before: mode === 'prepend' ? cursorRef.current : undefined,
      });

      const ordered = mergeUniqueMessages([...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      if (mode === 'prepend') {
        setMessages((prev) => mergeUniqueMessages([...ordered, ...prev]));
      } else {
        setMessages(ordered);
      }

      const oldest = ordered[0];
      cursorRef.current = oldest?.created_at || null;
      setHasMore(rows.length === 30 && ordered.length > 0);
    } catch (err) {
      setError(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId, hasMore, mergeUniqueMessages]);

  useEffect(() => {
    cursorRef.current = null;
    loadingRef.current = false;
    setMessages([]);
    setHasMore(false);
    if (!conversationId) return;
    void loadMessages('replace');
  }, [conversationId, loadMessages]);

  const send = useCallback(async ({ content, file }) => {
    if (!conversationId) return null;
    setSending(true);

    const optimistic = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      file_url: file ? URL.createObjectURL(file) : null,
      type: file ? 'fichier' : 'texte',
      created_at: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await messageService.sendMessage({
        conversationId,
        content,
        file,
      });
      setMessages((prev) => mergeUniqueMessages(prev.map((msg) => (msg.id === optimistic.id ? saved : msg))));
      return saved;
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimistic.id));
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId, currentUserId, mergeUniqueMessages]);

  const grouped = useMemo(() => {
    const groups = [];
    let lastDay = null;

    messages.forEach((message) => {
      const day = new Date(message.created_at).toDateString();
      if (day !== lastDay) {
        groups.push({ type: 'date', key: `${day}-${message.id}`, value: day });
        lastDay = day;
      }
      groups.push({ type: 'message', key: message.id, value: message });
    });

    return groups;
  }, [messages]);

  return {
    messages,
    groupedMessages: grouped,
    loading,
    loadingMore,
    error,
    hasMore,
    sending,
    loadMore: () => {
      if (!loadingRef.current && hasMore) {
        void loadMessages('prepend');
      }
    },
    loadMessages,
    send,
    setMessages,
  };
}
