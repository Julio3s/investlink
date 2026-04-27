import { Paperclip, Send, Smile } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function MessageInput({
  value,
  onChange,
  onSend,
  onAttach,
  onToggleEmoji,
  attachment,
  onRemoveAttachment,
  disabled,
  charCount,
  typing,
}) {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  return (
    <form onSubmit={onSend} style={{ borderTop: '1px solid #e5e7eb', background: '#fff', padding: 16, display: 'grid', gap: 12 }}>
      {attachment && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</div>
            <div style={{ fontSize: 12, color: '#737373' }}>{(attachment.size / 1024 / 1024).toFixed(1)} MB</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRemoveAttachment}>Retirer</button>
        </div>
      )}

      {typing && <div style={{ color: '#2563eb', fontSize: 13 }}>L’autre participant est en train d’écrire.</div>}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline messages-attach-btn" onClick={onAttach} aria-label="Joindre un fichier">
          <Paperclip size={16} />
        </button>
        <button type="button" className="btn btn-outline messages-attach-btn" onClick={onToggleEmoji} aria-label="Émojis">
          <Smile size={16} />
        </button>
        <textarea
          ref={textRef}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Écrivez votre message..."
          rows={1}
          style={{ resize: 'none', minHeight: 44, maxHeight: 120, lineHeight: 1.5 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend(e);
            }
          }}
        />
        <button type="submit" className="btn btn-primary messages-attach-btn" disabled={disabled}>
          <Send size={16} />
        </button>
      </div>

      {charCount > 500 && <div style={{ fontSize: 12, color: '#737373', textAlign: 'right' }}>{charCount} caractères</div>}
    </form>
  );
}
