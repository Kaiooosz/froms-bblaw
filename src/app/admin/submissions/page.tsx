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
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            color: '#fff',
            padding: '40px 24px',
            position: 'relative',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Linhas Decorativas (Premium Frame) */}
            <div style={{ position: 'fixed', top: '12px', left: '12px', right: '12px', bottom: '12px', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none', zIndex: 1000 }} />
            <div style={{ position: 'fixed', top: '0', left: '50%', width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />
            <div style={{ position: 'fixed', bottom: '0', left: '50%', width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />
            <div style={{ position: 'fixed', left: '0', top: '50%', height: '1px', width: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />
            <div style={{ position: 'fixed', right: '0', top: '50%', height: '1px', width: '12px', background: 'rgba(255,255,255,0.1)', zIndex: 1001 }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header style={{ marginBottom: '60px', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#f97316' }}>
                                <ClipboardList size={20} />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', opacity: 0.3, textTransform: 'uppercase' }}>Triagem de Protocolos (ADMIN)</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                            Gestão de <span style={{ opacity: 0.4, fontStyle: 'italic', fontWeight: 400 }}>Respostas</span>
                        </h1>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '12px 16px 12px 42px',
                                    fontSize: '12px',
                                    color: '#fff',
                                    outline: 'none',
                                    width: '240px'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterFunnel}
                            onChange={(e) => setFilterFunnel(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '12px 20px',
                                fontSize: '10px',
                                fontWeight: 900,
                                color: '#fff',
                                textTransform: 'uppercase',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">TODOS OS FUNIS</option>
                            {Object.keys(FUNNEL_LABELS).map(f => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
                        </select>
                    </div>
                </header>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <th style={{ padding: '24px 32px', fontSize: '10px', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cliente</th>
                                    <th style={{ padding: '24px 32px', fontSize: '10px', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Funil</th>
                                    <th style={{ padding: '24px 32px', fontSize: '10px', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Data</th>
                                    <th style={{ padding: '24px 32px', fontSize: '10px', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '24px 32px', fontSize: '10px', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((sub) => {
                                    const Status = STATUS_LABELS[sub.status] || STATUS_LABELS['PENDING'];
                                    const colorMap: Record<string, string> = { orange: '#f97316', blue: '#3b82f6', green: '#22c55e' };
                                    const currentColor = colorMap[Status.color] || '#fff';

                                    return (
                                        <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '12px', fontWeight: 900 }}>{sub.user?.name || 'Sem Nome'}</p>
                                                        <p style={{ fontSize: '10px', opacity: 0.3 }}>{sub.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase' }}>{FUNNEL_LABELS[sub.funnelType] || sub.funnelType}</span>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.3 }}>{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 12px',
                                                        borderRadius: '100px',
                                                        background: `${currentColor}10`,
                                                        border: `1px solid ${currentColor}20`
                                                    }}>
                                                        <Status.icon size={10} style={{ color: currentColor }} />
                                                        <span style={{ fontSize: '9px', fontWeight: 900, color: currentColor, textTransform: 'uppercase' }}>{Status.label}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setSelectedSub(sub)}
                                                    style={{
                                                        padding: '10px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#000')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = '#fff')}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Detalhes */}
            <AnimatePresence>
                {selectedSub && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        padding: '16px'
                    }}>
                        <motion.div
                            initial={{ x: 500, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 500, opacity: 0 }}
                            style={{
                                background: '#0a0a0a',
                                width: '100%',
                                maxWidth: '640px',
                                height: '100%',
                                borderRadius: '32px 0 0 32px',
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                padding: '60px',
                                overflowY: 'auto',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setSelectedSub(null)}
                                style={{
                                    position: 'absolute',
                                    right: '40px',
                                    top: '40px',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    opacity: 0.4
                                }}
                            >
                                <X size={20} />
                            </button>

                            <header style={{ marginBottom: '48px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', opacity: 0.3, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>Ficha do Protocolo</span>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px' }}>Detalhamento das <span style={{ opacity: 0.4, fontStyle: 'italic', fontWeight: 400 }}>Respostas</span></h2>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ fontSize: '8px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '4px' }}>Status Atual</p>
                                        <span style={{ fontSize: '11px', fontWeight: 700 }}>{selectedSub.status}</span>
                                    </div>
                                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ fontSize: '8px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '4px' }}>Prioridade</p>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#f97316' }}>{selectedSub.priority || 'NORMAL'}</span>
                                    </div>
                                </div>
                            </header>

                            <div style={{ marginBottom: '48px' }}>
                                <h4 style={{ fontSize: '10px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Dados do Formulário</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                                    {Object.entries(selectedSub.data || {}).map(([key, value]: [string, any]) => (
                                        <div key={key} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '8px' }}>{key.replace(/_/g, ' ')}</p>
                                            <p style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8, lineHeight: 1.5 }}>
                                                {Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <footer style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                <p style={{ width: '100%', fontSize: '10px', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Ações do Administrador</p>
                                <button
                                    onClick={() => updateStatus(selectedSub.id, 'REVIEWING')}
                                    style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', transition: 'all 0.3s' }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = '#3b82f6')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                >Em Análise</button>
                                <button
                                    onClick={() => updateStatus(selectedSub.id, 'COMPLETED')}
                                    style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', transition: 'all 0.3s' }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = '#22c55e')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                >Concluir</button>
                                <button
                                    onClick={() => updateStatus(selectedSub.id, 'PENDING')}
                                    style={{ padding: '16px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', transition: 'all 0.3s', marginLeft: 'auto' }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = '#f97316')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                >Voltar Pendente</button>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );

}
