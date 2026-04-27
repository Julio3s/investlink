export default function ChatLayout({ sidebar, messages, detail, mobileMode = false }) {
  if (mobileMode) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: 'calc(100dvh - 70px)' }}>
        {sidebar}
        {messages}
        {detail}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr) 320px', minHeight: 'calc(100dvh - 70px)' }}>
      {sidebar}
      {messages}
      {detail}
    </div>
  );
}
