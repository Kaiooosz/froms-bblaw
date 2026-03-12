'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Send, 
    Bot, 
    User, 
    ChevronLeft, 
    Loader2, 
    Sparkles,
    ShieldCheck,
    Lock,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: `Encontre a configuração de negócio perfeita para você. Obtenha orientação personalizada sobre estrutura empresarial, implicações fiscais e requisitos legais.` 
        }
    ]);
    const [suggestions, setSuggestions] = useState<string[]>([
        "Quais documentos preciso enviar?",
        "Ajude-me a escolher a estrutura empresarial correta.",
        "Qual a diferença entre uma LLC e uma corporação?",
        "Como posso proteger meu patrimônio pessoal?"
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const submitMessage = async (msgText: string) => {
        if (!msgText.trim() || isTyping) return;

        const historySnapshot = [...messages];
        setMessages(prev => [...prev, { role: 'user', content: msgText }]);
        setIsTyping(true);
        setSuggestions([]);

        // Adiciona mensagem vazia do assistente para streaming
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msgText,
                    history: historySnapshot
                })
            });

            if (!res.ok) throw new Error('Falha na comunicação com o servidor');
            if (!res.body) throw new Error('Sem corpo na resposta');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6).trim();
                    if (raw === '[DONE]') break;

                    try {
                        const event = JSON.parse(raw);
                        if (event.type === 'chunk' && event.content) {
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    content: updated[updated.length - 1].content + event.content
                                };
                                return updated;
                            });
                            scrollToBottom();
                        }
                    } catch {
                        // ignora linhas mal formatadas
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: "Desculpe, não consegui processar sua pergunta. Tente novamente."
                };
                return updated;
            });
        } finally {
            setIsTyping(false);
            scrollToBottom();
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMsg = input;
        setInput('');
        await submitMessage(userMsg);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>
            
            {/* Background Layer */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.015) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0.5px, transparent 0.5px)`,
                    backgroundSize: '50px 50px' 
                }} />
                <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '300px', background: 'rgba(255,255,255,0.02)', filter: 'blur(150px)', borderRadius: '50%' }} />
            </div>

            {/* Header */}
            <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(32px)', borderBottom: '0.5px solid rgba(255,255,255,0.05)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link href="/funnels" style={{ width: '40px', height: '40px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }}>
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h1 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', margin: 0 }}>NÚCLEO ESTRATÉGICO <span style={{ opacity: 0.3 }}>BBLAW</span></h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '100px' }}>
                                <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: '0.45rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>IA EM OPERAÇÃO</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginTop: '4px', margin: 0 }}>SISTEMA DE APOIO À DECISÃO DE ALTO PADRÃO</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ textAlign: 'right', display: 'none' }} className="sm-flex">
                        <p style={{ fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>{session?.user?.name || 'OPERADOR ESTRATEGISTA'}</p>
                        <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '2px', margin: 0 }}>CONEXÃO CRIPTOGRAFADA</p>
                     </div>
                     <div style={{ width: '40px', height: '40px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                        <Lock size={14} color="rgba(255,255,255,0.3)" />
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }} className="scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: 'flex', gap: '1.5rem', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
                        >
                            <div style={{ 
                                width: '48px', height: '48px', borderRadius: '16px', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                background: msg.role === 'assistant' ? '#fff' : 'rgba(255,255,255,0.05)',
                                color: msg.role === 'assistant' ? '#000' : 'rgba(255,255,255,0.3)',
                                boxShadow: msg.role === 'assistant' ? '0 0 30px rgba(255,255,255,0.1)' : 'none'
                             }}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div style={{ 
                                padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid', fontSize: '0.95rem', lineHeight: 1.6, letterSpacing: '-0.01em',
                                background: msg.role === 'user' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                                borderColor: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                                color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                                borderTopRightRadius: msg.role === 'user' ? '0' : '16px',
                                borderTopLeftRadius: msg.role === 'assistant' ? '0' : '16px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <Loader2 size={16} color="rgba(255,255,255,0.2)" className="animate-spin" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>BBLAW INTEL ENGINE</span>
                            <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }} className="animate-pulse">Cruzando dados e ativos estratégicos...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Footer */}
            <footer style={{ padding: '2.5rem 2rem 4rem', maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'sticky', bottom: 0, zIndex: 50 }}>
                
                <AnimatePresence>
                    {suggestions.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ 
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' 
                            }}
                        >
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => submitMessage(suggestion)}
                                    type="button"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem 1.5rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: '0.85rem', fontWeight: 500,
                                        textAlign: 'left', cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                    }}
                                >
                                    <MessageSquare size={16} color="rgba(255,255,255,0.4)" />
                                    {suggestion}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSend} style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte qualquer coisa sobre entidades comerciais..."
                        style={{ 
                            width: '100%', backgroundColor: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', 
                            padding: '1.5rem 5rem 1.5rem 2rem', fontSize: '1rem', color: '#fff', outline: 'none', transition: 'all 0.5s',
                            boxShadow: '0 10px 30px -15px rgba(0,0,0,0.5)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        style={{ 
                            position: 'absolute', right: '12px', top: '12px', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            transition: 'all 0.5s', border: 'none', cursor: 'pointer',
                            background: input.trim() ? '#fff' : 'rgba(255,255,255,0.05)',
                            color: input.trim() ? '#000' : 'rgba(255,255,255,0.1)',
                            opacity: input.trim() ? 1 : 0.5,
                            transform: input.trim() ? 'scale(1)' : 'scale(0.95)'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </form>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                        Este chat de IA não fornece aconselhamento jurídico ou fiscal.
                    </span>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @media (min-width: 640px) { .sm-flex { display: block !important; } }
            `}</style>
        </div>
    );
}
