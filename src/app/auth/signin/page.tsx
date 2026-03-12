'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function SignInContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!searchParams) return;
        const err = searchParams.get('error');
        if (err) {
            if (err === 'CredentialsSignin') {
                setError('Credenciais inválidas ou acesso não autorizado.');
            } else if (err === 'Configuration') {
                setError('Erro de configuração no servidor de autenticação.');
            } else {
                setError('Ocorreu um erro inesperado. Tente novamente.');
            }
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
                callbackUrl: '/funnels'
            });

            if (result?.error) {
                setError('Verifique seu e-mail e chave de acesso.');
                setLoading(false);
            } else if (result?.ok) {
                window.location.href = result.url || '/funnels';
            }
        } catch (loginErr) {
            setError('Falha na comunicação com o sistema de segurança.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Background Layer */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.012) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255, 255, 255, 0.012) 0.5px, transparent 0.5px)`,
                    backgroundSize: '40px 40px' 
                }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'rgba(255,255,255,0.02)', filter: 'blur(100px)', borderRadius: '50%' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <Link href="/">
                        <motion.img
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            src="/LogoBranco.svg"
                            alt="BBLAW"
                            style={{ height: '52px', margin: '0 auto 2.5rem', display: 'block' }}
                        />
                    </Link>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', fontFamily: 'Outfit, sans-serif', margin: 0 }}>AUTENTICAÇÃO</h1>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5em', fontWeight: 800, marginTop: '8px', margin: 0 }}>SECURE GATEWAY PROTOCOL 3.0</p>
                </div>

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.01)', 
                    border: '0.5px solid rgba(255,255,255,0.05)', 
                    borderRadius: '32px', 
                    padding: '3.5rem 2.5rem 2.5rem',
                    backdropFilter: 'blur(32px)'
                }}>
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{ marginBottom: '2rem', border: '0.5px solid rgba(255,100,100,0.2)', background: 'rgba(255,0,0,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            >
                                <AlertCircle size={14} color="#ff6b6b" />
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ff6b6b' }}>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                                <input
                                    type="email"
                                    placeholder="E-MAIL INSTITUCIONAL"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', backgroundColor: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '16px',
                                        padding: '1.25rem 1rem 1.25rem 3.5rem', fontSize: '0.875rem', fontWeight: 400, letterSpacing: 'normal', textTransform: 'none', color: '#fff', outline: 'none', transition: 'all 0.3s', fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                                    required
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="CHAVE DE ACESSO"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%', backgroundColor: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '16px',
                                        padding: '1.25rem 3.5rem 1.25rem 3.5rem', fontSize: '0.875rem', fontWeight: 400, letterSpacing: 'normal', textTransform: 'none', color: '#fff', outline: 'none', transition: 'all 0.3s', fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.2, background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                         <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                              <Link href="/auth/forgot-password" style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 900, color: 'rgba(255,255,255,0.15)', textDecoration: 'none' }}>
                                Recuperar Chave
                              </Link>
                         </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ 
                                width: '100%', backgroundColor: '#fff', color: '#000', borderRadius: '16px', padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.4s'
                            }}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>ENTRAR NO PORTAL <ArrowRight size={16} /></>
                            )}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', opacity: 0.1 }}>
                            <div style={{ flex: 1, height: '0.5px', background: '#fff' }}></div>
                            <span style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.4em' }}>OU</span>
                            <div style={{ flex: 1, height: '0.5px', background: '#fff' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: '/funnels' })}
                            style={{ 
                                width: '100%', backgroundColor: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.25rem',
                                color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >
                            <img src="https://www.google.com/favicon.ico" style={{ width: '14px', height: '14px', filter: 'grayscale(1) invert(1) brightness(2)' }} alt="" />
                            Acesso Cloud Google
                        </button>

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <Link href="/auth/signup" style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: 900, 
                                color: 'rgba(255,255,255,0.4)', 
                                letterSpacing: '0.15em', 
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                transition: 'color 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                            >
                                Não tem uma conta? <span style={{ color: '#fff', textDecoration: 'underline' }}>Cadastre-se</span>
                            </Link>
                        </div>
                    </form>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                        Protegido por criptografia de ponta a ponta
                    </p>
                </div>
            </motion.div>

            <footer style={{ position: 'fixed', bottom: '2.5rem', textAlign: 'center', width: '100%', zIndex: 10 }}>
                <p style={{ fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', letterSpacing: '1rem', textTransform: 'uppercase', margin: 0 }}>
                    BBLAW • 2025
                </p>
            </footer>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={24} color="rgba(255,255,255,0.2)" className="animate-spin" />
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
