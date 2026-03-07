'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import '@/app/forms.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Acesso negado. Verifique suas credenciais.');
            } else {
                router.refresh();
                window.location.href = '/admin/dashboard';
            }
        } catch (adminLoginErr) {
            console.error('Admin login error:', adminLoginErr);
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="form-card" style={{ maxWidth: '450px', width: '90%' }}>
                <div className="text-center mb-8">
                    <div className="success-icon-wrapper" style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--secondary)', borderRadius: '1.5rem', marginBottom: '1.5rem' }}>
                        <Shield size={40} color="var(--primary)" />
                    </div>
                    <h1 className="form-title" style={{ fontSize: '2rem' }}>Acesso <span className="accent-text">Restrito</span></h1>
                    <p className="form-description">Área administrativa do escritório Bezerra Borges Advogados.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                type="email"
                                className="form-input"
                                style={{ paddingLeft: '3rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                type="password"
                                className="form-input"
                                style={{ paddingLeft: '3rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: 'var(--destructive)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
}
