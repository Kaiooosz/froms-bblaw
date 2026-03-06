'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import '@/app/forms.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simular envio. Em produção, conectaria com Resend/SendGrid e dispararia o token para o DB.
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1500);
    };

    if (sent) {
        return (
            <div className="form-page-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="form-card" style={{ maxWidth: '480px', textAlign: 'center' }}>
                    <div className="success-icon-wrapper" style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--secondary)', borderRadius: '2rem', marginBottom: '2rem' }}>
                        <CheckCircle2 size={60} color="var(--primary)" />
                    </div>
                    <h1 className="form-title">E-mail <span className="accent-text">Enviado!</span></h1>
                    <p className="form-description">
                        Se uma conta existir para <strong>{email}</strong>, você receberá um link de redefinição de senha em alguns minutos.
                    </p>
                    <Link href="/auth/signin" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Voltar para Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="form-page-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="form-card" style={{ maxWidth: '480px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link href="/auth/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '2rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                    <h1 className="form-title" style={{ fontSize: '2rem' }}>Recuperar <span className="accent-text">Senha</span></h1>
                    <p className="form-description">Digite seu e-mail abaixo e enviaremos instruções para criar uma nova senha.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Seu Melhor E-mail</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="email"
                                className="form-input"
                                style={{ paddingLeft: '3.5rem' }}
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Enviar Instruções'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
