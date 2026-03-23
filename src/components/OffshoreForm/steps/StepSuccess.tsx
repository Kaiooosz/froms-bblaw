'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';

export default function StepSuccess() {
    const [whatsAppNum, setWhatsAppNum] = useState('5521979901686'); // Default / fallback

    useEffect(() => {
        // Busca a configuração do Admin e atualiza o número
        fetch('/api/admin/config')
            .then(res => res.json())
            .then(data => {
                if (data && data.whatsapp) {
                    // Extract only numbers from the string
                    setWhatsAppNum(data.whatsapp.replace(/\D/g, ''));
                }
            })
            .catch(console.error);
    }, []);

    return (
        <div className="text-center py-8">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="success-icon-wrapper"
                style={{
                    display: 'inline-flex',
                    padding: '2rem',
                    background: 'var(--secondary)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '2rem'
                }}
            >
                <CheckCircle2 size={64} className="accent-text" />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="form-title" style={{ fontSize: '2.5rem' }}>Solicitação <span className="accent-text">Enviada</span></h1>
                <p className="form-description" style={{ maxWidth: '540px', margin: '0 auto 3rem' }}>
                    Sua aplicação foi recebida com sucesso por nossa equipe.
                    Nossos especialistas entrarão em contato em até 24 horas úteis.
                </p>

                <div className="sigilo-box" style={{ maxWidth: '400px', margin: '0 auto 4rem', padding: '1.25rem' }}>
                    <ShieldCheck size={20} />
                    <span style={{ fontSize: '0.875rem' }}>Protocolo de segurança BBLAW gerado.</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.location.href = `https://wa.me/${whatsAppNum}?text=Ol%C3%A1%2C%20meu%20formul%C3%A1rio%20j%C3%A1%20foi%20preenchido.%20Gostaria%20de%20falar%20com%20um%20especialista.`}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        <MessageSquare size={18} />
                        Avisar Especialista (WhatsApp)
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 2rem' }}
                    >
                        Nova Solicitação
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
