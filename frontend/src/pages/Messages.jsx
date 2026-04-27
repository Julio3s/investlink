import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { io } from 'socket.io-client';
import { ArrowLeft, Bot, FileText, MessageSquare, Paperclip, Send, UserRound, X } from 'lucide-react';
import api from '../utils/api';
import { getFileUrl } from '../utils/fileUrl';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';

let socket;

const isImageFile = (fileUrl = '') => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl);

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [mobile, setMobile] = useState(() => window.innerWidth <= 860);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    { role: 'assistant', content: "Je suis InvestBot. Posez une question sur un dossier ou une correspondance." },
  ]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const chatEndRef = useRef(null);
  const assistantEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 860);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    loadConversations();
    socket = io('/', { auth: { token: localStorage.getItem('token') } });
    socket.emit('join', user.id);
    socket.on('new_message', (msg) => {
      setMessages((prev) => (prev.some((existing) => existing.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => socket?.disconnect();
  }, [user.id]);

  useEffect(() => {
    if (!conversationId) {
      setActiveConv(null);
      setMessages([]);
      return;
    }

    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      void selectConversation(conversation, { skipNavigation: true });
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    assistantEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantMessages]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, [input]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch {
      toast.error('Erreur de chargement');
    }
  };

  const selectConversation = async (conv, options = {}) => {
    setActiveConv(conv);
    if (!options.skipNavigation) {
      navigate(`/messages/${conv.id}`, { replace: true });
    }

    socket?.emit('join_conversation', conv.id);
    try {
      const res = await api.get(`/conversations/${conv.id}/messages`);
      setMessages(res.data);
      void loadConversations();
    } catch {
      toast.error('Erreur');
    }
  };

  const getOtherUser = (conv) => {
    if (conv.user_1_id === user.id) {
      return { id: conv.user_2_id, name: `${conv.user2_first_name} ${conv.user2_last_name}`, avatar: conv.user2_avatar };
    }
    return { id: conv.user_1_id, name: `${conv.user1_first_name} ${conv.user1_last_name}`, avatar: conv.user1_avatar };
  };

  const openProfile = (memberId) => navigate(`/members/${memberId}`);

  const sendMessage = async (event) => {
    event?.preventDefault();
    if ((!input.trim() && !attachment) || !activeConv) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', activeConv.id);
      if (input.trim()) formData.append('content', input.trim());
      if (attachment) formData.append('file', attachment);

      const res = await api.post('/messages', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages((prev) => [...prev, res.data]);
      socket?.emit('send_message', { conversation_id: activeConv.id, message: res.data });
      setInput('');
      setAttachment(null);
      void loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSending(false);
    }
  };

  const sendAssistant = async (event) => {
    event.preventDefault();
    if (!assistantInput.trim()) return;

    const userMsg = { role: 'user', content: assistantInput.trim() };
    setAssistantMessages((prev) => [...prev, userMsg]);
    setAssistantInput('');
    setAssistantLoading(true);

    try {
      const res = await api.post('/ai/chat', { messages: [...assistantMessages, userMsg] });
      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: 'Une erreur est survenue. Réessayez.' }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const activeUser = useMemo(() => (activeConv ? getOtherUser(activeConv) : null), [activeConv, user.id]);
  const sidebarHidden = mobile && Boolean(activeConv);

  return (
    <div className="page" style={{ padding: 0, minHeight: 'calc(100dvh - 70px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '320px 1fr', minHeight: 'calc(100dvh - 70px)' }}>
        <aside style={{ display: sidebarHidden ? 'none' : 'flex', flexDirection: 'column', borderRight: mobile ? 'none' : '1px solid var(--border)', background: 'var(--bg-2)' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>Messages</h1>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 8 }}>Conversations privées et dossier en cours.</p>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 24, color: 'var(--text-3)', textAlign: 'center' }}>Aucune conversation</div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherUser(conv);
                const active = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => void selectConversation(conv)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 18px',
                      background: active ? 'rgba(212,168,83,0.08)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar src={other.avatar} name={other.name} size={40} textStyle={{ fontSize: 14 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <strong style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.name}</strong>
                          {conv.unread_count > 0 && <span className="badge badge-pending">{conv.unread_count}</span>}
                        </div>
                        <div style={{ color: 'var(--text-3)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }}>
                          {conv.project_title ? `# ${conv.project_title}` : 'Conversation privée'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg)' }}>
          {activeConv && activeUser ? (
            <>
              <header style={{ padding: 18, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-2)' }}>
                {mobile && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/messages', { replace: true })}>
                    <ArrowLeft size={16} />
                  </button>
                )}

                <button type="button" onClick={() => openProfile(activeUser.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', color: 'inherit', minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <Avatar src={activeUser.avatar} name={activeUser.name} size={40} textStyle={{ fontSize: 14 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{activeUser.name}</div>
                    {activeConv.project_title && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Projet: {activeConv.project_title}</div>}
                  </div>
                </button>

                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAssistant((value) => !value)}>
                  <Bot size={15} /> Assistant
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openProfile(activeUser.id)}>
                  <UserRound size={15} />
                </button>
              </header>

              <section style={{ display: 'grid', gridTemplateColumns: showAssistant && !mobile ? '1fr 320px' : '1fr', minHeight: 0, flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((msg, index) => {
                      const mine = msg.sender_id === user.id;
                      const isImage = msg.file_url && isImageFile(msg.file_url);
                      const attachmentUrl = msg.file_url ? getFileUrl(msg.file_url) : '';

                      return (
                        <div key={msg.id || index} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: mobile ? '92%' : '70%', display: 'flex', gap: 10, flexDirection: mine ? 'row-reverse' : 'row' }}>
                            {!mine && (
                              <button type="button" onClick={() => openProfile(msg.sender_id)} style={{ background: 'none', border: 'none', padding: 0 }}>
                                <Avatar src={msg.avatar_url} name={`${msg.first_name || ''} ${msg.last_name || ''}`} size={30} textStyle={{ fontSize: 12 }} />
                              </button>
                            )}
                            <div style={{ background: mine ? 'linear-gradient(135deg, #d4a853, #8b6914)' : 'var(--bg-2)', border: '1px solid var(--border)', color: mine ? 'white' : 'var(--text)', borderRadius: 14, padding: '12px 14px', display: 'grid', gap: 10 }}>
                              {isImage && (
                                <a href={attachmentUrl} target="_blank" rel="noreferrer">
                                  <img src={attachmentUrl} alt="Image envoyée" style={{ width: '100%', maxWidth: 300, borderRadius: 12, display: 'block' }} />
                                </a>
                              )}
                              {msg.file_url && !isImage && (
                                <a href={attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: mine ? 'white' : 'var(--text)' }}>
                                  <FileText size={16} />
                                  Ouvrir le fichier joint
                                </a>
                              )}
                              {msg.content && <div style={{ lineHeight: 1.5 }}>{msg.content}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={sendMessage} style={{ padding: 18, borderTop: '1px solid var(--border)', background: 'var(--bg-2)', display: 'grid', gap: 12 }}>
                    {attachment && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14 }}>
                        <FileText size={16} style={{ color: 'var(--primary)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</div>
                          <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{(attachment.size / 1024 / 1024).toFixed(2)} Mo</div>
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAttachment(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                      <button type="button" className="btn btn-outline messages-attach-btn" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={16} />
                      </button>
                      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={(event) => {
                        const selected = event.target.files?.[0];
                        if (!selected) return;
                        setAttachment(selected);
                        event.target.value = '';
                      }} style={{ display: 'none' }} />

                      <textarea
                        ref={inputRef}
                        className="input"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Écrire un message..."
                        rows={1}
                        style={{ minHeight: 46, resize: 'none', lineHeight: 1.5 }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void sendMessage();
                          }
                        }}
                      />

                      <button type="submit" className="btn btn-primary messages-attach-btn" disabled={sending || (!input.trim() && !attachment)}>
                        {sending ? <span className="spinner" /> : <Send size={16} />}
                      </button>
                    </div>
                  </form>
                </div>

                {showAssistant && !mobile && (
                  <aside style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ padding: 18, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Bot size={16} style={{ color: 'var(--primary)' }} />
                        <strong>InvestBot</strong>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAssistant(false)}>
                        <X size={15} />
                      </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gap: 10 }}>
                      {assistantMessages.map((message, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '88%', padding: '10px 12px', borderRadius: 14, background: message.role === 'user' ? 'linear-gradient(135deg, #d4a853, #8b6914)' : 'var(--bg-3)', color: message.role === 'user' ? 'white' : 'var(--text)', lineHeight: 1.5 }}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {assistantLoading && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Réflexion en cours...</div>}
                      <div ref={assistantEndRef} />
                    </div>
                    <form onSubmit={sendAssistant} style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                      <input
                        className="input"
                        value={assistantInput}
                        onChange={(event) => setAssistantInput(event.target.value)}
                        placeholder="Posez votre question..."
                      />
                      <button type="submit" className="btn btn-primary btn-sm" disabled={assistantLoading || !assistantInput.trim()}>
                        <Send size={14} />
                      </button>
                    </form>
                  </aside>
                )}
              </section>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', padding: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <MessageSquare size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                <p>Choisissez une conversation</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
