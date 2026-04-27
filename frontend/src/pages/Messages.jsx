import { useEffect, useRef, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 600);
  const [composerFocused, setComposerFocused] = useState(false);
  const [aiComposerFocused, setAiComposerFocused] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const bottomRef = useRef(null);
  const composerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis InvestBot. Je peux vous aider sur l'investissement et les projets. Que voulez-vous savoir ?",
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const updateViewport = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardOffset(offset);
    };

    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);

    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
    };
  }, []);

  useEffect(() => {
    const shouldHideMobileNav = isMobile && (composerFocused || aiComposerFocused);
    document.body.classList.toggle('mobile-keyboard-open', shouldHideMobileNav);

    return () => {
      document.body.classList.remove('mobile-keyboard-open');
    };
  }, [aiComposerFocused, composerFocused, isMobile]);

  useEffect(() => {
    loadConversations();
    socket = io('/', { auth: { token: localStorage.getItem('token') } });
    socket.emit('join', user.id);
    socket.on('new_message', (msg) => {
      setMessages((prev) => (prev.some((existing) => existing.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => {
      socket.disconnect();
    };
  }, [user.id]);

  useEffect(() => {
    if (!conversationId) {
      setActiveConv(null);
      setMessages([]);
      return;
    }

    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      void selectConv(conversation, { skipNavigation: true });
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    inputElement.style.height = '0px';
    inputElement.style.height = `${Math.min(inputElement.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (!isMobile || (!composerFocused && !aiComposerFocused)) return undefined;

    const timeout = window.setTimeout(() => {
      composerRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
      bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [aiComposerFocused, composerFocused, isMobile, keyboardOffset, showAI]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch {
      toast.error('Erreur de chargement');
    }
  };

  const selectConv = async (conv, options = {}) => {
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

  const backToList = () => {
    setActiveConv(null);
    setMessages([]);
    navigate('/messages', { replace: true });
  };

  const handleAttachmentChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setAttachment(selectedFile);
    event.target.value = '';
  };

  const sendMsg = async (event) => {
    event?.preventDefault();
    if ((!input.trim() && !attachment) || !activeConv) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', activeConv.id);
      if (input.trim()) formData.append('content', input.trim());
      if (attachment) formData.append('file', attachment);

      const res = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages((prev) => [...prev, res.data]);
      socket?.emit('send_message', { conversation_id: activeConv.id, message: res.data });
      setInput('');
      setAttachment(null);
      void loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
    setSending(false);
  };

  const sendAI = async (event) => {
    event.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', content: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await api.post('/ai/chat', { messages: [...aiMessages, userMsg] });
      setAiMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desole, une erreur est survenue. Reessayez.' },
      ]);
    }
    setAiLoading(false);
  };

  const getOtherUser = (conv) => {
    if (conv.user_1_id === user.id) {
      return {
        id: conv.user_2_id,
        name: `${conv.user2_first_name} ${conv.user2_last_name}`,
        avatar: conv.user2_avatar,
      };
    }

    return {
      id: conv.user_1_id,
      name: `${conv.user1_first_name} ${conv.user1_last_name}`,
      avatar: conv.user1_avatar,
    };
  };

  const openMemberProfile = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const activeConversationUser = activeConv ? getOtherUser(activeConv) : null;
  const mobileConversationOpen = isMobile && Boolean(activeConv);
  const aiShellBottom = isMobile ? Math.max(12, keyboardOffset + 12) : 24;

  return (
    <div className={`page ${isMobile && (composerFocused || aiComposerFocused) ? 'page-keyboard-active' : ''}`} style={{ padding: '24px 0' }}>
      <div className="container" style={{ minHeight: isMobile ? 'calc(100dvh - 148px)' : 'calc(100dvh - 120px)' }}>
        <div className="messages-layout">
          <div className="card messages-panel" style={{ display: mobileConversationOpen ? 'none' : undefined }}>
            <div className="messages-panel-header" style={{ borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              <MessageSquare size={16} style={{ display: 'inline', marginRight: 8 }} />
              Messages
            </div>
            <div className="messages-panel-list" style={{ flex: 1 }}>
              {conversations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
                  Aucune conversation
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const isActive = activeConv?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => void selectConv(conv)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 20px',
                        background: isActive ? 'var(--bg-3)' : 'none',
                        border: 'none',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar
                          src={other.avatar}
                          name={other.name}
                          size={38}
                          textStyle={{ fontSize: 14 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {other.name}
                            </span>
                            {conv.unread_count > 0 && (
                              <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.project_title && (
                              <span style={{ color: 'var(--primary)', marginRight: 6 }}>
                                #{conv.project_title.slice(0, 15)}
                              </span>
                            )}
                            {conv.last_message || 'Conversation demarree'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="card messages-chat" style={{ display: isMobile && !activeConv ? 'none' : undefined }}>
            {activeConv && activeConversationUser ? (
              <>
                <div className="messages-chat-header" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isMobile && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={backToList} style={{ paddingInline: 10 }}>
                      <ArrowLeft size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="messages-contact-btn"
                    onClick={() => openMemberProfile(activeConversationUser.id)}
                  >
                    <Avatar
                      src={activeConversationUser.avatar}
                      name={activeConversationUser.name}
                      size={36}
                      textStyle={{ fontSize: 14 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{activeConversationUser.name}</div>
                      {activeConv.project_title && (
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                          Projet: {activeConv.project_title}
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openMemberProfile(activeConversationUser.id)}
                    style={{ marginLeft: 'auto', paddingInline: 12 }}
                  >
                    <UserRound size={15} />
                    <span className="mobile-hide">Profil</span>
                  </button>
                </div>

                <div className="messages-chat-body">
                  {messages.map((msg, index) => {
                    const isMine = msg.sender_id === user.id;
                    const hasImage = msg.file_url && isImageFile(msg.file_url);
                    const hasFile = msg.file_url && !hasImage;
                    const attachmentUrl = msg.file_url ? getFileUrl(msg.file_url) : '';

                    return (
                      <div
                        key={msg.id || index}
                        style={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                          gap: 8,
                          alignItems: 'flex-end',
                        }}
                      >
                        {!isMine && (
                          <button
                            type="button"
                            onClick={() => openMemberProfile(msg.sender_id)}
                            style={{ background: 'none', border: 'none', padding: 0 }}
                          >
                            <Avatar
                              src={msg.avatar_url}
                              name={`${msg.first_name || ''} ${msg.last_name || ''}`}
                              size={30}
                              textStyle={{ fontSize: 12 }}
                            />
                          </button>
                        )}

                        <div style={{ maxWidth: isMobile ? '88%' : '68%' }}>
                          <div
                            style={{
                              padding: '10px 16px',
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              background: isMine ? 'var(--primary)' : 'var(--bg-3)',
                              color: isMine ? 'white' : 'var(--text)',
                              fontSize: 14,
                              lineHeight: 1.5,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: hasImage || hasFile ? 10 : 0,
                            }}
                          >
                            {hasImage && (
                              <a href={attachmentUrl} target="_blank" rel="noreferrer">
                                <img
                                  src={attachmentUrl}
                                  alt="Image envoyee"
                                  style={{
                                    width: '100%',
                                    maxWidth: 280,
                                    borderRadius: 12,
                                    display: 'block',
                                    objectFit: 'cover',
                                  }}
                                />
                              </a>
                            )}

                            {hasFile && (
                              <a
                                href={attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="messages-file-card"
                                style={{
                                  color: isMine ? 'white' : 'var(--text)',
                                  background: isMine ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                                }}
                              >
                                <FileText size={18} />
                                <span style={{ fontSize: 13, fontWeight: 600 }}>
                                  Ouvrir le fichier joint
                                </span>
                              </a>
                            )}

                            {msg.content && <div>{msg.content}</div>}
                          </div>

                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                            {msg.created_at &&
                              formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                            {isMine && <span style={{ marginLeft: 6 }}>{msg.is_read ? 'vu' : 'envoye'}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={sendMsg} className="messages-chat-footer" style={{ borderTop: '1px solid var(--border)' }}>
                  {attachment && (
                    <div className="messages-attachment-pill">
                      <FileText size={16} style={{ color: 'var(--primary)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {attachment.name}
                        </div>
                        <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
                          {(attachment.size / 1024 / 1024).toFixed(2)} Mo
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setAttachment(null)}
                        style={{ paddingInline: 10 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div ref={composerRef} className="messages-chat-footer__main">
                    <button
                      type="button"
                      className="btn btn-outline messages-attach-btn"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Joindre un fichier"
                    >
                      <Paperclip size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      onChange={handleAttachmentChange}
                      style={{ display: 'none' }}
                    />

                    <textarea
                      ref={inputRef}
                      className="input messages-composer"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Ecrire un message..."
                      rows={1}
                      onFocus={() => setComposerFocused(true)}
                      onBlur={() => setComposerFocused(false)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          void sendMsg();
                        }
                      }}
                    />

                    <button type="submit" className="btn btn-primary messages-attach-btn" disabled={sending || (!input.trim() && !attachment)}>
                      {sending ? <span className="spinner" /> : <Send size={16} />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', gap: 12 }}>
                <MessageSquare size={48} style={{ opacity: 0.2 }} />
                <p style={{ fontSize: 15 }}>Selectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="messages-ai-shell" style={{ bottom: aiShellBottom, right: isMobile ? 12 : 24, left: isMobile ? 12 : 'auto' }}>
        {showAI ? (
          <div className="messages-ai-panel">
            <div className="messages-ai-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
                <Bot size={18} />
                <span style={{ fontWeight: 700 }}>InvestBot</span>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 999 }}>IA</span>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="messages-ai-body" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiMessages.map((message, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: message.role === 'user' ? 'var(--primary)' : 'var(--bg-3)',
                      color: message.role === 'user' ? 'white' : 'var(--text)',
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 16, width: 'fit-content' }}>
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      style={{
                        width: 6,
                        height: 6,
                        background: 'var(--text-3)',
                        borderRadius: '50%',
                        animation: `pulse 1s ${index * 0.3}s ease infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              <div ref={aiBottomRef} />
            </div>

            <form onSubmit={sendAI} className="messages-ai-footer" style={{ borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="Posez votre question..."
                style={{ fontSize: isMobile ? 16 : 13 }}
                onFocus={() => setAiComposerFocused(true)}
                onBlur={() => setAiComposerFocused(false)}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={aiLoading || !aiInput.trim()}>
                <Send size={14} />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowAI(true)}
            className="btn btn-primary"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              padding: 0,
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
              pointerEvents: 'auto',
            }}
          >
            <Bot size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
