'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    FileUp,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    ShieldCheck,
    CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FUNNEL_LABELS: Record<string, string> = {
    'PARAGUAI': 'Residência Fiscal Paraguai',
    'OFFSHORE': 'Offshore Internacional',
    'HOLDING': 'Holding Nacional',
    'CRIPTO': 'Estruturação Cripto',
    'SUCESSORIO': 'Planejamento Sucessório',
    'CONTENCIOSO': 'Contencioso Estratégico',
    'OFFSHORE_CUSTOM': 'Formulário Estratégico'
};

const DOC_TYPES = [
    { id: 'identidade', label: 'Documento de Identidade', desc: 'RG, CNH ou Passaporte' },
    { id: 'residencia', label: 'Comprovante de Residência', desc: 'Conta de luz, água ou telefone' },
    { id: 'contrato', label: 'Contrato Assinado', desc: 'Contrato de prestação de serviços' },
    { id: 'foto', label: 'Foto Selfie', desc: 'Foto segurando o documento' },
    { id: 'outro', label: 'Outros Documentos', desc: 'Documentos complementares' }
];

export default function DocumentosPage() {
    const { data: session } = useSession();
    const [activeFunnel, setActiveFunnel] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null); // docTypeId
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchData();
    }, [session]);

    const fetchData = async () => {
        try {
            const [subsRes, docsRes] = await Promise.all([
                fetch('/api/submissions'), // assuming this exists for current user
                fetch('/api/user/documents') // need to create this or use client-side filter
            ]);

            const subs = await subsRes.json();
            setSubmissions(Array.isArray(subs) ? subs : []);

            // If we don't have a dedicated documents api for user, we might need a general documents fetch or similar
            // For now let's assume we can fetch them or we'll add the API below
            const docs = await docsRes.json();
            setDocuments(Array.isArray(docs) ? docs : []);

            if (subs.length > 0 && !activeFunnel) {
                setActiveFunnel(subs[0].funnelType);
            }
        } catch (err) {
            console.error("Fetch data error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
        const file = e.target.files?.[0];
        if (!file || !activeFunnel) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Arquivo muito grande. Máximo 10MB.");
            return;
        }

        setUploading(tipo);
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('funnelType', activeFunnel);
        formData.append('tipo', tipo);

        try {
            setProgress(40);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            setProgress(80);
            if (res.ok) {
                await fetchData();
                setProgress(100);
            } else {
                const error = await res.json();
                alert(error.message || "Erro no upload");
            }
        } catch (err) {
            alert("Erro na conexão");
        } finally {
            setTimeout(() => {
                setUploading(null);
                setProgress(0);
            }, 500);
        }
    };

    const handleDownload = async (docId: string) => {
        try {
            const res = await fetch(`/api/download/${docId}`);
            const data = await res.json();
            if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch (err) {
            alert("Erro ao baixar arquivo");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
            </div>
        );
    }

    const userFunnels = Array.from(new Set(submissions.map(s => s.funnelType)));

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            padding: '40px 24px',
            position: 'relative',
            overflowX: 'hidden',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Linhas Decorativas (Premium Frame) */}
            <div style={{ position: 'fixed', top: '12px', left: '12px', right: '12px', bottom: '12px', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: '0', left: '50%', width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />
            <div style={{ position: 'fixed', bottom: '0', left: '50%', width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />
            <div style={{ position: 'fixed', left: '0', top: '50%', height: '1px', width: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />
            <div style={{ position: 'fixed', right: '0', top: '50%', height: '1px', width: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />

            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ marginBottom: '60px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}
                    >
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ShieldCheck size={20} style={{ opacity: 0.5 }} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', opacity: 0.3, textTransform: 'uppercase' }}>Portal de Documentação</span>
                    </motion.div>

                    <h1 style={{ fontSize: 'calc(2rem + 1vw)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px' }}>
                        Envie seus <span style={{ opacity: 0.4, fontStyle: 'italic', fontWeight: 400 }}>documentos</span>
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', lineHeight: 1.6 }}>
                        Para prosseguirmos com sua estruturação, precisamos que você anexe os documentos solicitados abaixo para cada funil preenchido.
                    </p>
                </header>

                {userFunnels.length === 0 ? (
                    <div style={{
                        padding: '60px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '32px',
                        border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                        <AlertCircle size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                        <p style={{ fontSize: '0.85rem', opacity: 0.4, fontWeight: 600 }}>Você ainda não preencheu nenhum formulário estratégico.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                            {userFunnels.map((funnel) => (
                                <button
                                    key={funnel}
                                    onClick={() => setActiveFunnel(funnel)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '100px',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        transition: 'all 0.3s ease',
                                        whiteSpace: 'nowrap',
                                        border: '1px solid',
                                        background: activeFunnel === funnel ? '#fff' : 'rgba(255,255,255,0.05)',
                                        color: activeFunnel === funnel ? '#000' : 'rgba(255,255,255,0.4)',
                                        borderColor: activeFunnel === funnel ? '#fff' : 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {FUNNEL_LABELS[funnel] || funnel}
                                </button>
                            ))}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '24px'
                        }}>
                            {DOC_TYPES.map((docType) => {
                                const existingDoc = documents.find(d => d.funnelType === activeFunnel && d.tipo === docType.id);
                                const isUploading = uploading === docType.id;

                                return (
                                    <motion.div
                                        key={docType.id}
                                        layout
                                        style={{
                                            padding: '32px',
                                            borderRadius: '32px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            minHeight: '260px',
                                            transition: 'background 0.3s ease'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                                                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                                    <FileText size={24} style={{ color: existingDoc ? '#22c55e' : '#fff', opacity: existingDoc ? 1 : 0.2 }} />
                                                </div>
                                                {existingDoc ? (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 12px',
                                                        background: 'rgba(34,197,94,0.1)',
                                                        borderRadius: '100px',
                                                        border: '1px solid rgba(34,197,94,0.2)'
                                                    }}>
                                                        <CheckCircle2 size={12} style={{ color: '#22c55e' }} />
                                                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#22c55e', textTransform: 'uppercase' }}>Enviado</span>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 12px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '100px',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase' }}>Pendente</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{docType.label}</h3>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.3, marginBottom: '32px', lineHeight: 1.5 }}>{docType.desc}</p>
                                        </div>

                                        <div style={{ position: 'relative' }}>
                                            {isUploading ? (
                                                <div style={{
                                                    width: '100%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    height: '48px',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)' }}
                                                    />
                                                    <span style={{ position: 'relative', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Loader2 size={12} className="animate-spin" /> Carregando {progress}%
                                                    </span>
                                                </div>
                                            ) : existingDoc ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleDownload(existingDoc.id)}
                                                        style={{
                                                            flex: 1,
                                                            height: '48px',
                                                            borderRadius: '16px',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px',
                                                            fontSize: '9px',
                                                            fontWeight: 900,
                                                            letterSpacing: '0.1em',
                                                            textTransform: 'uppercase',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                    >
                                                        <Download size={16} /> Baixar
                                                    </button>
                                                    <label style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '16px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                    >
                                                        <FileUp size={16} style={{ opacity: 0.3 }} />
                                                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, docType.id)} accept=".pdf,.jpg,.jpeg,.png,.webp" />
                                                    </label>
                                                </div>
                                            ) : (
                                                <label style={{
                                                    width: '100%',
                                                    height: '48px',
                                                    borderRadius: '16px',
                                                    background: '#fff',
                                                    color: '#000',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '9px',
                                                    fontWeight: 900,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                                                >
                                                    <CloudUpload size={16} /> Enviar Arquivo
                                                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, docType.id)} accept=".pdf,.jpg,.jpeg,.png,.webp" />
                                                </label>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );

}
