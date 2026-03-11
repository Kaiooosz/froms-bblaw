'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Globe, Lock, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Background Grid + Glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.015) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0.5px, transparent 0.5px)`,
          backgroundSize: '80px 80px' 
        }} />
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, padding: '2.5rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/">
            <img 
              src="/LogoBranco.svg" 
              alt="BBLAW" 
              style={{ height: '45px', width: 'auto', opacity: 1, display: 'block' }} 
            />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <a href="/auth/signin" style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', textDecoration: 'none', transition: 'color 0.3s' }}>Login</a>
          <a href="/auth/signup" style={{ background: '#fff', color: '#000', padding: '0.85rem 1.75rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', border: '1px solid transparent', transition: 'all 0.4s' }}>Cadastre-se</a>
        </motion.div>
      </header>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '6rem 4rem 10rem', width: '100%', flex: 1 }}>
        
        {/* Hero Section */}
        <section style={{ marginBottom: '4rem' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ height: '1px', width: '40px', background: 'rgba(255,255,255,0.15)' }} />
              <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Protocolos de Alta Fidelidade</p>
            </div>
            
            <h1 style={{ fontSize: 'min(5rem, 10vw)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.95, fontFamily: 'Outfit, sans-serif', marginBottom: '2.5rem' }}>
              PLANEJAMENTO <br/>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>ESTRATÉGICO &</span><br/>
              INTELIGÊNCIA <span style={{ fontStyle: 'italic', fontWeight: 400 }}>JURÍDICA.</span>
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.4)', maxWidth: '600px', lineHeight: 1.6, fontWeight: 500, letterSpacing: '-0.01em' }}>
              Assessoria de precisão para estruturação patrimonial global e proteção de ativos estratégicos.
            </p>
          </motion.div>
        </section>

        {/* Action Grid (Single Horizontal Card) */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} style={{ width: '100%' }}>
            <a href="/auth/signin" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ 
                padding: '3rem', 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '32px', 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(10px)',
                gap: '2rem',
                flexWrap: 'wrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                  <div style={{ width: '64px', height: '64px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
                    <Lock size={28} color="rgba(255,255,255,0.6)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#fff', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      PORTAL DO CLIENTE
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', lineHeight: 1.6, maxWidth: '600px' }}>
                      Inicie acesso aos formulários e envie seu documento e entenda a melhor solução com nossa inteligência.
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.3em', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  ACESSO RESTRITO <ChevronRight size={16} />
                </div>

              </div>
            </a>
          </motion.div>
        </div>

        {/* Footer Badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10rem', paddingTop: '3rem', borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: '3rem', opacity: 0.25 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={14} />
              <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em' }}>AES-256</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Globe size={14} />
              <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em' }}>INTL COMPLIANT</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>BBLAW ESTRATÉGICO © 2025</p>
          </div>
        </motion.div>

      </main>

      {/* Extreme Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)', zIndex: 5 }} />

    </div>
  );
}
