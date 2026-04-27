import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import TypingIndicator from './TypingIndicator';

export default function MessageContainer({ items, currentUserId, typingName, typing, onCopy, onDelete, onEdit, onOpenAttachment, onLoadOlder }) {
  const scrollRef = useRef(null);
  const topAnchorRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (shouldStickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [items.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldStickToBottomRef.current = distanceFromBottom < 80;
    };

    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const anchor = topAnchorRef.current;
    if (!el || !anchor || !onLoadOlder) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && el.scrollTop <= 24) {
          onLoadOlder();
        }
      },
      { root: el, threshold: 0.1 }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [onLoadOlder]);

  return (
    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div ref={topAnchorRef} />

      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Aucun message dans cette conversation.</div>
      ) : (
        items.map((entry) =>
          entry.type === 'date' ? (
            <DateSeparator key={entry.key} label={new Date(entry.value).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} />
          ) : (
            <MessageBubble
              key={entry.key}
              message={entry.value}
              mine={entry.value.sender_id === currentUserId}
              showAvatar
              onCopy={() => navigator.clipboard?.writeText(entry.value.content || '')}
              onDelete={onDelete ? () => onDelete(entry.value) : undefined}
              onEdit={onEdit ? () => onEdit(entry.value) : undefined}
              onOpenAttachment={onOpenAttachment}
            />
          )
        )
      )}

      {typing && <TypingIndicator name={typingName || 'Le contact'} />}
    </div>
  );
}
