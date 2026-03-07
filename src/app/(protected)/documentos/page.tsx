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
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <ShieldCheck className="w-5 h-5 opacity-50" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase">Portal de Documentação</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Envie seus <span className="text-white/40 italic">documentos</span>
                    </h1>
                    <p className="text-sm text-white/40 max-w-xl leading-relaxed">
                        Para prosseguirmos com sua estruturação, precisamos que você anexe os documentos solicitados abaixo para cada funil preenchido.
                    </p>
                </header>

                {userFunnels.length === 0 ? (
                    <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-sm opacity-40">Você ainda não preencheu nenhum formulário estratégico.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-rows-[auto_1fr] gap-8">
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                            {userFunnels.map((funnel) => (
                                <button
                                    key={funnel}
                                    onClick={() => setActiveFunnel(funnel)}
                                    className={`px-6 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border ${activeFunnel === funnel
                                            ? 'bg-white text-black border-white'
                                            : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {FUNNEL_LABELS[funnel] || funnel}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {DOC_TYPES.map((docType) => {
                                const existingDoc = documents.find(d => d.funnelType === activeFunnel && d.tipo === docType.id);
                                const isUploading = uploading === docType.id;

                                return (
                                    <motion.div
                                        key={docType.id}
                                        layout
                                        className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                                    <FileText className={`w-6 h-6 ${existingDoc ? 'text-green-500' : 'opacity-20'}`} />
                                                </div>
                                                {existingDoc ? (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Enviado</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                                        <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">Pendente</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 tracking-tight">{docType.label}</h3>
                                            <p className="text-xs opacity-30 mb-8 leading-relaxed">{docType.desc}</p>
                                        </div>

                                        <div className="relative">
                                            {isUploading ? (
                                                <div className="w-full bg-white/5 h-12 rounded-2xl overflow-hidden relative border border-white/10 flex items-center justify-center">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="absolute inset-0 bg-white/10"
                                                    />
                                                    <span className="relative text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                                                        Carregando {progress}%
                                                    </span>
                                                </div>
                                            ) : existingDoc ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDownload(existingDoc.id)}
                                                        className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase"
                                                    >
                                                        <Download className="w-4 h-4" /> Baixar
                                                    </button>
                                                    <label className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer group/label">
                                                        <FileUp className="w-4 h-4 opacity-30 group-hover/label:opacity-100" />
                                                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, docType.id)} accept=".pdf,.jpg,.jpeg,.png,.webp" />
                                                    </label>
                                                </div>
                                            ) : (
                                                <label className="w-full h-12 rounded-2xl bg-white text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-[10px] font-black tracking-widest uppercase">
                                                    <CloudUpload className="w-4 h-4" /> Enviar Arquivo
                                                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, docType.id)} accept=".pdf,.jpg,.jpeg,.png,.webp" />
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}
