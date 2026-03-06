'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

// We'll use inline styles to match the exactly "lindo" screenshot provided by the user
export default function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        document: '',
        phone: '',
        origemLead: 'DIRETO'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                router.push('/auth/signin?success=true');
            } else {
                setError(result.message || 'Erro ao processar cadastro.');
            }
        } catch (signupErr) {
            setError('Falha na comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                        Criar Conta
                    </h1>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                        lineHeight: 1.5
                    }}>
                        Crie sua conta para gerenciar seus processos jurídicos.
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

                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        name="name"
                        type="text"
                        placeholder="NOME COMPLETO"
                        value={formData.name}
                        onChange={handleChange}
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
                        name="document"
                        type="text"
                        placeholder="CPF / CNPJ"
                        value={formData.document}
                        onChange={handleChange}
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
                        name="phone"
                        type="text"
                        placeholder="WHATSAPP / TELEFONE"
                        value={formData.phone}
                        onChange={handleChange}
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
                        name="email"
                        type="email"
                        placeholder="E-MAIL INSTITUCIONAL"
                        value={formData.email}
                        onChange={handleChange}
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
                        name="password"
                        type="password"
                        placeholder="SENHA DE ACESSO"
                        value={formData.password}
                        onChange={handleChange}
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
                            gap: '12px',
                            marginTop: '12px'
                        }}
                    >
                        {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} /> : (
                            <>
                                CADASTRAR <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '24px 0', opacity: 0.1 }}>
                        <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
                        <span style={{ fontSize: '0.625rem', fontWeight: 900, letterSpacing: '0.2em' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: '#fff' }}></div>
                    </div>

                    <Link
                        href="/auth/signin"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textDecoration: 'none'
                        }}
                    >
                        JÁ POSSUI ACESSO? FAZER LOGIN
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
