export default function TypingIndicator({ name = 'Quelqu\'un' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: 13, padding: '2px 0 8px' }}>
      <span style={{ fontWeight: 600 }}>{name} est en train d&apos;écrire</span>
      <span style={{ display: 'inline-flex', gap: 3 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s infinite' }} />
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s 0.15s infinite' }} />
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s 0.3s infinite' }} />
      </span>
    </div>
  );
}
