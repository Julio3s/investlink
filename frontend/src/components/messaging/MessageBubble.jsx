import { Copy, FileText, Pencil, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import MessageStatus from './MessageStatus';

const formatSize = (bytes = 0) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function MessageBubble({
  message,
  mine,
  showAvatar,
  onCopy,
  onDelete,
  onEdit,
  onOpenAttachment,
}) {
  const hasAttachment = Boolean(message.file_url);
  const isImage = hasAttachment && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(message.file_url);
  const status = message.optimistic ? 'sent' : message.is_read ? 'read' : 'delivered';

  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
      {!mine && showAvatar && (
        <Avatar src={message.avatar_url} name={`${message.first_name || ''} ${message.last_name || ''}`} size={40} textStyle={{ fontSize: 13 }} />
      )}

      <div style={{ maxWidth: '70%', minWidth: 180 }}>
        <div
          style={{
            background: mine ? '#3b82f6' : '#f1f5f9',
            color: mine ? '#fff' : '#171717',
            borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            padding: '10px 14px',
            border: mine ? '1px solid #3b82f6' : '1px solid #e5e7eb',
            display: 'grid',
            gap: 10,
            wordBreak: 'break-word',
          }}
        >
          {hasAttachment && isImage && (
            <button type="button" onClick={() => onOpenAttachment(message.file_url)} style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left' }}>
              <img src={message.file_url} alt="Pièce jointe" loading="lazy" style={{ width: '100%', maxWidth: 320, borderRadius: 12, display: 'block' }} />
            </button>
          )}

          {hasAttachment && !isImage && (
            <button
              type="button"
              onClick={() => onOpenAttachment(message.file_url)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1px solid rgba(59,130,246,0.18)',
                background: 'rgba(255,255,255,0.72)',
                borderRadius: 12,
                padding: '10px 12px',
                textAlign: 'left',
              }}
            >
              <FileText size={18} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Fichier joint</div>
                <div style={{ fontSize: 12, color: '#737373' }}>{formatSize(message.file_size || 0)}</div>
              </div>
            </button>
          )}

          {message.content && <div style={{ fontSize: 14, lineHeight: 1.5 }}>{message.content}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: mine ? 'flex-end' : 'space-between', gap: 8, marginTop: 4 }}>
          <div style={{ fontSize: 11, color: '#737373' }}>{message.createdAtLabel || ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mine && <MessageStatus status={status} />}
            <button type="button" onClick={onCopy} style={{ border: 'none', background: 'none', color: '#94a3b8' }} aria-label="Copier">
              <Copy size={13} />
            </button>
            {mine && onEdit && (
              <button type="button" onClick={onEdit} style={{ border: 'none', background: 'none', color: '#94a3b8' }} aria-label="Éditer">
                <Pencil size={13} />
              </button>
            )}
            {mine && onDelete && (
              <button type="button" onClick={onDelete} style={{ border: 'none', background: 'none', color: '#94a3b8' }} aria-label="Supprimer">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
