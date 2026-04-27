import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useMessageSocket } from '../hooks/useMessageSocket';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import ChatLayout from '../components/messaging/ChatLayout';
import ConversationSidebar from '../components/messaging/ConversationSidebar';
import MessageContainer from '../components/messaging/MessageContainer';
import MessageInput from '../components/messaging/MessageInput';
import ChatHeader from '../components/messaging/ChatHeader';
import ContactDetail from '../components/messaging/ContactDetail';
import EmptyState from '../components/messaging/EmptyState';

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [input, setInput] = useState('');
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  const [showContact, setShowContact] = useState(false);
  const [hydratingConversation, setHydratingConversation] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    { role: 'assistant', content: 'Je suis InvestBot. Posez une question sur un dossier ou une correspondance.' },
  ]);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const { conversations, search, setSearch, loading, error, reload, unreadCount, setConversations } = useConversations();
  const { groupedMessages, loading: messagesLoading, sending, send, loadMore, setMessages } = useMessages(activeConversation?.id, user.id);
  const { socket, sendTyping } = useMessageSocket(localStorage.getItem('token'), activeConversation?.id);
  const typing = useTypingIndicator(socket, activeConversation?.id);
  const isConversationOpen = Boolean(activeConversation?.id);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setShowContact(false);
      setHydratingConversation(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!activeConversation?.id) return;
    setShowContact(!mobile);
  }, [activeConversation?.id, mobile]);

  useEffect(() => {
    if (!activeConversation?.id) return;
    void reload();
  }, [activeConversation?.id, reload]);

  const selectConversation = async (conversation) => {
    if (!conversation?.id) return;

    setActiveConversation(conversation);
    setShowContact(!mobile);
    setHydratingConversation(true);

    if (conversationId !== conversation.id) {
      navigate(`/messages/${conversation.id}`, { replace: true });
    }

    try {
      const rows = await messageService.fetchMessages(conversation.id, { limit: 30 });
      const ordered = [...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(ordered);
      const next = conversations.map((row) => (row.id === conversation.id ? { ...row, unread_count: 0 } : row));
      setConversations(next);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setHydratingConversation(false);
    }
  };

  useEffect(() => {
    const current = conversations.find((conv) => conv.id === conversationId);
    if (current && current.id !== activeConversation?.id && !hydratingConversation) {
      void selectConversation(current);
    }
  }, [conversationId, conversations, activeConversation?.id, hydratingConversation]);

  const contact = useMemo(() => {
    if (!activeConversation) return null;

    const isOwner = activeConversation.user_1_id === user.id;
    const fullName = isOwner
      ? `${activeConversation.user2_first_name || ''} ${activeConversation.user2_last_name || ''}`.trim()
      : `${activeConversation.user1_first_name || ''} ${activeConversation.user1_last_name || ''}`.trim();
    const avatar = isOwner ? activeConversation.user2_avatar : activeConversation.user1_avatar;
    const roleLabel = isOwner ? activeConversation.user2_role : activeConversation.user1_role;
    const trustScore = isOwner ? activeConversation.user2_trust_score : activeConversation.user1_trust_score;
    const verified = (isOwner ? activeConversation.user2_verification_status : activeConversation.user1_verification_status) === 'verifie';

    return {
      name: fullName || 'Contact',
      avatar,
      roleLabel: roleLabel === 'porteur' ? 'Porteur de projet' : roleLabel === 'investisseur' ? 'Investisseur' : 'Compte',
      trustScore: trustScore || 0,
      verified,
    };
  }, [activeConversation, user.id]);

  const otherParticipantId = activeConversation
    ? activeConversation.user_1_id === user.id
      ? activeConversation.user_2_id
      : activeConversation.user_1_id
    : '';

  const sharedFiles = useMemo(
    () => groupedMessages.filter((entry) => entry.type === 'message' && entry.value.file_url).map((entry) => ({
      id: entry.value.id,
      url: entry.value.file_url,
      name: entry.value.content || 'Pièce jointe',
    })),
    [groupedMessages]
  );

  const sharedProjects = useMemo(
    () => (activeConversation?.project_title ? [{ id: activeConversation.id, title: activeConversation.project_title, sector: activeConversation.project_title }] : []),
    [activeConversation]
  );

  const onSend = async (event) => {
    event.preventDefault();
    if (!input.trim() && !attachment) return;

    try {
      await send({ content: input.trim(), file: attachment });
      setInput('');
      setAttachment(null);
      void reload();
      socket?.emit('send_message', { conversation_id: activeConversation.id, message: { content: input } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const onDeleteConversation = async () => {
    if (!activeConversation?.id) return;
    if (!window.confirm('Supprimer définitivement cette discussion ?')) return;

    try {
      await messageService.deleteConversation(activeConversation.id);
      setConversations((prev) => prev.filter((row) => row.id !== activeConversation.id));
      setActiveConversation(null);
      setShowContact(false);
      setShowAssistant(false);
      navigate('/messages', { replace: true });
      toast.success('Discussion supprimée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Suppression impossible');
    }
  };

  const onSendAssistant = async (event) => {
    event.preventDefault();
    if (!assistantInput.trim()) return;

    const userMessage = { role: 'user', content: assistantInput.trim() };
    setAssistantMessages((prev) => [...prev, userMessage]);
    setAssistantInput('');
    setAssistantLoading(true);

    try {
      const res = await api.post('/ai/chat', { messages: [...assistantMessages, userMessage] });
      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: 'Une erreur est survenue. Réessayez.' }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !activeConversation?.id) return undefined;

    const handler = (payload) => {
      if (payload?.conversation_id === activeConversation.id) {
        void reload();
      }
    };

    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, activeConversation?.id, reload]);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) InvestLink - Messages` : 'InvestLink - Messages';
  }, [unreadCount]);

  if (!user) return null;

  if (error && !loading) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 640, paddingTop: 40 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <MessageSquare size={52} style={{ color: '#bfdbfe', margin: '0 auto 16px' }} />
            <h1 className="section-title" style={{ marginBottom: 8 }}>Impossible de charger les conversations</h1>
            <button type="button" className="btn btn-primary" onClick={reload}>Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  const sidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeConversationId={activeConversation?.id}
      search={search}
      onSearch={setSearch}
      onSelectConversation={selectConversation}
      onCreateConversation={() => navigate('/projects')}
      loading={loading}
      unreadCount={unreadCount}
    />
  );

  const messagesPane = activeConversation ? (
    <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff' }}>
      <ChatHeader
        contact={contact}
        status={typing ? 'En ligne' : 'Hors ligne'}
        typing={typing}
        mobile={mobile}
        onBack={mobile ? () => navigate('/messages', { replace: true }) : undefined}
        onToggleDetails={mobile ? () => setShowContact(true) : undefined}
        onToggleAssistant={() => setShowAssistant((value) => !value)}
        onProfile={() => navigate(`/members/${otherParticipantId}`)}
      />
      {messagesLoading ? (
        <div style={{ padding: 20, display: 'grid', gap: 10 }}>
          {[...Array(6)].map((_, index) => <div key={index} className="loading-pulse" style={{ height: 64, borderRadius: 16, background: 'var(--bg-3)' }} />)}
        </div>
      ) : (
        <MessageContainer
          items={groupedMessages}
          currentUserId={user.id}
          typingName={contact?.name}
          typing={typing}
          onLoadOlder={loadMore}
          onOpenAttachment={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
          onCopy={null}
        />
      )}
      <MessageInput
        value={input}
        onChange={(value) => {
          setInput(value);
          sendTyping(activeConversation.id);
        }}
        onSend={onSend}
        onAttach={() => document.getElementById('message-file-input')?.click()}
        onToggleEmoji={() => toast('Emojis bientôt disponibles')}
        attachment={attachment}
        onRemoveAttachment={() => setAttachment(null)}
        disabled={sending || (!input.trim() && !attachment)}
        charCount={input.length}
        typing={typing}
      />
      <input
        id="message-file-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        style={{ display: 'none' }}
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (!selected) return;
          setAttachment(selected);
          event.target.value = '';
        }}
      />
    </section>
  ) : (
    <EmptyState />
  );

  const detailPane = activeConversation && showContact ? (
    <ContactDetail
      contact={contact}
      mobile={mobile}
      onClose={mobile ? () => setShowContact(false) : undefined}
      onOpenProfile={() => navigate(`/members/${otherParticipantId}`)}
      onBlock={() => toast('Blocage à connecter au backend')}
      onReport={() => messageService.reportConversation(activeConversation.id, prompt('Motif du signalement :') || '')}
      onDeleteConversation={onDeleteConversation}
      sharedFiles={sharedFiles}
      sharedProjects={sharedProjects}
    />
  ) : null;

  return (
    <div className="page" style={{ padding: 0, minHeight: 'calc(100dvh - 70px)' }}>
      <div className="container" style={{ padding: 0, maxWidth: 1600 }}>
        <ChatLayout
          mobileMode={mobile}
          sidebar={mobile ? (isConversationOpen ? null : sidebar) : sidebar}
          messages={mobile ? (isConversationOpen ? messagesPane : null) : messagesPane}
          detail={
            mobile ? (
              detailPane ? (
                <div className="messages-mobile-detail-shell">
                  <button type="button" className="messages-mobile-detail-backdrop" onClick={() => setShowContact(false)} aria-label="Fermer les détails du contact" />
                  <div className="messages-mobile-detail-panel">
                    {detailPane}
                  </div>
                </div>
              ) : null
            ) : (
              detailPane || <div style={{ background: 'var(--bg-3)', borderLeft: '1px solid var(--border)' }} />
            )
          }
        />

        {activeConversation && showAssistant ? (
          <div className="messages-ai-shell">
            <section className="messages-ai-panel">
              <div className="messages-ai-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bot size={16} style={{ color: 'var(--primary)' }} />
                  <strong>InvestBot</strong>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAssistant(false)} aria-label="Fermer l'assistant">
                  <X size={15} />
                </button>
              </div>

              <div className="messages-ai-body" style={{ flex: 1, padding: 16, display: 'grid', gap: 10 }}>
                {assistantMessages.map((message, index) => (
                  <div key={`${message.role}-${index}`} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '88%', padding: '10px 12px', borderRadius: 14, background: message.role === 'user' ? 'linear-gradient(135deg, var(--primary), #2d73dc)' : 'var(--bg-3)', color: message.role === 'user' ? '#fff' : 'var(--text)', lineHeight: 1.5 }}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {assistantLoading ? <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Réflexion en cours...</div> : null}
              </div>

              <form className="messages-ai-footer" onSubmit={onSendAssistant} style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)' }}>
                <input
                  className="input"
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  placeholder="Posez votre question..."
                />
                <button type="submit" className="btn btn-primary messages-attach-btn" disabled={assistantLoading || !assistantInput.trim()}>
                  <Send size={15} />
                </button>
              </form>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
