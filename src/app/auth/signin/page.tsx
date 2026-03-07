'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SignInContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!searchParams) return;

        if (searchParams.get('error')) {
            setError('Falha na autenticação. Verifique seu e-mail e senha.');
        }
        if (searchParams.get('success')) {
            // Pode mostrar mensagem de "Conta criada" aqui se quiser
        }
    }, [searchParams]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: email.toLowerCase().trim(),
                password: password.trim(),
                redirect: false,
            });

            if (result?.error) {
                console.error("SIGN_IN_ERROR:", result.error);
                setError('Credenciais inválidas ou conta não encontrada.');
                setLoading(false);
            } else {
                // Sincronização forçada para evitar loop de middleware
                router.refresh();
                window.location.href = '/funnels'; // Forçado para funnels como solicitado
            }
        } catch (loginErr) {
            setError('Ocorreu um erro no servidor. Tente novamente.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/funnels' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Efeito de luz ambiente de fundo */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                height: '40vh',
                background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    textAlign: 'center',
                    zIndex: 1
                }}
            >
                <div style={{ marginBottom: '60px' }}>
                    <Link href="/">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            src="/LogoBranco.svg"
                            alt="BBLAW"
                            style={{ height: '120px', width: 'auto', marginBottom: '40px' }}
                        />
                    </Link>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 300,
                        letterSpacing: '-0.02em',
                        marginBottom: '16px',
                        color: 'rgba(255,255,255,0.9)'
                    }}>
                        Acesso <span style={{ fontWeight: 800 }}>Restrito</span>
                    </h1>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.3)',
                        lineHeight: 1.6,
                        maxWidth: '280px',
                        margin: '0 auto'
                    }}>
                        Portal de formulários estratégicos para segurança patrimonial e jurídica.
                    </p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                background: 'rgba(255, 68, 68, 0.05)',
                                border: '1px solid rgba(255, 68, 68, 0.15)',
                                color: '#ff4444',
                                padding: '14px 20px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            type="email"
                            placeholder="E-MAIL INSTITUCIONAL"
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
                                outline: 'none',
                                transition: 'border 0.3s ease'
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            type="password"
                            placeholder="SENHA DE ACESSO"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                outline: 'none',
                                transition: 'border 0.3s ease'
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                        />
                    </div>

                    <Link
                        href="/auth/forgot-password"
                        style={{
                            alignSelf: 'flex-end',
                            fontSize: '0.65rem',
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontWeight: 700,
                            textDecoration: 'none',
                            marginTop: '4px',
                            letterSpacing: '0.05em'
                        }}
                    >
                        ESQUECEU SUA SENHA?
                    </Link>

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
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'CONECTAR ACESSO'}
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '30px 0', opacity: 0.1 }}>
                        <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.4em' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
                    </div>

                    <motion.button
                        type="button"
                        onClick={handleGoogleLogin}
                        whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                        style={{
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '100px',
                            padding: '16px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        AUTH VIA GOOGLE
                    </motion.button>

                    <Link
                        href="/auth/signup"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            marginTop: '32px',
                            transition: 'color 0.3s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                    >
                        AINDA NÃO POSSUI ACESSO? <span style={{ color: '#fff', textDecoration: 'underline' }}>CRIAR CONTA</span>
                    </Link>
                </form>
            </motion.div>

            <footer style={{ marginTop: 'auto', padding: '60px 0', textAlign: 'center', width: '100%', zIndex: 1 }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.15)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.2rem'
                }}>
                    © 2025 BBLAW. EXCELÊNCIA EM SEGURANÇA JURÍDICA.
                </p>
            </footer>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" color="#fff" size={40} />
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
