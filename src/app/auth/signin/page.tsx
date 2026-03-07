'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            console.log("SIGN_IN_RESULT:", result);

            if (result?.error) {
                console.log("SIGN_IN_ERROR:", result.error);
                setError('Credenciais inválidas.');
                setLoading(false);
            } else {
                console.log("SIGN_IN_SUCCESS: Redirecting to /dashboard");
                window.location.href = '/dashboard';
            }
        } catch (loginErr) {
            setError('Falha na autenticação.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/dashboard' });
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
            padding: '24px',
            position: 'relative'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}
            >
                <div style={{ marginBottom: '48px' }}>
                    <Link href="/">
                        <img
                            src="/LogoBranco.svg"
                            alt="BBLAW"
                            style={{ height: '100px', width: 'auto', marginBottom: '32px' }}
                        />
                    </Link>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        marginBottom: '12px'
                    }}>
                        Acesso Restrito
                    </h1>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                        lineHeight: 1.5
                    }}>
                        Portal de formulários estratégicos para segurança patrimonial.
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.2)',
                        color: '#ff4444',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="email"
                        placeholder="E-MAIL INSTITUCIONAL"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            background: '#050505',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '18px 24px',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em'
                        }}
                    />

                    <input
                        type="password"
                        placeholder="SENHA DE ACESSO"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            background: '#050505',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '18px 24px',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '18px',
                            fontSize: '0.875rem',
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '12px'
                        }}
                    >
                        {loading ? 'PROCESSANDO...' : 'CONECTAR'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '24px 0', opacity: 0.1 }}>
                        <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
                        <span style={{ fontSize: '0.625rem', fontWeight: 900, letterSpacing: '0.2em' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        style={{
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '100px',
                            padding: '14px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            cursor: 'pointer'
                        }}
                    >
                        AUTH GOOGLE
                    </button>

                    <Link
                        href="/auth/signup"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            marginTop: '24px'
                        }}
                    >
                        AINDA NÃO POSSUI ACESSO? CRIAR CONTA
                    </Link>
                </form>
            </motion.div>

            <footer style={{ position: 'absolute', bottom: '40px', textAlign: 'center' }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em'
                }}>
                    © 2025 BBLAW. TODOS OS DIREITOS RESERVADOS.
                </p>
            </footer>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
