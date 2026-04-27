import { useEffect, useState } from 'react';

export function useTypingIndicator(socket, conversationId) {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!socket || !conversationId) return undefined;

    const handler = (payload) => {
      if (!payload) return;
      setTyping(Boolean(payload.userId));
      window.clearTimeout(window.__investlinkTypingTimer);
      window.__investlinkTypingTimer = window.setTimeout(() => setTyping(false), 1800);
    };

    socket.on('user_typing', handler);
    return () => socket.off('user_typing', handler);
  }, [socket, conversationId]);

  return typing;
}
