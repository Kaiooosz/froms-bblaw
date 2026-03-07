'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Download,
    Search,
    Filter,
    FileText,
    User,
    Calendar,
    ShieldCheck,
    ChevronRight,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FUNNEL_LABELS: Record<string, string> = {
    'PARAGUAI': 'Fiscal Paraguai',
    'OFFSHORE': 'Offshore Int.',
    'HOLDING': 'Holding Nac.',
    'CRIPTO': 'Cripto',
    'SUCESSORIO': 'Sucessório',
    'CONTENCIOSO': 'Contencioso',
    'OFFSHORE_CUSTOM': 'Estratégico'
};

export default function AdminDocumentosPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFunnel, setFilterFunnel] = useState('ALL');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/admin/documents');
            const data = await res.json();
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch admin documents error:", err);
        } finally {
            setLoading(false);
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
            alert("Erro ao gerar link");
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch =
            (doc.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.filename || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFunnel = filterFunnel === 'ALL' || doc.funnelType === filterFunnel;
        return matchesSearch && matchesFunnel;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                <ShieldCheck className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase">Gestão Documental (ADMIN)</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Repositório de <span className="opacity-40 italic">Documentos</span></h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="Buscar cliente ou arquivo..."
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none focus:border-white/30 transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            value={filterFunnel}
                            onChange={(e) => setFilterFunnel(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black tracking-widest uppercase outline-none focus:border-white/30"
                        >
                            <option value="ALL">TODOS OS FUNIS</option>
                            {Object.keys(FUNNEL_LABELS).map(f => (
                                <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-3xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-bottom border-white/5 bg-white/5">
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Cliente</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Origem Funil</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Tipo</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Arquivo</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Data</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-xs opacity-20 font-bold">Nenhum documento encontrado</td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-40">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black tracking-tight">{doc.user?.name || 'Sem Nome'}</p>
                                                    <p className="text-[10px] opacity-30">{doc.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black tracking-tighter uppercase opacity-50">
                                                {FUNNEL_LABELS[doc.funnelType] || doc.funnelType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold opacity-60 capitalize">{doc.tipo}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <FileText className="w-4 h-4 opacity-20 flex-shrink-0" />
                                                <span className="text-[10px] font-medium opacity-40 truncate">{doc.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 opacity-30">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleDownload(doc.id)}
                                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black hover:border-white transition-all group-hover:scale-110"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
