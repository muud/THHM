import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatOverlayProps {
  externalOpen?: boolean;
  setExternalOpen?: (open: boolean) => void;
}

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ externalOpen, setExternalOpen }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your TrueHealth Smart Assistant. How can I help you with your care today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = setExternalOpen || setInternalOpen;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/core/ai-assistant/', {
        method: 'POST',
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="chat-header">
            <div className="header-info">
              <div className="online-indicator" />
              <h3>TrueHealth Assistant</h3>
            </div>
            <span className="ai-badge">SMART AI</span>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {loading && (
              <div className="message-row ai">
                <div className="message-bubble typing">
                  <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Type your health question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        .ai-chat-toggle {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #d12c5b;
          color: white;
          border: none;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 10px 25px rgba(209, 44, 91, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .ai-chat-toggle:hover {
          transform: scale(1.1) translateY(-5px);
          box-shadow: 0 15px 30px rgba(209, 44, 91, 0.5);
        }

        .ai-chat-window {
          position: fixed;
          bottom: 7rem;
          right: 2rem;
          width: 380px;
          height: 550px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chat-header {
          padding: 1.5rem;
          background: #1e3a8a;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .online-indicator {
          width: 10px;
          height: 10px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10B981;
        }

        .ai-badge {
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
        }

        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message-row {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }

        .message-row.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-row.ai {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-bubble {
          padding: 0.875rem 1.125rem;
          border-radius: 18px;
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .user .message-bubble {
          background: #d12c5b;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .ai .message-bubble {
          background: #F1F5F9;
          color: #1e3a8a;
          border-bottom-left-radius: 4px;
        }

        .message-time {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.4rem;
        }

        .chat-input-area {
          padding: 1.25rem;
          border-top: 1px solid #F1F5F9;
          display: flex;
          gap: 0.75rem;
        }

        .chat-input-area input {
          flex: 1;
          border: 2px solid #F1F5F9;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-family: inherit;
          font-size: 0.9375rem;
          transition: all 0.3s;
        }

        .chat-input-area input:focus {
          outline: none;
          border-color: #d12c5b;
        }

        .chat-input-area button {
          background: #1e3a8a;
          color: white;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .chat-input-area button:hover:not(:disabled) {
          transform: scale(1.05);
          background: #d12c5b;
        }

        .chat-input-area button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .typing .dot {
          animation: blink 1s infinite;
          margin: 0 1px;
        }
        .typing .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AIChatOverlay;
