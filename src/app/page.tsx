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
    <div className="form-page-wrapper" style={{ overflow: 'hidden' }}>
      {/* Elemento de iluminação suave para profundidade */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vh',
        background: 'radial-gradient(circle, var(--ring) 0%, transparent 70%)',
        filter: 'blur(100px)',
        zIndex: -1,
        opacity: theme === 'dark' ? 0.15 : 0.4
      }} />

      <header className="form-header responsive-padding" style={{ position: 'absolute', top: 0, width: '100%', maxWidth: 'none', background: 'transparent', backdropFilter: 'none', border: 'none' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
          <button onClick={toggleTheme} title="Alternar tema" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="form-main-container responsive-padding" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
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
            style={{ marginBottom: '3rem' }}
          >
            <img
              src={theme === 'dark' ? "/logo-branco.svg" : "/logo-preto.svg"}
              alt="BBLAW"
              className="logo-img"
              style={{ maxWidth: 'min(280px, 60vw)', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }}
            />
          </motion.div>

          <h1 className="form-title" style={{
            fontSize: 'clamp(2rem, 7vw, 4rem)',
            marginBottom: '1rem',
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: '-0.04em'
          }}>
            Gestão <span className="accent-text">Estratégica</span> Jurídica
          </h1>

          <p className="form-description" style={{
            fontSize: 'clamp(0.95rem, 3vw, 1.25rem)',
            marginBottom: '3rem',
            opacity: 0.5,
            maxWidth: '550px',
            lineHeight: 1.5
          }}>
            Porta de entrada para segurança patrimonial e internacionalização com excelência.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', maxWidth: 'max-content' }}
          >
            <Link href="/auth/signin" className="btn btn-primary" style={{
              padding: '1.25rem 3.5rem',
              fontSize: '1rem',
              borderRadius: '100px',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              justifyContent: 'center'
            }}>
              ACESSAR PORTAL <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <footer className="form-footer" style={{ border: 'none', background: 'transparent', position: 'absolute', bottom: 0, width: '100%', padding: '1.5rem', opacity: 0.3 }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          © 2025 BBLAW. TODOS OS DIREITOS RESERVADOS.
        </p>
      </footer>
    </div>
  );
}
