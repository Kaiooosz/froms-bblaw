import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams ? searchParams.get('token') : null;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Link de redefinição inválido ou expirado.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/auth/signin'), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Erro ao redefinir senha.');
            }
        } catch (err) {
            setError('Falha na comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <CheckCircle2 size={64} style={{ color: '#fff', marginBottom: '1.5rem', opacity: 0.8 }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Senha Alterada!</h1>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>Sua nova senha foi salva com sucesso. Você será redirecionado para o login.</p>
                    <Link href="/auth/signin" style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '14px 40px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none', fontSize: '0.8rem' }}>FAZER LOGIN AGORA</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ marginBottom: '40px' }}>
                    <img src="/LogoBranco.svg" alt="BBLAW" style={{ height: '80px', width: 'auto', marginBottom: '32px' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>Nova Senha</h1>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.5 }}>Crie uma nova credencial de acesso forte para sua conta.</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', padding: '12px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <ShieldAlert size={16} /> {error}
                    </div>
                )}

                {!token ? (
                    <Link href="/auth/forgot-password" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '14px 32px', borderRadius: '100px', fontWeight: 800, textDecoration: 'none', fontSize: '0.8rem' }}>SOLICITAR NOVO LINK</Link>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="NOVA SENHA"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', background: '#050505', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '18px 24px 18px 50px', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', outline: 'none' }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', opacity: 0.3, cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input
                                type="password"
                                placeholder="CONFIRMAR NOVA SENHA"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{ width: '100%', background: '#050505', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '18px 24px 18px 50px', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', outline: 'none' }}
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '100px', padding: '18px', fontSize: '0.875rem', fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', transition: 'opacity 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')} onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'SALVAR E CONTINUAR'}
                        </button>
                    </form>
                )}
            </motion.div>

            <footer style={{ marginTop: 'auto', padding: '40px 0', textAlign: 'center', width: '100%' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1rem' }}>© 2025 BBLAW. TODOS OS DIREITOS RESERVADOS.</p>
            </footer>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" color="white" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
