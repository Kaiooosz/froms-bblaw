'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // Mesmo que falhe ou tenha erro, mostramos "Enviado" por privacidade/segurança
            setSent(true);
        } catch (err) {
            console.error(err);
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                        <CheckCircle2 size={40} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>Instruções Enviadas</h1>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '40px' }}>
                        Verifique a caixa de entrada de <strong>{email}</strong>. Se houver uma conta associada, você receberá o link para criar sua nova senha.
                    </p>
                    <Link href="/auth/signin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: '#fff', color: '#000', borderRadius: '100px', fontWeight: 900, fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.05em' }}>
                        VOLTAR PARA LOGIN
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '40vh', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', zIndex: 0 }} />

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '420px', textAlign: 'center', zIndex: 1 }}>
                <div style={{ marginBottom: '48px' }}>
                    <Link href="/auth/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 800, marginBottom: '32px', transition: 'color 0.3s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#fff')} onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                        <ChevronLeft size={16} /> VOLTAR AO ACESSO
                    </Link>
                    <h1 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '16px' }}>Recuperar <span style={{ fontWeight: 800 }}>Senha</span></h1>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.3)', lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>Insira seu e-mail e enviaremos um token seguro para redefinir seu acesso.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            type="email"
                            placeholder="E-MAIL DE CADASTRO"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '14px',
                                padding: '18px 20px 18px 50px',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01, background: '#fff', color: '#000' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.8)',
                            borderRadius: '100px',
                            padding: '18px',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '20px',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'ENVIAR INSTRUÇÕES'}
                    </motion.button>
                </form>

                <p style={{ marginTop: '48px', fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.15)', fontWeight: 700, letterSpacing: '0.2rem' }}>
                    SISTEMA DE SEGURANÇA BBLAW
                </p>
            </motion.div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #080808 inset !important;
                    -webkit-text-fill-color: white !important;
                }
            `}</style>
        </div>
    );
}
