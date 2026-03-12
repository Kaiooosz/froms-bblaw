"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2, X, MessageSquareHeart } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedDocs?: string[];
  streaming?: boolean;
}

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          cursor: 'pointer',
          zIndex: 9999,
          border: 'none',
        }}
      >
        <MessageSquareHeart size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ChatWindow onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o Consultor de Inteligência Jurídica e Financeira da BBLAW. Como posso ajudar com seu planejamento patrimonial hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    const msgId = (Date.now() + 1).toString();

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Falha ao conectar ao consultor de IA.');
      }

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { id: msgId, role: 'assistant', content: '', streaming: true }]);
      setIsLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);

            if (parsed.type === 'docs') {
              setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, recommendedDocs: parsed.recommended_docs } : m
              ));
            } else if (parsed.type === 'chunk') {
              setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, content: m.content + parsed.content } : m
              ));
            } else if (parsed.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, content: 'Desculpe, ocorreu um erro ao processar sua mensagem.', streaming: false } : m
              ));
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      // Mark streaming done
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, streaming: false } : m
      ));

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessages(prev => {
        const hasMsg = prev.some(m => m.id === msgId);
        if (hasMsg) {
          return prev.map(m => m.id === msgId
            ? { ...m, content: 'Desculpe, não consegui me conectar ao servidor. Tente novamente em instantes.', streaming: false }
            : m
          );
        }
        return [...prev, {
          id: msgId,
          role: 'assistant',
          content: 'Desculpe, não consegui me conectar ao servidor. Tente novamente em instantes.',
        }];
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      style={{
        position: 'fixed',
        bottom: '6rem',
        right: '2rem',
        width: '400px',
        maxWidth: 'calc(100vw - 4rem)',
        height: '600px',
        maxHeight: 'calc(100vh - 8rem)',
        backgroundColor: '#0a0a0a',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 100px rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#000" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Consultor BBLAW
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00ff00', boxShadow: '0 0 10px #00ff00' }} />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollBehavior: 'smooth' }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              maxWidth: '85%',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.25rem' }}>
                  <Bot size={14} color="#fff" />
                </div>
              )}

              <div style={{
                backgroundColor: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.05)',
                color: msg.role === 'user' ? '#000' : '#fff',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                fontWeight: 500,
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                  {msg.streaming && (
                    <span style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '1em',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      marginLeft: '2px',
                      verticalAlign: 'text-bottom',
                      animation: 'blink 1s step-end infinite',
                    }} />
                  )}
                </div>

                {/* Document CTAs — só aparece quando o streaming terminar */}
                {!msg.streaming && msg.recommendedDocs && msg.recommendedDocs.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem', fontWeight: 700 }}>
                      Materiais disponíveis no portal
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {msg.recommendedDocs.map((doc, i) => (
                        <a
                          key={i}
                          href="/dashboard"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '0.6rem 0.85rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, lineHeight: 1.4 }}>
                            {doc}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            Ver →
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Loading spinner — só enquanto aguarda o primeiro chunk */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="#fff" />
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Loader2 size={16} color="rgba(255,255,255,0.5)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Cursor blink keyframe injected once */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {/* Input */}
      <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre offshore, tributação, cidadanias..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '1rem 3.5rem 1rem 1.5rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              position: 'absolute',
              right: '0.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: input.trim() ? '#fff' : 'transparent',
              color: input.trim() ? '#000' : 'rgba(255,255,255,0.2)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.3s'
            }}
          >
            <Send size={18} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
