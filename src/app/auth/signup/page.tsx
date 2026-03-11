'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, User, Mail, Lock, Smartphone, FileText, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

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
            setError('Falha na comunicação com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '16px 20px 16px 50px',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        outline: 'none',
        transition: 'all 0.3s ease'
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
                top: '-15%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                height: '40vh',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 75%)',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    textAlign: 'center',
                    zIndex: 1
                }}
            >
                <div style={{ marginBottom: '40px' }}>
                    <Link href="/auth/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 800, marginBottom: '24px' }}>
                        <ChevronLeft size={16} /> VOLTAR AO LOGIN
                    </Link>
                    <motion.img
                        src="/LogoBranco.svg"
                        alt="BBLAW"
                        style={{ height: '90px', width: 'auto', marginBottom: '24px' }}
                    />
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 300,
                        letterSpacing: '-0.02em',
                        marginBottom: '12px'
                    }}>
                        Crie sua <span style={{ fontWeight: 800 }}>Assinatura</span>
                    </h1>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.3)',
                        lineHeight: 1.5
                    }}>
                        Inicie sua jornada com segurança jurídica de elite.
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
                                padding: '12px 16px',
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

                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="input-field" style={{ position: 'relative' }}>
                        <User size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            className="premium-input"
                            name="name"
                            type="text"
                            placeholder="NOME COMPLETO"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="input-field" style={{ position: 'relative' }}>
                        <FileText size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            className="premium-input"
                            name="document"
                            type="text"
                            placeholder="CPF / CNPJ"
                            value={formData.document}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="input-field" style={{ position: 'relative' }}>
                        <Smartphone size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            className="premium-input"
                            name="phone"
                            type="text"
                            placeholder="WHATSAPP / TELEFONE"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="input-field" style={{ position: 'relative' }}>
                        <Mail size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            className="premium-input"
                            name="email"
                            type="email"
                            placeholder="E-MAIL INSTITUCIONAL"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="input-field" style={{ position: 'relative' }}>
                        <Lock size={14} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                        <input
                            className="premium-input"
                            name="password"
                            type="password"
                            placeholder="SENHA DE ACESSO"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01, background: '#fff', color: '#000' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            borderRadius: '100px',
                            padding: '16px',
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '16px',
                            transition: 'all 0.4s'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'CRIAR ACESSO AGORA'}
                    </motion.button>
                </form>
            </motion.div>

            <footer style={{ marginTop: 'auto', padding: '40px 0', textAlign: 'center', width: '100%', zIndex: 1 }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.15)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.2rem'
                }}>
                    © 2025 BBLAW. EXCELÊNCIA JURÍDICA NACIONAL.
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
                
                /* HACK PARA REMOVER FUNDO BRANCO DO AUTOFILL NO CHROME */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #080808 inset !important;
                    -webkit-text-fill-color: white !important;
                }

                .premium-input:focus {
                    border-color: rgba(255,255,255,0.3) !important;
                    background: rgba(255,255,255,0.05) !important;
                }
            `}</style>
        </div>
    );
}
