'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif',
            color: '#fff'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', maxWidth: '400px' }}
            >
                <img
                    src="/LogoBranco.svg"
                    alt="BBLAW"
                    style={{ height: '60px', marginBottom: '3rem', opacity: 0.8 }}
                />

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '3rem 2rem',
                    borderRadius: '24px',
                    marginBottom: '2rem'
                }}>
                    <AlertCircle size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                        Ops! Página não encontrada
                    </h1>
                    <p style={{ fontSize: '0.9rem', opacity: 0.4, lineHeight: 1.6, marginBottom: '2rem' }}>
                        Parece que o link que você tentou acessar não existe ou foi removido.
                    </p>

                    <Link href="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        background: '#fff',
                        color: '#000',
                        padding: '1rem 2rem',
                        borderRadius: '100px',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        textDecoration: 'none',
                        transition: 'transform 0.2s'
                    }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <ArrowLeft size={16} /> VOLTAR PARA O INÍCIO
                    </Link>
                </div>

                <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2, letterSpacing: '0.2em' }}>
                    ERRO 404 • BBLAW ESTRATÉGICO
                </p>
            </motion.div>
        </div>
    );
}
