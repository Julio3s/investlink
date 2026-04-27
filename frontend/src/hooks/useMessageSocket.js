import { useEffect, useMemo, useState } from 'react';
import { connectSocket, disconnectSocket, emitSocket, getSocket, onSocket } from '../services/socketService';

export function useMessageSocket(token, conversationId) {
  const [connected, setConnected] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectSocket(token);
    const offConnect = onSocket('connect', () => setConnected(true));
    const offDisconnect = onSocket('disconnect', () => setConnected(false));
    const offTyping = onSocket('user_typing', (payload) => {
      if (!payload || payload.userId === undefined) return;
      setTypingUserId(payload.userId);
    });

    return () => {
      offConnect();
      offDisconnect();
      offTyping();
      disconnectSocket();
    };
  }, [token]);

  useEffect(() => {
    if (!conversationId) return undefined;
    emitSocket('join_conversation', conversationId);
    return undefined;
  }, [conversationId]);

  const socket = useMemo(() => getSocket(), [connected]);

  const sendTyping = (convId) => {
    emitSocket('typing', { conversation_id: convId });
  };

  return {
    socket,
    connected,
    typingUserId,
    sendTyping,
  };
}
