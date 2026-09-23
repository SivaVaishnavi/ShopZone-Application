import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const isAdmin = user?.usertype === 'Admin';
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const getInitialMessages = () => {
    if (isAdmin) {
      return [
        {
          role: 'model',
          text: `🛡️ **Welcome Admin ${user?.username || ''}!**\nI'm your ShopZe Executive AI Copilot. Ask me about store analytics, sales orders, product stock, or customer metrics.`,
        },
      ];
    }
    return [
      {
        role: 'model',
        text: `🛍️ **Hi ${user?.username ? user.username : 'there'}!**\nI'm your ShopZe AI Assistant. Ask me about our latest products, discount deals, or tracking your order!`,
      },
    ];
  };

  const [messages, setMessages] = useState(getInitialMessages);

  // Re-initialize message greeting when user role changes
  useEffect(() => {
    setMessages(getInitialMessages());
  }, [user?.usertype, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  const adminChips = [
    '📊 Store Overview',
    '🚚 Recent Orders',
    '🏷️ Catalog Summary',
    '👥 User Metrics',
  ];

  const customerChips = [
    '🔥 Discount Deals',
    '📦 Track My Order',
    '🛍️ Product Categories',
    '🚚 Shipping Info',
  ];

  const currentChips = isAdmin ? adminChips : customerChips;

  const sendMessageText = async (text) => {
    if (!text || !text.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text,
      }));

      // Pass authorization header automatically handled by axios interceptor or explicitly
      const { data } = await api.post('/chat', { message: text, history });

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Sorry, I'm having trouble connecting right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `⚠️ ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessageText(input.trim());
  };

  const handleChipClick = (chipText) => {
    sendMessageText(chipText);
  };

  const handleClearChat = () => {
    setMessages(getInitialMessages());
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Basic bold parsing: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} style={{ margin: '0.2rem 0', minHeight: '1em' }}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className={`chat-window ${isAdmin ? 'admin-mode' : 'customer-mode'}`}>
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-title">
                {isAdmin ? '🛡️ Admin Copilot' : '🛍️ ShopZe AI Assistant'}
              </span>
              <span className="chat-badge">
                {isAdmin ? 'Admin Mode' : user ? 'Customer Mode' : 'Guest'}
              </span>
            </div>
            <div className="chat-header-actions">
              <button className="chat-icon-btn" onClick={handleClearChat} title="Clear conversation">
                🗑️
              </button>
              <button className="chat-close-btn" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.role === 'user' ? 'chat-user' : 'chat-bot'}`}
              >
                {renderFormattedText(m.text)}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bot typing-indicator">
                <span>.</span><span>.</span><span>.</span> AI is thinking
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="chat-chips-container">
            {currentChips.map((chip, idx) => (
              <button
                key={idx}
                className="chat-chip"
                onClick={() => handleChipClick(chip)}
                disabled={loading}
              >
                {chip}
              </button>
            ))}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={isAdmin ? "Ask admin analytics, stock, orders..." : "Ask about products, deals, orders..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className={`chat-toggle-btn ${isAdmin ? 'admin-btn' : ''}`}
        onClick={() => setOpen(!open)}
        title={open ? "Close Chat" : "Open ShopZe AI Assistant"}
      >
        {open ? '✕' : isAdmin ? '🛡️' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;