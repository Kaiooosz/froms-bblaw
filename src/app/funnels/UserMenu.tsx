'use client';

import React, { useState, useEffect } from 'react';
import { User, X, ClipboardList, Database, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { funnelConfig } from '@/lib/funnels';
import styles from '@/styles/Funnels.module.css';

export default function UserMenu({ userName }: { userName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (res.ok) {
                setProfileData(data.user);
                setSubmissions(data.submissions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchProfile();
    }, [isOpen]);

    return (
        <>
            <div
                className={styles.userInfo}
                style={{ cursor: 'pointer' }}
                onClick={() => setIsOpen(true)}
            >
                <div className={styles.userIcon}><User size={16} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>OLÁ,</span>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.8rem' }}>{userName}</span>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            style={{
                                position: 'relative',
                                width: 'min(500px, 90vw)',
                                background: '#080808',
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '2.5rem'
                            }}
                        >
                            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Minha <span style={{ color: 'rgba(255,255,255,0.4)' }}>Conta</span></h3>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>Gerencie seus dados e veja protocolos enviados.</p>
                                </div>
                                <button onClick={() => setIsOpen(false)} style={{ opacity: 0.3, padding: '0.5rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </header>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {/* Seção: Meus Dados */}
                                <div style={{ marginBottom: '3rem' }}>
                                    <h4 style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Database size={12} /> DADOS CADASTRAIS
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                        <ProfileField label="NOME COMPLETO" value={profileData?.fullName || profileData?.name || '—'} />
                                        <ProfileField label="E-MAIL" value={profileData?.email || '—'} />
                                        <ProfileField label="WHATSAPP / CELULAR" value={profileData?.phone || '—'} />
                                        <ProfileField label="DOCUMENTO / CPF" value={profileData?.document || '—'} />
                                    </div>
                                </div>

                                {/* Seção: Histórico */}
                                <div>
                                    <h4 style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ClipboardList size={12} /> PROTOCOLOS TRANSMITIDOS
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {submissions.length === 0 && !loading && (
                                            <p style={{ opacity: 0.2, fontSize: '0.8rem', fontStyle: 'italic' }}>Nenhum protocolo preenchido ainda.</p>
                                        )}
                                        {submissions.map((sub: any) => (
                                            <div
                                                key={sub.id}
                                                style={{
                                                    padding: '1.25rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{funnelConfig[sub.funnelType]?.title || sub.funnelType}</p>
                                                    <p style={{ fontSize: '0.65rem', opacity: 0.4 }}>{new Date(sub.createdAt).toLocaleDateString('pt-BR')} às {new Date(sub.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', fontWeight: 900 }}>
                                                    {sub.priority} <ChevronRight size={12} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <footer style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button
                                    onClick={() => {
                                        signOut({ callbackUrl: '/auth/signin' });
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        padding: '1.25rem',
                                        background: 'rgba(255,0,0,0.1)',
                                        color: '#ff4444',
                                        border: '1px solid rgba(255,0,0,0.1)',
                                        borderRadius: '100px',
                                        fontSize: '0.8rem',
                                        fontWeight: 900,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <LogOut size={16} /> SAIR E TROCAR USUÁRIO
                                </button>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function ProfileField({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{label}</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{value}</p>
        </div>
    );
}
