
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, PhoneCall } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: 'Olá! Sou o assistente da AQUI TEM Angola. Como posso ajudar nas suas compras de eletrónicos ou tirar dúvidas sobre entregas e garantias em Luanda e províncias?',
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickSuggestions = [
    'Quais os preços dos fones Oraimo?',
    'Como funciona a entrega em Luanda?',
    'Quais as formas de pagamento?',
    'Gostaria de falar no WhatsApp'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessageText = async (textToSend) => {
    const userText = textToSend || input;
    if (!userText.trim() || isLoading) return;

    if (!textToSend) setInput('');

    const currentHistory = [...messages];
    const userMessage = { text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const botMessagePlaceholder = { text: '', sender: 'bot' };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: currentHistory.slice(-6)
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Falha na resposta');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.substring(6).trim();
            if (rawData === '[DONE]') break;

            try {
              const data = JSON.parse(rawData);
              if (data.text) {
                accumulatedText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].sender === 'bot') {
                    updated[lastIdx] = { ...updated[lastIdx], text: accumulatedText };
                  }
                  return updated;
                });
              }
            } catch (e) {
              // ignore partial chunk json errors
            }
          }
        }
      }

      if (!accumulatedText) {
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].sender === 'bot') {
            updated[lastIdx] = {
              text: 'Olá! Como posso ajudar com os nossos produtos Oraimo, eletrodomésticos ou entregas em Angola? Pode também contactar-nos no WhatsApp pelo 950752933.',
              sender: 'bot'
            };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].sender === 'bot') {
          updated[lastIdx] = {
            text: 'Temos atendimento direto no WhatsApp 950752933 para pedidos e dúvidas rápidas. Como posso ajudar?',
            sender: 'bot'
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessageText();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #FF6500, #F37021)',
            color: '#FFF',
            padding: '14px 20px',
            borderRadius: '30px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 101, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 800,
            fontSize: '0.95rem',
            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={22} />
          <span>Atendimento IA</span>
        </button>
      ) : (
        <div
          style={{
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 100px)',
            background: 'var(--bg-card, #FFFFFF)',
            color: 'var(--text-main, #1F2937)',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-light, #E5E7EB)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E5C9E, #FF6500)',
              color: '#FFF',
              padding: '16px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center'
                }}
              >
                <Bot size={20} color="#FFF" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  AQUI TEM Assistente
                  <Sparkles size={14} color="#FFD700" />
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Suporte & Vendas em Angola</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#FFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                {m.sender === 'bot' && (
                  <div
                    style={{
                      background: 'rgba(255,101,0,0.1)',
                      color: '#FF6500',
                      borderRadius: '50%',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      shrink: 0
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #FF6500, #F37021)' : 'var(--bg-body, #F3F4F6)',
                    color: m.sender === 'user' ? '#FFF' : 'var(--text-main, #1F2937)',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  {m.text || (isLoading && i === messages.length - 1 ? 'A responder...' : '')}
                </div>

                {m.sender === 'user' && (
                  <div
                    style={{
                      background: 'var(--border-light, #E5E7EB)',
                      borderRadius: '50%',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      shrink: 0
                    }}
                  >
                    <User size={14} color="#6B7280" />
                  </div>
                )}
              </div>
            ))}

            {/* Quick Suggestions Chips (when message count is low) */}
            {messages.length <= 2 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessageText(sug)}
                    style={{
                      background: 'rgba(30, 92, 158, 0.08)',
                      border: '1px solid rgba(30, 92, 158, 0.2)',
                      color: '#1E5C9E',
                      borderRadius: '16px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30, 92, 158, 0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(30, 92, 158, 0.08)')}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick WhatsApp bar */}
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(37, 211, 102, 0.08)',
              borderTop: '1px solid var(--border-light, #E5E7EB)',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              fontSize: '0.78rem'
            }}
          >
            <span style={{ color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneCall size={12} /> WhatsApp: 950752933
            </span>
            <a
              href="https://wa.me/244950752933?text=Olá%20Aqui%20Tem!%20Gostaria%20de%20atendimento%20humano."
              target="_blank"
              rel="noreferrer"
              style={{ color: '#15803D', fontWeight: 800, textDecoration: 'underline' }}
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Input Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderTop: '1px solid var(--border-light, #E5E7EB)',
              background: 'var(--bg-card, #FFF)',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Digite a sua dúvida..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--border-light, #D1D5DB)',
                borderRadius: '24px',
                fontSize: '0.88rem',
                outline: 'none',
                background: 'var(--bg-body, #F9FAFB)',
                color: 'var(--text-main, #1F2937)'
              }}
            />
            <button
              onClick={() => sendMessageText()}
              disabled={isLoading || !input.trim()}
              style={{
                background: isLoading || !input.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #FF6500, #F37021)',
                color: isLoading || !input.trim() ? '#9CA3AF' : '#FFF',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease',
                shrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

