'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    FileUp,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FUNNEL_LABELS: Record<string, string> = {
    'residencia_py': 'Residência Fiscal Paraguai',
    'offshore': 'Offshore Internacional',
    'holding': 'Holding Nacional',
    'cripto': 'Estruturação Cripto',
    'sucessorio': 'Planejamento Sucessório',
    'contencioso': 'Contencioso Estratégico',
    'compliance': 'Retainer / Compliance',
    'contabil': 'Contabilidade Empresarial'
};

const FUNNEL_DOCS: Record<string, { id: string, label: string, desc: string }[]> = {
    'residencia_py': [
        { id: 'rg_cnh_passaporte', label: 'Documento Pessoal Físico', desc: 'Foto nítida do RG, CNH ou Passaporte' },
        { id: 'cert_nascimento', label: 'Certidão de Nascimento', desc: 'Original + Apostilamento (apenas frente e verso)' },
        { id: 'cert_casamento', label: 'Certidão de Casamento', desc: 'Original + Apostilamento (Se for casado(a))' },
        { id: 'antecedentes', label: 'Antecedentes Criminais', desc: 'PF com Apostilamento de Haia' },
        { id: 'vacina_febre', label: 'Vacina Febre Amarela', desc: 'Certificado Internacional (gov.br)' },
        { id: 'foto_interpol', label: 'Foto Estilo Interpol', desc: 'Selfie de rosto em fundo branco' }
    ],
    'offshore': [
        { id: 'passaporte', label: 'Passaporte', desc: 'Cópia Apostilada/Notarizada' },
        { id: 'residencia', label: 'Comprovante de Residência', desc: 'Emitido há menos de 90 dias' },
        { id: 'ref_bancaria', label: 'Carta Ref. Bancária', desc: 'Relacionamento acima de 1-2 anos (Se possível)' },
        { id: 'comprovante_fundos', label: 'Comprovativo de Fundos', desc: 'IR, Extrato ou Prova de Liquidez' },
        { id: 'outro', label: 'Documentos Societários', desc: 'CNPJ, Contrato (Caso já exista empresa)' }
    ],
    'holding': [
        { id: 'irpf', label: 'IRPF Atualizado', desc: 'Declaração com Relação de Bens' },
        { id: 'relacao_imoveis', label: 'Matrículas de Imóveis', desc: 'Relação ou PDFs recentes (Caso aplicável)' },
        { id: 'contrato_social', label: 'Contrato Social', desc: 'Das empresas atuantes (se possuir)' },
        { id: 'doc_identidade', label: 'Documento de Identidade', desc: 'RG ou CNH' }
    ],
    'cripto': [
        { id: 'relatorio_fiscal', label: 'Relatório Fiscal Cripto', desc: 'Extratos ou controle de custódia' },
        { id: 'notificacao_rfb', label: 'Notificação RFB', desc: 'Caso já tenha sido notificado' },
        { id: 'doc_identidade', label: 'Documento de Identidade', desc: 'RG ou CNH' }
    ],
    'sucessorio': [
        { id: 'doc_identidade', label: 'Documentos Pessoais', desc: 'RG ou CNH Próprios' },
        { id: 'cert_casamento', label: 'Certidão de Casamento', desc: 'Se aplicável' },
        { id: 'relacao_bens', label: 'IRPF / Relação de Bens', desc: 'Ultima declaração transmitida' }
    ],
    'contencioso': [
        { id: 'processo', label: 'Petição Inicial / Mandado', desc: 'Cópia integral clara' },
        { id: 'notificacao', label: 'Notificações Recebidas', desc: 'Fotos dos despachos' },
        { id: 'provas', label: 'Upload de Provas', desc: 'Contratos, e-mails e conversas' },
        { id: 'doc_identidade', label: 'Procuração Pré-assinada', desc: 'A requerer' }
    ]
};

// Fallback / Padrão
const DEFAULT_DOCS = [
    { id: 'identidade', label: 'Documento de Identidade', desc: 'RG, CNH ou Passaporte' },
    { id: 'residencia', label: 'Comprovante de Residência', desc: 'Conta de luz, água ou telefone' },
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
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

            if (!activeFunnel) {
                // If the user has explicitly submitted a funnel, default to the most recent one
                // Otherwise, default to the first funnel (residencia_py)
                const firstFunnel = subs.length > 0 ? subs[0].funnelType : Object.keys(FUNNEL_LABELS)[0];
                setActiveFunnel(firstFunnel);
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
                const docLabel = (activeFunnel && FUNNEL_DOCS[activeFunnel]
                    ? FUNNEL_DOCS[activeFunnel]
                    : DEFAULT_DOCS
                ).find(d => d.id === tipo)?.label || tipo;
                setSuccessMsg(`"${docLabel}" enviado com sucesso para o Google Drive!`);
                setTimeout(() => setSuccessMsg(null), 4500);
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

    const allFunnels = Object.keys(FUNNEL_LABELS);

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
            {/* Toast de sucesso */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999,
                            background: 'rgba(34,197,94,0.12)',
                            border: '1px solid rgba(34,197,94,0.3)',
                            borderRadius: '100px',
                            padding: '12px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backdropFilter: 'blur(16px)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.02em' }}>
                            {successMsg}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conteúdo Principal */}

            <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ marginBottom: '60px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}
                    >
                        <Link href="/funnels" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'rgba(255,255,255,0.6)',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                        }}
                        >
                            <ChevronLeft size={18} />
                        </Link>
                        
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ShieldCheck size={20} style={{ opacity: 0.5 }} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', opacity: 0.3, textTransform: 'uppercase' }}>Portal de Documentação</span>
                    </motion.div>

                    <h1 style={{ fontSize: 'calc(2rem + 1vw)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px' }}>
                        Envie seus <span style={{ opacity: 0.4, fontStyle: 'italic', fontWeight: 400 }}>documentos</span>
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', lineHeight: 1.6 }}>
                        Abaixo você pode iniciar os envios seguros da sua documentação. Selecione a operação correspondente ao seu caso estratégico.
                    </p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                        {allFunnels.map((funnel) => (
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
                            {(activeFunnel && FUNNEL_DOCS[activeFunnel] ? FUNNEL_DOCS[activeFunnel] : DEFAULT_DOCS).map((docType) => {
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
            </div>

            <style jsx global>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );

}
