'use client';

import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Search,
    Filter,
    User,
    Calendar,
    MoreHorizontal,
    X,
    CheckCircle2,
    Clock,
    Eye,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS: Record<string, any> = {
    'PENDING': { label: 'PENDENTE', color: 'orange', icon: Clock },
    'REVIEWING': { label: 'EM ANÁLISE', color: 'blue', icon: Eye },
    'COMPLETED': { label: 'CONCLUÍDO', color: 'green', icon: CheckCircle2 }
};

const FUNNEL_LABELS: Record<string, string> = {
    'PARAGUAI': 'Residência Fiscal Paraguai',
    'OFFSHORE': 'Offshore Internacional',
    'HOLDING': 'Holding Nacional',
    'CRIPTO': 'Estruturação Cripto',
    'SUCESSORIO': 'Planejamento Sucessório',
    'CONTENCIOSO': 'Contencioso Estratégico',
    'OFFSHORE_CUSTOM': 'Estratégico'
};

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFunnel, setFilterFunnel] = useState('ALL');
    const [selectedSub, setSelectedSub] = useState<any | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/submissions');
            const data = await res.json();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch submissions error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/admin/submissions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                await fetchSubmissions();
                if (selectedSub?.id === id) {
                    setSelectedSub({ ...selectedSub, status: newStatus });
                }
            }
        } catch (err) {
            alert("Erro ao atualizar status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const PRIORITY_ORDER: Record<string, number> = {
        'VIP': 1,
        'URGENTE': 2,
        'ALTA': 3,
        'NORMAL': 4,
        'A DEFINIR': 5,
    };

    const sortData = (a: any, b: any) => {
        const pA = PRIORITY_ORDER[a.priority as string] || 99;
        const pB = PRIORITY_ORDER[b.priority as string] || 99;
        if (pA !== pB) return pA - pB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    };

    const filtered = submissions.filter(s => {
        const matchesSearch =
            (s.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFunnel = filterFunnel === 'ALL' || s.funnelType === filterFunnel;
        return matchesSearch && matchesFunnel;
    }).sort(sortData);

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 opacity-20 animate-spin text-white" /></div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-orange-400">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase">Triagem de Protocolos (ADMIN)</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Gestão de <span className="opacity-40 italic">Respostas</span></h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold w-64 outline-none focus:border-white/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            value={filterFunnel}
                            onChange={(e) => setFilterFunnel(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black tracking-widest uppercase outline-none focus:border-white/30"
                        >
                            <option value="ALL">TODOS OS FUNIS</option>
                            {Object.keys(FUNNEL_LABELS).map(f => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
                        </select>
                    </div>
                </header>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-3xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Cliente</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase">Funil</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase text-center">Data</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black tracking-widest opacity-30 uppercase text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((sub) => {
                                const Status = STATUS_LABELS[sub.status] || STATUS_LABELS['PENDING'];
                                return (
                                    <tr key={sub.id} className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-40"><User className="w-4 h-4" /></div>
                                                <div>
                                                    <p className="text-xs font-black">{sub.user?.name || 'Sem Nome'}</p>
                                                    <p className="text-[10px] opacity-30">{sub.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{FUNNEL_LABELS[sub.funnelType] || sub.funnelType}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-[10px] font-bold opacity-30">{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-${Status.color}-500/20 bg-${Status.color}-500/5`}>
                                                    <Status.icon className={`w-3 h-3 text-${Status.color}-500`} />
                                                    <span className={`text-[9px] font-black text-${Status.color}-500 tracking-tighter`}>{Status.label}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => setSelectedSub(sub)}
                                                className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalhes */}
            <AnimatePresence>
                {selectedSub && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ x: 500, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 500, opacity: 0 }}
                            className="bg-[#0a0a0a] w-full max-w-2xl min-h-full md:min-h-[auto] rounded-3xl border border-white/10 p-12 relative shadow-2xl overflow-y-auto"
                        >
                            <button
                                onClick={() => setSelectedSub(null)}
                                className="absolute right-8 top-8 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5 opacity-40" />
                            </button>

                            <header className="mb-12">
                                <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase mb-4 block">Ficha do Protocolo</span>
                                <h2 className="text-3xl font-black mb-4">Detalhamento das <span className="opacity-40 italic">Respostas</span></h2>

                                <div className="flex flex-wrap gap-4 mt-8">
                                    <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[9px] font-black opacity-20 uppercase tracking-widest mb-1">Status Atual</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold">{selectedSub.status}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[9px] font-black opacity-20 uppercase tracking-widest mb-1">Prioridade</p>
                                        <span className="text-xs font-bold text-orange-400">{selectedSub.priority || 'NORMAL'}</span>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-6 mb-12">
                                <h4 className="text-[10px] font-black opacity-20 tracking-widest uppercase mb-2">Dados do Formulário</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(selectedSub.data || {}).map(([key, value]: [string, any]) => (
                                        <div key={key} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-[10px] font-black opacity-20 uppercase tracking-tight mb-2">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-xs font-bold opacity-80 leading-relaxed">
                                                {Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <footer className="pt-8 border-t border-white/5 flex flex-wrap gap-3">
                                <p className="w-full text-[10px] font-black opacity-20 tracking-widest uppercase mb-4">Ações do Administrador</p>
                                <button
                                    onClick={() => updateStatus(selectedSub.id, 'REVIEWING')}
                                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all"
                                >Em Análise</button>
                                <button
                                    onClick={() => updateStatus(selectedSub.id, 'COMPLETED')}
                                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-green-500 hover:text-white transition-all"
                                >Concluir</button>
                                <button
                                    onClick={() => updateStatus(selectedSub.id, 'PENDING')}
                                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase hover:bg-orange-500 hover:text-white transition-all ml-auto"
                                >Voltar Pendente</button>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .text-orange-500 { color: #f97316; }
        .text-blue-500 { color: #3b82f6; }
        .text-green-500 { color: #22c55e; }
        .bg-orange-500\/5 { background-color: rgba(249, 115, 22, 0.05); }
        .bg-blue-500\/5 { background-color: rgba(59, 130, 246, 0.05); }
        .bg-green-500\/5 { background-color: rgba(34, 197, 94, 0.05); }
        .border-orange-500\/20 { border-color: rgba(249, 115, 22, 0.2); }
        .border-blue-500\/20 { border-color: rgba(59, 130, 246, 0.2); }
        .border-green-500\/20 { border-color: rgba(34, 197, 94, 0.2); }
      `}</style>
        </div>
    );
}
