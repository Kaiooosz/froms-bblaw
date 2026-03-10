'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import '@/app/forms.css';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="form-page-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Linhas Decorativas (Premium Frame) */}
      <div style={{ position: 'fixed', top: '12px', left: '12px', right: '12px', bottom: '12px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, opacity: 0.5 }} />
      <div style={{ position: 'fixed', top: '0', left: '50%', width: '1px', height: '12px', background: 'var(--border)', zIndex: 1001 }} />
      <div style={{ position: 'fixed', bottom: '0', left: '50%', width: '1px', height: '12px', background: 'var(--border)', zIndex: 1001 }} />
      <div style={{ position: 'fixed', left: '0', top: '50%', height: '1px', width: '12px', background: 'var(--border)', zIndex: 1001 }} />
      <div style={{ position: 'fixed', right: '0', top: '50%', height: '1px', width: '12px', background: 'var(--border)', zIndex: 1001 }} />

      <header className="form-header responsive-padding" style={{ position: 'absolute', top: 0, width: '100%', maxWidth: 'none', background: 'transparent', backdropFilter: 'none', border: 'none', zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
          <button onClick={toggleTheme} title="Alternar tema" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="form-main-container responsive-padding" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: '800px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '4rem' }}
          >
            <img
              src={theme === 'dark' ? "/logo-branco.svg" : "/logo-preto.svg"}
              alt="BBLAW"
              className="logo-img"
              style={{ maxWidth: 'min(240px, 50vw)', opacity: 0.9 }}
            />
          </motion.div>

          <h1 className="form-title" style={{
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            marginBottom: '1rem',
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.04em'
          }}>
            <span className="accent-text">Preencha</span> um formulário
          </h1>

          <p className="form-description" style={{
            fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
            marginBottom: '4rem',
            opacity: 0.4,
            maxWidth: '480px',
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            Inicie sua estruturação estratégica através de nosso portal exclusivo.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', maxWidth: 'max-content' }}
          >
            <Link href="/auth/signin" className="btn btn-primary" style={{
              padding: '1.25rem 4rem',
              fontSize: '0.9rem',
              borderRadius: '100px',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontWeight: 900,
              letterSpacing: '0.15em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              justifyContent: 'center',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}>
              INICIAR PROTOCOLO <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <footer className="form-footer" style={{ border: 'none', background: 'transparent', position: 'absolute', bottom: 0, width: '100%', padding: '2rem', opacity: 0.15 }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.3em' }}>
          BBLAW ESTRATÉGICO © 2025
        </p>
      </footer>
    </div>

  );
}
