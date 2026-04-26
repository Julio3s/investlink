import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { io } from 'socket.io-client';

let socket;

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // AI assistant
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'assistant', content: 'Bonjour ! Je suis InvestBot 🤖. Je peux vous aider sur tout ce qui concerne l\'investissement et les projets. Que voulez-vous savoir ?' }]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
    socket = io('/', { auth: { token: localStorage.getItem('token') } });
    socket.emit('join', user.id);
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) selectConv(conv);
    }
  }, [conversationId, conversations]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch { toast.error('Erreur de chargement'); }
  };

  const selectConv = async (conv) => {
    setActiveConv(conv);
    navigate(`/messages/${conv.id}`, { replace: true });
    socket.emit('join_conversation', conv.id);
    try {
      const res = await api.get(`/conversations/${conv.id}/messages`);
      setMessages(res.data);
      loadConversations();
    } catch { toast.error('Erreur'); }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await api.post('/messages', { conversation_id: activeConv.id, content: input });
      setMessages(prev => [...prev, { ...res.data, first_name: user.first_name, last_name: user.last_name }]);
      socket.emit('send_message', { conversation_id: activeConv.id, message: res.data });
      setInput('');
      loadConversations();
    } catch { toast.error('Erreur'); }
    setSending(false);
  };

  const sendAI = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/chat', { messages: [...aiMessages, userMsg] });
      setAiMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch { setAiMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue. Réessayez.' }]); }
    setAiLoading(false);
  };

  const getOtherUser = (conv) => {
    if (conv.user_1_id === user.id) return { name: `${conv.user2_first_name} ${conv.user2_last_name}`, avatar: conv.user2_avatar };
    return { name: `${conv.user1_first_name} ${conv.user1_last_name}`, avatar: conv.user1_avatar };
  };

  return (
    <div className="page" style={{ padding: '24px 0' }}>
      <div className="container" style={{ height: 'calc(100dvh - 120px)' }}>
        <div className="messages-layout">
          {/* Sidebar */}
          <div className="card messages-panel">
            <div className="messages-panel-header" style={{ borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              <MessageSquare size={16} style={{ display: 'inline', marginRight: 8 }} />Messages
            </div>
            <div className="messages-panel-list" style={{ flex: 1 }}>
              {conversations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Aucune conversation</div>
              ) : conversations.map(conv => {
                const other = getOtherUser(conv);
                const isActive = activeConv?.id === conv.id;
                return (
                  <button key={conv.id} onClick={() => selectConv(conv)} style={{
                    width: '100%', textAlign: 'left', padding: '14px 20px',
                    background: isActive ? 'var(--bg-3)' : 'none',
                    border: 'none', borderBottom: '1px solid var(--border)',
                    color: 'var(--text)', cursor: 'pointer',
                    transition: 'background 0.15s',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {other.name?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{other.name}</span>
                          {conv.unread_count > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{conv.unread_count}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.project_title && <span style={{ color: 'var(--primary)', marginRight: 6 }}>#{conv.project_title.slice(0, 15)}</span>}
                          {conv.last_message || 'Conversation démarrée'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat */}
          <div className="card messages-chat">
            {activeConv ? (
              <>
                <div className="messages-chat-header" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                    {getOtherUser(activeConv).name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{getOtherUser(activeConv).name}</div>
                    {activeConv.project_title && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Projet: {activeConv.project_title}</div>}
                  </div>
                </div>
                <div className="messages-chat-body">
                  {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                        {!isMine && (
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {msg.first_name?.[0]}
                          </div>
                        )}
                        <div style={{ maxWidth: '68%' }}>
                          <div style={{
                            padding: '10px 16px',
                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMine ? 'var(--primary)' : 'var(--bg-3)',
                            color: isMine ? 'white' : 'var(--text)',
                            fontSize: 14, lineHeight: 1.5,
                          }}>{msg.content}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                            {msg.created_at && formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                            {isMine && <span style={{ marginLeft: 6 }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendMsg} className="messages-chat-footer" style={{ borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                  <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Écrire un message..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg(e)} />
                  <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
                    {sending ? <span className="spinner" /> : <Send size={16} />}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', gap: 12 }}>
                <MessageSquare size={48} style={{ opacity: 0.2 }} />
                <p style={{ fontSize: 15 }}>Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant floating button */}
      <div className="messages-ai-shell">
        {showAI ? (
          <div className="messages-ai-panel">
            <div className="messages-ai-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
                <Bot size={18} />
                <span style={{ fontWeight: 700 }}>InvestBot</span>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 999 }}>IA</span>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="messages-ai-body" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-3)',
                    color: m.role === 'user' ? 'white' : 'var(--text)', fontSize: 13, lineHeight: 1.5,
                  }}>{m.content}</div>
                </div>
              ))}
              {aiLoading && <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 16, width: 'fit-content' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, background: 'var(--text-3)', borderRadius: '50%', animation: `pulse 1s ${i * 0.3}s ease infinite` }} />)}
              </div>}
              <div ref={aiBottomRef} />
            </div>
            <form onSubmit={sendAI} className="messages-ai-footer" style={{ borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input className="input" value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Posez votre question..." style={{ fontSize: 13 }} />
              <button type="submit" className="btn btn-primary btn-sm" disabled={aiLoading || !aiInput.trim()}><Send size={14} /></button>
            </form>
          </div>
        ) : (
          <button onClick={() => setShowAI(true)} className="btn btn-primary" style={{
            width: 56, height: 56, borderRadius: '50%',
            padding: 0, justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          }}>
            <Bot size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
