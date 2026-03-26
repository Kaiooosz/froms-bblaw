'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Users,
    LogOut,
    Search,
    X,
    ExternalLink,
    Calendar,
    Mail,
    ShieldCheck,
    ClipboardList,
    Loader2,
    Filter,
    CheckCircle2,
    Moon,
    Sun,
    LayoutDashboard,
    Settings,
    Bell,
    ChevronRight,
    ArrowUpRight,
    FileText,
    Download,
    Menu as MenuIcon,
    FileUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { funnelConfig } from '@/lib/funnels';
import { useTheme } from '@/components/ThemeProvider';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '@/app/forms.css';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADS' | 'SUBMISSIONS' | 'USERS' | 'WEBHOOKS' | 'DOCS'>('LEADS');
    const [users, setUsers] = useState<any[]>([]);
    const [allDocs, setAllDocs] = useState<any[]>([]);
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [docFunnelFilter, setDocFunnelFilter] = useState('ALL');
    const [expandedDocUser, setExpandedDocUser] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [docCount, setDocCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            if (status === 'loading') return;
            if (!session) {
                router.push('/auth/signin');
                return;
            }

            const userEmail = (session.user?.email || "").toLowerCase().trim();
            const role = (session.user as any)?.role;

            const isActuallyAdmin = role === "ADMIN" || userEmail === "bezerraborges@gmail.com";

            if (!isActuallyAdmin) {
                console.log("CLIENT_SIDE_ADMIN_CHECK_FAILED:", { userEmail, role });
                router.push('/dashboard')
            } else {
                fetchSubmissions();
                fetchLeads();
                fetchUsers();
                fetchMetrics();
            }
        };

        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/admin/documents');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setDocCount(data.length);
                        setAllDocs(data);
                    }
                }
            } catch (err) { }
        };

        checkAuth();
    }, [status, session]);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/submissions');
            if (res.ok) {
                const data = await res.json();
                setSubmissions(Array.isArray(data) ? data : []);
            } else { setSubmissions([]); }
        } catch (err) { setSubmissions([]); }
        finally { setLoading(false); }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/admin/leads');
            if (res.ok) {
                const data = await res.json();
                setLeads(Array.isArray(data) ? data : []);
            } else { setLeads([]); }
        } catch (err) { setLeads([]); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } else { setUsers([]); }
        } catch (err) { setUsers([]); }
    };

    const updateStatus = async (id: string, type: 'lead' | 'submission', status: string) => {
        setIsUpdating(true);
        try {
            const endpoint = type === 'lead' ? `/api/admin/leads/${id}` : `/api/admin/submissions/${id}`;
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                if (type === 'lead') {
                    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
                    if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
                } else {
                    setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
                    if (selectedSubmission?.id === id) setSelectedSubmission({ ...selectedSubmission, status });
                }
            }
        } catch (err) {
            console.error("Status update error:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const updatePriority = async (id: string, type: 'lead' | 'submission', priority: string) => {
        setIsUpdating(true);
        try {
            const endpoint = type === 'lead' ? `/api/admin/leads/${id}` : `/api/admin/submissions/${id}`;
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority })
            });

            if (res.ok) {
                if (type === 'lead') {
                    setLeads(leads.map(l => l.id === id ? { ...l, priority } : l));
                    if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, priority });
                } else {
                    setSubmissions(submissions.map(s => s.id === id ? { ...s, priority } : s));
                    if (selectedSubmission?.id === id) setSelectedSubmission({ ...selectedSubmission, priority });
                }
            }
        } catch (err) {
            console.error("Update error:", err);
        } finally {
            setIsUpdating(false);
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

    const filteredLeads = (Array.isArray(leads) ? leads : []).filter(lead =>
        (lead.nome_completo_pessoal || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.whatsapp || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort(sortData);

    const filteredSubmissions = (Array.isArray(submissions) ? submissions : []).filter(sub => {
        const matchesSearch =
            (sub.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' || sub.funnelType.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesFilter;
    }).sort(sortData);

    const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
        (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDocs = (Array.isArray(allDocs) ? allDocs : []).filter(doc =>
        (doc.filename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportSubmissionPDF = (sub: any) => {
        const doc = new jsPDF() as any;
        const config = funnelConfig[sub.funnelType] || { title: sub.funnelType };

        doc.setFontSize(22);
        doc.text("DOSSIÊ DE PROTOCOLO BBLAW", 20, 25);
        doc.setFontSize(10);
        doc.text(`ID: ${sub.id}`, 20, 32);
        doc.text(`Data: ${new Date(sub.createdAt).toLocaleString('pt-BR')}`, 20, 37);

        doc.setFontSize(14);
        doc.text("1. INFORMAÇÕES DO CLIENTE", 20, 50);
        doc.autoTable({
            startY: 55,
            head: [['Campo', 'Informação']],
            body: [
                ['Nome', sub.user?.fullName || sub.user?.name || '—'],
                ['E-mail', sub.user?.email || '—'],
                ['Documento', sub.user?.document || '—'],
                ['Contato', sub.user?.phone || '—'],
                ['Prioridade', sub.priority || 'A DEFINIR'],
                ['Score', String(sub.score || '0')],
            ],
            theme: 'grid',
            headStyles: { fillColor: [30, 30, 30] }
        });

        doc.setFontSize(14);
        doc.text("2. RESPOSTAS DO FORMULÁRIO", 20, doc.lastAutoTable.finalY + 20);

        const responseData = Object.entries(sub.data).map(([k, v]) => [
            k.replace(/_/g, ' ').toUpperCase(),
            Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? 'Documento/Arquivo' : String(v))
        ]);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 25,
            head: [['Pergunta', 'Resposta']],
            body: responseData,
            theme: 'striped',
            headStyles: { fillColor: [60, 60, 60] }
        });

        doc.save(`protocolo_${sub.id}.pdf`);
    };

    const exportLeadPDF = (lead: any) => {
        const doc = new jsPDF() as any;

        doc.setFontSize(22);
        doc.text("DETALHAMENTO DE LEAD BBLAW", 20, 25);
        doc.setFontSize(10);
        doc.text(`Data: ${new Date(lead.createdAt).toLocaleString('pt-BR')}`, 20, 32);

        doc.setFontSize(14);
        doc.text("DADOS PESSOAIS E CADASTRAIS", 20, 50);

        const leadData = Object.entries(lead).map(([k, v]) => [
            k.replace(/_/g, ' ').toUpperCase(),
            Array.isArray(v) ? v.join(', ') : String(v || '—')
        ]).filter(([k]) => !['ID', 'CREATEDAT', 'USERID', 'USER'].includes(k));

        doc.autoTable({
            startY: 55,
            head: [['Chave', 'Valor Gravado']],
            body: leadData,
            theme: 'grid',
            headStyles: { fillColor: [40, 40, 40] }
        });

        doc.save(`lead_detalhado_${lead.id}.pdf`);
    };

    const exportListPDF = (type: 'LEADS' | 'SUBMISSIONS') => {
        const doc = new jsPDF() as any;
        const data = type === 'LEADS' ? filteredLeads : filteredSubmissions;
        const title = type === 'LEADS' ? "LISTAGEM DE LEADS BBLAW" : "LISTAGEM DE PROTOCOLOS BBLAW";

        doc.setFontSize(20);
        doc.text(title, 20, 20);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 28);

        const tableHead = type === 'LEADS'
            ? [['Nome', 'Email', 'WhatsApp', 'Data']]
            : [['Cliente', 'Fluxo', 'Status', 'Data']];

        const tableBody = type === 'LEADS'
            ? data.map(l => [l.nome_completo_pessoal, l.email, l.whatsapp, new Date(l.createdAt).toLocaleDateString('pt-BR')])
            : data.map(s => [s.user?.fullName || s.user?.name, funnelConfig[s.funnelType]?.title || s.funnelType, s.priority, new Date(s.createdAt).toLocaleDateString('pt-BR')]);

        doc.autoTable({
            startY: 35,
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] }
        });

        doc.save(`${type.toLowerCase()}_bblaw_${Date.now()}.pdf`);
    };

    const exportToCSV = (data: any[], fileName: string) => {
        if (!data || !data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const csvRows = data.map(row =>
            Object.values(row).map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...csvRows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--admin-bg)', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--admin-fg)" />
            <p style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'var(--admin-label-color)', fontWeight: 500, letterSpacing: '0.2em' }}>SISTEMA DE GESTÃO BBLAW</p>
        </div>
    );
   return (
        <div style={{ background: 'var(--admin-bg)', color: 'var(--admin-fg)', minHeight: '100vh', display: 'flex' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                body { background-color: var(--admin-bg) !important; }
                .dash-grid {
                    background-image: linear-gradient(var(--admin-muted-low) 0.5px, transparent 0.5px),
                                    linear-gradient(90deg, var(--admin-muted-low) 0.5px, transparent 0.5px);
                    background-size: 60px 60px;
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--admin-muted-low); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--admin-muted); border-radius: 10px; }
            `}} />

            <div className="dash-grid" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', top: '0', right: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Sidebar Lateral */}
            <aside style={{
                width: '280px',
                background: 'var(--admin-sidebar-bg)',
                borderRight: '0.5px solid var(--admin-sidebar-border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                zIndex: 100
            }}>
                <div style={{ padding: '3rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck color="#000" size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>BBLAW</h2>
                        <p style={{ fontSize: '0.55rem', color: 'var(--admin-label-color)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>INTEL UNIT</p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <SidebarLink icon={<LayoutDashboard size={16} />} label="VISÃO GERAL" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
                    <div style={{ height: '1px', background: 'var(--admin-muted-low)', margin: '1rem 0.75rem' }} />
                    <SidebarLink icon={<Users size={16} />} label="LEADS ESTRATÉGICOS" active={activeTab === 'LEADS'} onClick={() => setActiveTab('LEADS')} />
                    <SidebarLink icon={<ClipboardList size={16} />} label="PROTOCOLOS ATIVOS" active={activeTab === 'SUBMISSIONS'} onClick={() => setActiveTab('SUBMISSIONS')} />
                    <SidebarLink icon={<FileUp size={16} />} label="REPOSITÓRIO DOCS" active={activeTab === 'DOCS'} onClick={() => setActiveTab('DOCS')} />
                    <SidebarLink icon={<Users size={16} />} label="DIRETÓRIO USUÁRIOS" active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} />
                </nav>

                <div style={{ padding: '2rem', borderTop: '0.5px solid var(--admin-card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: 'var(--admin-card-bg)', padding: '0.75rem', borderRadius: '4px', border: '0.5px solid var(--admin-card-border)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 500 }}>
                            {session?.user?.name?.[0] || 'A'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.name || 'Admin'}</p>
                            <p style={{ fontSize: '0.5rem', color: 'var(--admin-label-color)', fontWeight: 700 }}>PAINEL DE CONTROLE</p>
                        </div>
                    </div>
                    <button onClick={() => signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--admin-muted)', fontSize: '0.6rem', fontWeight: 500, padding: '8px 12px', borderRadius: '8px', transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--admin-fg)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--admin-muted)'}>
                        <LogOut size={14} /> ENCERRAR SESSÃO
                    </button>
                </div>
            </aside>

            {/* Viewport Principal */}
            <main style={{ marginLeft: '280px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <header className="dash-header" style={{ padding: '3.5rem 4rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                            {activeTab === 'OVERVIEW' ? 'SISTEMA DE INTELIGÊNCIA' : (activeTab === 'LEADS' ? 'LEADS ESTRATÉGICOS' : (activeTab === 'SUBMISSIONS' ? 'PROTOCOLOS ATIVOS' : activeTab))}
                        </h1>
                        <p style={{ fontSize: '0.65rem', color: 'var(--admin-label-color)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px' }}>GERENCIAMENTO DE ATIVOS E DADOS BBLAW</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
                            <input
                                type="text"
                                placeholder="LOCALIZAR REGISTRO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="dash-search-input"
                            />
                        </div>

                        <div style={{ width: '1px', height: '20px', background: 'var(--admin-muted-low)' }} />

                        <button onClick={toggleTheme} style={{ background: 'var(--admin-input-bg)', border: '0.5px solid var(--admin-card-border)', padding: '0.75rem', borderRadius: '4px', color: 'var(--admin-fg)', transition: 'all 0.3s' }}>
                            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                </header>

                <div style={{ flex: 1, padding: '0 4rem 4rem' }}>
                    {/* Filtros e Ações */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                        {(activeTab === 'LEADS' || activeTab === 'SUBMISSIONS') && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--admin-card-bg)', padding: '4px 12px', borderRadius: '4px', border: '0.5px solid var(--admin-card-border)' }}>
                                    <Filter size={12} style={{ opacity: 0.3 }} />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', fontSize: '0.55rem', color: 'var(--admin-fg)', fontWeight: 500, outline: 'none', letterSpacing: '0.05em', cursor: 'pointer' }}
                                    >
                                        <option value="ALL">TODOS OS ESTÁGIOS</option>
                                        <option value="PENDING">AGUARDANDO</option>
                                        <option value="REVIEWING">TRIAGEM</option>
                                        <option value="COMPLETED">FINALIZADO</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => exportListPDF(activeTab === 'LEADS' ? 'LEADS' : 'SUBMISSIONS')}
                                    className="btn-premium"
                                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.55rem', background: '#fff', color: '#000', borderRadius: '8px', fontWeight: 500, transition: 'var(--transition-smooth)' }}
                                >
                                    <Download size={14} /> EXPORTAR BATCH
                                </button>
                            </>
                        )}
                    </div>

                    {activeTab === 'OVERVIEW' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                                <OverviewCard icon={<Users size={20} />} label="LEADS ESTRATÉGICOS" value={leads.length} />
                                <OverviewCard icon={<ClipboardList size={20} />} label="PROTOCOLOS ATIVOS" value={submissions.length} />
                                <OverviewCard icon={<FileUp size={20} />} label="DOCUMENTOS EM CUSTÓDIA" value={docCount} />
                                <OverviewCard icon={<ShieldCheck size={20} />} label="VIP / ALTA PRIORIDADE" value={submissions.filter((s: any) => ['ALTA', 'VIP', 'URGENTE'].includes(s.priority)).length} />
                            </div>

                            <div style={{ background: 'var(--admin-card-bg)', border: '0.5px solid var(--admin-card-border)', borderRadius: '4px', padding: '2.5rem' }}>
                                <h4 style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--admin-label-color)', letterSpacing: '0.15em', marginBottom: '2rem', textAlign: 'center' }}>DISTRIBUIÇÃO POR ESTÁGIO</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
                                    {[
                                        { id: 'PENDING', label: 'AGUARDANDO', color: '#60a5fa' },
                                        { id: 'REVIEWING', label: 'TRIAGEM', color: '#f59e0b' },
                                        { id: 'COMPLETED', label: 'FINALIZADO', color: '#4ade80' }
                                    ].map(st => {
                                        const count = submissions.filter(s => s.status === st.id).length + leads.filter(l => l.status === st.id).length;
                                        const total = submissions.length + leads.length;
                                        const percent = total ? (count / total) * 100 : 0;
                                        return (
                                            <div key={st.id} style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: '0.25rem', color: st.color, letterSpacing: '-0.05em' }}>{count}</div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.4, marginBottom: '1.25rem', letterSpacing: '0.1em' }}>{st.label}</div>
                                                <div style={{ height: '4px', background: 'var(--admin-muted-low)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: st.color }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', background: 'var(--admin-card-bg)', border: '0.5px solid var(--admin-card-border)', borderRadius: '4px', padding: '2.5rem' }}>
                                <h4 style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--admin-label-color)', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>ATIVIDADE RECENTE</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[...submissions, ...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((act, i) => (
                                        <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-input-bg)', borderRadius: '4px', borderLeft: `2px solid ${act.priority === 'VIP' ? '#ef4444' : (act.priority === 'URGENTE' ? '#f59e0b' : 'var(--admin-card-border)')}` }}>
                                            <div style={{ width: '6px', height: '6px', background: act.status === 'COMPLETED' ? '#4ade80' : (act.status === 'REVIEWING' ? '#f59e0b' : 'var(--admin-muted-low)'), borderRadius: '50%' }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 400 }}>{act.nome_completo_pessoal || act.user?.fullName || act.user?.name}</p>
                                                <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{act.email} • {new Date(act.createdAt).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <span style={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.2 }}>{('funnelType' in act) ? 'PROTOCOLO' : 'LEAD'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--admin-sidebar-bg)', border: '0.5px solid var(--admin-card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                            {activeTab === 'LEADS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'var(--admin-card-bg)', borderBottom: '0.5px solid var(--admin-card-border)' }}>
                                        <tr>
                                            <AdminTh>LEAD</AdminTh>
                                            <AdminTh>IDENTIFICAÇÃO</AdminTh>
                                            <AdminTh>PRIORIDADE</AdminTh>
                                            <AdminTh>DATA</AdminTh>
                                            <AdminTh align="right">AÇÃO</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <FileText size={24} style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 500 }}>SEM DADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeads.map((lead) => (
                                                <tr key={lead.id} style={{ borderBottom: '1px solid var(--admin-card-border)', transition: 'background 0.2s', cursor: 'pointer' }}
                                                    onClick={() => setSelectedLead(lead)}
                                                >
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 400 }}>{lead.nome_completo_pessoal}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{lead.email}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.6 }}>{lead.cpf_nit || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd onClick={() => setSelectedLead(lead)}>
                                                        <StatusBadge priority={lead.priority} />
                                                    </AdminTd>
                                                    <AdminTd onClick={() => setSelectedLead(lead)}>
                                                        <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</p>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); exportLeadPDF(lead); }}
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--admin-muted-low)', color: 'var(--admin-fg)' }}
                                                                title="Download PDF"
                                                            >
                                                                <Download size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedLead(lead)}
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--admin-muted-low)', color: 'var(--admin-fg)' }}
                                                                title="Ver Detalhes"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                        </div>
                                                    </AdminTd>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : activeTab === 'SUBMISSIONS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'var(--admin-card-bg)', borderBottom: '1px solid var(--admin-card-border)' }}>
                                        <tr>
                                            <AdminTh>CLIENTE</AdminTh>
                                            <AdminTh>PROTOCOLO</AdminTh>
                                            <AdminTh>PRIORIDADE</AdminTh>
                                            <AdminTh>DATA / HORA</AdminTh>
                                            <AdminTh align="right">AÇÕES</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubmissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <ClipboardList size={24} style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 500 }}>SEM DADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSubmissions.map((sub) => (
                                                <tr key={sub.id} style={{ borderBottom: '1px solid var(--admin-card-border)', transition: 'background 0.2s', cursor: 'pointer' }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--admin-hover)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <AdminTd onClick={() => setSelectedSubmission(sub)}>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 400 }}>{sub.user?.fullName || sub.user?.name}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{sub.user?.email}</p>
                                                    </AdminTd>
                                                    <AdminTd onClick={() => setSelectedSubmission(sub)}>
                                                        <FunnelBadge funnelType={sub.funnelType} title={funnelConfig[sub.funnelType]?.title || sub.funnelType} />
                                                    </AdminTd>
                                                    <AdminTd onClick={() => setSelectedSubmission(sub)}>
                                                        <StatusBadge priority={sub.priority} />
                                                    </AdminTd>
                                                    <AdminTd onClick={() => setSelectedSubmission(sub)}>
                                                        <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{new Date(sub.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); exportSubmissionPDF(sub); }}
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--admin-muted-low)', color: 'var(--admin-fg)' }}
                                                                title="Download PDF"
                                                            >
                                                                <Download size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedSubmission(sub)}
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--admin-muted-low)', color: 'var(--admin-fg)' }}
                                                                title="Visualizar Respostas"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                        </div>
                                                    </AdminTd>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : activeTab === 'DOCS' ? (
                                <div>
                                    <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-card-border)', flexWrap: 'wrap' }}>
                                        {['ALL', 'RESIDENCIA_FISCAL_PARAGUAI', 'OFFSHORE_INTERNACIONAL', 'HOLDING_NACIONAL', 'ESTRUTURACAO_CRIPTO', 'PLANEJAMENTO_SUCESSORIO', 'CONTENCIOSO_ESTRATEGICO'].map(f => (
                                            <button key={f} onClick={() => setDocFunnelFilter(f)}
                                                style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--admin-card-border)', background: docFunnelFilter === f ? 'var(--admin-fg)' : 'transparent', color: docFunnelFilter === f ? 'var(--admin-bg)' : 'var(--admin-fg)', opacity: docFunnelFilter === f ? 1 : 0.4 }}>
                                                {f === 'ALL' ? 'TODOS' : f.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    {(() => {
                                        const docsFiltered = filteredDocs.filter((d: any) => docFunnelFilter === 'ALL' || d.funnelType === docFunnelFilter);
                                        const grouped = docsFiltered.reduce((acc: any, doc: any) => {
                                            const key = doc.userId || 'unknown';
                                            if (!acc[key]) acc[key] = { user: doc.user, userId: key, docs: [] };
                                            acc[key].docs.push(doc);
                                            return acc;
                                        }, {});
                                        const groups = Object.values(grouped) as any[];
                                        if (groups.length === 0) return (
                                            <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                <FileUp size={24} style={{ margin: '0 auto 1rem' }} />
                                                <p style={{ fontSize: '0.6rem', fontWeight: 500 }}>SEM DOCUMENTOS</p>
                                            </div>
                                        );
                                        return groups.map((group: any) => (
                                            <div key={group.userId} style={{ borderBottom: '1px solid var(--admin-card-border)' }}>
                                                <div onClick={() => setExpandedDocUser(expandedDocUser === group.userId ? null : group.userId)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--admin-hover)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', background: 'var(--admin-muted-low)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                            {(group.user?.name || group.user?.fullName || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>{group.user?.name || group.user?.fullName || 'NÃO IDENTIFICADO'}</p>
                                                            <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>{group.user?.email || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.4, background: 'var(--admin-muted-low)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                                                            {group.docs.length} {group.docs.length === 1 ? 'DOC' : 'DOCS'}
                                                        </span>
                                                        <ChevronRight size={14} style={{ opacity: 0.3, transform: expandedDocUser === group.userId ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                                    </div>
                                                </div>
                                                {expandedDocUser === group.userId && (
                                                    <div style={{ background: 'var(--admin-card-bg)' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid var(--admin-card-border)' }}>
                                                                    <AdminTh>ARQUIVO</AdminTh>
                                                                    <AdminTh>FLUXO</AdminTh>
                                                                    <AdminTh>TIPO</AdminTh>
                                                                    <AdminTh>TAMANHO</AdminTh>
                                                                    <AdminTh align="right">AÇÃO</AdminTh>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {group.docs.map((doc: any) => (
                                                                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--admin-card-border)', transition: 'background 0.2s' }}
                                                                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--admin-hover)')}
                                                                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                                    >
                                                                        <AdminTd>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                <FileText size={14} style={{ opacity: 0.3, flexShrink: 0 }} />
                                                                                <span style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8 }}>{doc.filename}</span>
                                                                            </div>
                                                                        </AdminTd>
                                                                        <AdminTd>
                                                                            <FunnelBadge funnelType={doc.funnelType} title={funnelConfig[doc.funnelType]?.title || doc.funnelType} />
                                                                        </AdminTd>
                                                                        <AdminTd>
                                                                            <span style={{ fontSize: '0.55rem', fontWeight: 500, textTransform: 'uppercase', opacity: 0.5 }}>{doc.tipo}</span>
                                                                        </AdminTd>
                                                                        <AdminTd>
                                                                            <span style={{ fontSize: '0.55rem', opacity: 0.3 }}>{(doc.size / 1024).toFixed(0)} KB</span>
                                                                        </AdminTd>
                                                                        <AdminTd align="right">
                                                                            <button
                                                                                onClick={() => {
                                                                                    fetch(`/api/download/${doc.id}`).then(async r => {
                                                                                        if (!r.ok) { alert('Erro ao baixar'); return; }
                                                                                        const blob = await r.blob();
                                                                                        const url = URL.createObjectURL(blob);
                                                                                        const a = document.createElement('a');
                                                                                        a.href = url; a.download = doc.filename || 'arquivo';
                                                                                        a.click(); URL.revokeObjectURL(url);
                                                                                    });
                                                                                }}
                                                                                style={{ padding: '0.4rem 1rem', borderRadius: '4px', background: 'var(--admin-fg)', color: 'var(--admin-bg)', fontSize: '0.5rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                                                            >
                                                                                BAIXAR
                                                                            </button>
                                                                        </AdminTd>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            ) : activeTab === 'WEBHOOKS' ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <ShieldCheck size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '0.5rem' }}>MindTech Ativa</h3>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.4, maxWidth: '400px', margin: '0 auto' }}>Sincronização estável com o n8n.</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'var(--admin-card-bg)', borderBottom: '1px solid var(--admin-card-border)' }}>
                                        <tr>
                                            <AdminTh>USUÁRIO</AdminTh>
                                            <AdminTh>DOC</AdminTh>
                                            <AdminTh>ORIGEM</AdminTh>
                                            <AdminTh align="right">AÇÃO</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <Users size={24} style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 500 }}>SEM DADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid var(--admin-card-border)' }}>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 400 }}>{user.fullName || user.name}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{user.email}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{user.document || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <span style={{ fontSize: '0.55rem', fontWeight: 500, background: 'var(--admin-muted-low)', padding: '2px 6px', borderRadius: '4px' }}>{user.origemLead}</span>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            style={{ fontSize: '0.6rem', fontWeight: 400, padding: '0.5rem 1rem', background: 'var(--admin-muted-low)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s' }}
                                                            onMouseOver={(e) => (e.currentTarget.style.background = 'var(--admin-sidebar-border)', e.currentTarget.style.color = 'var(--admin-fg)')}
                                                            onMouseOut={(e) => (e.currentTarget.style.background = 'var(--admin-muted-low)', e.currentTarget.style.color = 'var(--admin-fg)')}
                                                        >
                                                            DETALHAR
                                                        </button>
                                                    </AdminTd>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                <style jsx global>{`
                    .admin-sidebar {
                        z-index: 1000;
                    }
                    .admin-main {
                        margin-left: 280px;
                        transition: margin 0.3s ease;
                    }
                    .mobile-only {
                        display: none !important;
                    }

                    @media (max-width: 1024px) {
                        .admin-main {
                            margin-left: 0 !important;
                        }
                        .mobile-only {
                            display: flex !important;
                        }
                    }
                `}</style>
            </main >
            {/* Modal de Detalhes do Protocolo (Lateral Direita) */}
            <AnimatePresence>
                {
                    selectedSubmission && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedSubmission(null)} />
                            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                style={{ position: 'relative', width: 'min(640px, 90vw)', background: 'var(--admin-sidebar-bg)', borderLeft: '1px solid var(--admin-card-border)', height: '100%', display: 'flex', flexDirection: 'column', padding: '3rem' }}>
                                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.2em', marginBottom: '0.75rem' }}>RECURSOS ESTRATÉGICOS</p>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Detalhes do <br /><span style={{ color: 'var(--admin-muted)' }}>Protocolo</span></h3>
                                    </div>
                                    <button onClick={() => setSelectedSubmission(null)} style={{ opacity: 0.3, padding: '0.5rem' }}><X size={32} /></button>
                                </header>

                                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }} className="detail-grid">
                                        <DetailGroup label="Cliente Final" value={selectedSubmission.user?.fullName || selectedSubmission.user?.name} icon={<Users size={12} />} />
                                        <DetailGroup label="Tipo de Fluxo" value={funnelConfig[selectedSubmission.funnelType]?.title || selectedSubmission.funnelType} icon={<ClipboardList size={12} />} />
                                        <DetailGroup label="Canal de E-mail" value={selectedSubmission.user?.email} icon={<Mail size={12} />} />
                                        <DetailGroup label="Contato / WhatsApp" value={selectedSubmission.user?.phone} icon={<Users size={12} />} />
                                        <DetailGroup label="Registro / Doc" value={selectedSubmission.user?.document || 'PENDENTE'} icon={<ShieldCheck size={12} />} />
                                        <DetailGroup label="Prioridade" value={selectedSubmission.priority || 'A DEFINIR'} icon={<ShieldCheck size={12} />} />
                                        <DetailGroup label="Tags" value={selectedSubmission.tags?.join(', ') || 'Nenhuma'} icon={<FileText size={12} />} />
                                        <DetailGroup label="Pontuação (Score)" value={selectedSubmission.score || '0'} icon={<CheckCircle2 size={12} />} />
                                    </div>

                                    {/* Seção de Documentos Vinculados */}
                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Documentos Enviados</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {allDocs.filter(d => d.userId === selectedSubmission.userId && d.funnelType === selectedSubmission.funnelType).length === 0 ? (
                                                <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Nenhum documento vinculado a este protocolo.</p>
                                            ) : (
                                                allDocs.filter(d => d.userId === selectedSubmission.userId && d.funnelType === selectedSubmission.funnelType).map(doc => (
                                                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.7rem', fontWeight: 400 }}>{doc.filename}</p>
                                                            <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>{doc.tipo.toUpperCase()}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                fetch(`/api/download/${doc.id}`).then(async r => {
                                                                    if (!r.ok) { alert('Erro ao baixar'); return; }
                                                                    const blob = await r.blob();
                                                                    const url = URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.href = url; a.download = doc.filename || 'arquivo';
                                                                    a.click(); URL.revokeObjectURL(url);
                                                                });
                                                            }}
                                                            style={{ padding: '0.5rem', borderRadius: '8px', background: '#fff', color: '#000', cursor: 'pointer' }}
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <h4 style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Configuração de Urgência</h4>
                                        <PrioritySelector
                                            current={selectedSubmission.priority}
                                            onSelect={(p: string) => updatePriority(selectedSubmission.id, 'submission', p)}
                                            loading={isUpdating}
                                        />
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--admin-card-border)', paddingTop: '3rem' }}>
                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.1em', marginBottom: '2.5rem' }}>DADOS DA TRANSMISSÃO</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                            {Object.keys(selectedSubmission.data).map(key => {
                                                const val = selectedSubmission.data[key];

                                                // Busca o label amigável na configuração do funil
                                                let label = key.replace(/_/g, ' ').toUpperCase();
                                                const funnel = funnelConfig[selectedSubmission.funnelType];
                                                if (funnel) {
                                                    funnel.pages.forEach((p: any) => {
                                                        const q = p.questions.find((q: any) => q.id === key);
                                                        if (q) label = q.label.toUpperCase();
                                                    });
                                                }

                                                if (Array.isArray(val) && val.length > 0 && val[0] && typeof val[0] === 'object' && 'base64' in val[0]) {
                                                    return (
                                                        <div key={key}>
                                                            <p style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.2, textTransform: 'uppercase', marginBottom: '1rem' }}>{label}</p>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                {val.map((file: any, fIdx: number) => (
                                                                    <a key={fIdx} href={file.base64} download={file.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '4px', color: 'var(--admin-fg)', fontSize: '0.8rem', fontWeight: 700, transition: 'background 0.2s', textDecoration: 'none' }}
                                                                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--admin-hover)')}
                                                                        onMouseOut={(e) => (e.currentTarget.style.background = 'var(--admin-card-bg)')}
                                                                    >
                                                                        <FileText size={18} opacity={0.5} />
                                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                                                            <span style={{ fontSize: '0.55rem', opacity: 0.2, fontWeight: 500, marginTop: '2px' }}>CONFERIR ARQUIVO</span>
                                                                        </div>
                                                                        <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>{(file.size / 1024).toFixed(0)} KB</span>
                                                                        <Download size={14} opacity={0.2} />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={key}>
                                                        <p style={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.5 }}>
                                                            {Array.isArray(val) ? val.join(', ') : (typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val))}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--admin-card-border)', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => exportSubmissionPDF(selectedSubmission)} style={{ flex: 1, padding: '1.25rem', background: 'var(--admin-muted-low)', border: '1px solid var(--admin-card-border)', color: 'var(--admin-fg)', fontWeight: 400, borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> BAIXAR PDF
                                    </button>
                                    <button onClick={() => updateStatus(selectedSubmission.id, 'submission', 'COMPLETED')} style={{ flex: 1.5, padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 500, borderRadius: '4px', fontSize: '0.8rem', letterSpacing: '0.05em', cursor: 'pointer', opacity: isUpdating ? 0.5 : 1 }} disabled={isUpdating}>
                                        {isUpdating ? 'ATUALIZANDO...' : (selectedSubmission.status === 'COMPLETED' ? 'PROCESSADO ✓' : 'MARCAR COMO PROCESSADO')}
                                    </button>
                                    <button onClick={() => setSelectedSubmission(null)} style={{ flex: 1, padding: '1.25rem', border: '1px solid var(--admin-card-border)', fontWeight: 400, color: 'var(--admin-fg)', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>FECHAR</button>
                                </footer>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Modal de Detalhes do Lead (Lateral Direita) */}
            <AnimatePresence>
                {
                    selectedLead && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedLead(null)} />
                            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                style={{ position: 'relative', width: 'min(700px, 90vw)', background: 'var(--admin-sidebar-bg)', borderLeft: '1px solid var(--admin-card-border)', height: '100%', display: 'flex', flexDirection: 'column', padding: '3.5rem' }}>
                                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.2em', marginBottom: '1rem' }}>INFORMAÇÕES DE FORMULÁRIO</p>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.1 }}>Dados do <br /><span style={{ color: 'var(--admin-muted)' }}>Lead Estratégico</span></h3>
                                    </div>
                                    <button onClick={() => setSelectedLead(null)} style={{ opacity: 0.3, padding: '0.5rem' }}><X size={40} /></button>
                                </header>

                                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem', paddingBottom: '3rem', borderBottom: '1px solid var(--admin-card-border)' }} className="detail-grid">
                                        <DetailGroup label="Nome Completo" value={selectedLead.nome_completo_pessoal} icon={<Users size={12} />} />
                                        <DetailGroup label="E-mail" value={selectedLead.email} icon={<Mail size={12} />} />
                                        <DetailGroup label="WhatsApp" value={selectedLead.whatsapp} icon={<ExternalLink size={12} />} />
                                        <DetailGroup label="CPF / Documento" value={selectedLead.cpf_nit} icon={<ShieldCheck size={12} />} />
                                        <DetailGroup label="Ocupação / Cargo" value={selectedLead.ocupacao} icon={<LayoutDashboard size={12} />} />
                                        <DetailGroup label="Jurisdição" value={selectedLead.jurisdicao} icon={<FileText size={12} />} />
                                        <DetailGroup label="Relação Empresa" value={selectedLead.relacao_empresa} icon={<Settings size={12} />} />
                                        <DetailGroup label="Prioridade" value={selectedLead.priority || 'NORMAL'} icon={<ShieldCheck size={12} />} />
                                        <DetailGroup label="Criado em" value={new Date(selectedLead.createdAt).toLocaleString('pt-BR')} icon={<Calendar size={12} />} />
                                    </div>

                                    {/* Seção de Documentos Vinculados ao Lead */}
                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Documentos Enviados pelo Lead</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {allDocs.filter(d => d.userId === selectedLead.userId).length === 0 ? (
                                                <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Nenhum documento vinculado a este lead.</p>
                                            ) : (
                                                allDocs.filter(d => d.userId === selectedLead.userId).map(doc => (
                                                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.7rem', fontWeight: 400 }}>{doc.filename}</p>
                                                            <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>{doc.tipo.toUpperCase()} - {doc.funnelType}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                fetch(`/api/download/${doc.id}`).then(async r => {
                                                                    if (!r.ok) { alert('Erro ao baixar'); return; }
                                                                    const blob = await r.blob();
                                                                    const url = URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.href = url; a.download = doc.filename || 'arquivo';
                                                                    a.click(); URL.revokeObjectURL(url);
                                                                });
                                                            }}
                                                            style={{ padding: '0.5rem', borderRadius: '8px', background: '#fff', color: '#000', cursor: 'pointer' }}
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <h4 style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Definir Prioridade do Lead</h4>
                                        <PrioritySelector
                                            current={selectedLead.priority}
                                            onSelect={(p: string) => updatePriority(selectedLead.id, 'lead', p)}
                                            loading={isUpdating}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        <h4 style={{ gridColumn: '1 / -1', fontSize: '0.7rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.1em', marginTop: '1rem' }}>RESPOSTAS DO FORMULÁRIO</h4>
                                        {Object.entries(selectedLead).map(([key, value]) => {
                                            // Filtra campos internos ou já mostrados no cabeçalho
                                            if (['id', 'userId', 'createdAt', 'updatedAt', 'user'].includes(key)) return null;
                                            if (value === null || value === undefined || value === '') return null;

                                            // Formata a label
                                            const label = key.replace(/_/g, ' ').toUpperCase();

                                            return (
                                                <div key={key} style={{ background: 'var(--admin-card-bg)', padding: '1.25rem', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                                    <p style={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.2, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{label}</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.4, color: 'var(--admin-fg)' }}>
                                                        {Array.isArray(value) ? value.join(', ') :
                                                            (typeof value === 'boolean' ? (value ? 'SIM' : 'NÃO') :
                                                                (typeof value === 'object' ? JSON.stringify(value) : String(value)))}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--admin-card-border)', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => exportLeadPDF(selectedLead)} style={{ flex: 1, padding: '1.25rem', background: 'var(--admin-muted-low)', border: '1px solid var(--admin-card-border)', color: 'var(--admin-fg)', fontWeight: 400, borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> EXPORTAR PDF
                                    </button>
                                    <button onClick={() => updateStatus(selectedLead.id, 'lead', 'COMPLETED')} style={{ flex: 1.5, padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 500, borderRadius: '4px', fontSize: '0.8rem', letterSpacing: '0.05em', cursor: 'pointer', opacity: isUpdating ? 0.5 : 1 }} disabled={isUpdating}>
                                        {isUpdating ? 'ATUALIZANDO...' : (selectedLead.status === 'COMPLETED' ? 'PROCESSADO ✓' : 'CONCLUIR LEAD')}
                                    </button>
                                    <button onClick={() => setSelectedLead(null)} style={{ flex: 1, padding: '1.25rem', border: '1px solid var(--admin-card-border)', fontWeight: 400, color: 'var(--admin-fg)', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>FECHAR</button>
                                </footer>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Modal de Detalhes do Usuário */}
            <AnimatePresence>
                {
                    selectedUser && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                style={{ width: 'min(500px, 95vw)', background: 'var(--admin-sidebar-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '3rem', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
                                <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: 'var(--admin-fg)', opacity: 0.3, cursor: 'pointer' }}><X size={24} /></button>
                                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'var(--admin-muted-low)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 500, margin: '0 auto 1.5rem', border: '1px solid var(--admin-card-border)' }}>
                                        {selectedUser.name?.[0] || selectedUser.fullName?.[0]}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{selectedUser.fullName || selectedUser.name}</h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 700 }}>{selectedUser.email}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.2 }}>DOCUMENTO</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{selectedUser.document || 'NÃO INFORMADO'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.2 }}>ORIGEM</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#3b82f6' }}>{selectedUser.origemLead || 'DIRETO'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--admin-card-bg)', borderRadius: '4px', border: '1px solid var(--admin-card-border)' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.2 }}>MEMBRO DESDE</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '3rem' }}>
                                    <h4 style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.3, letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Requisitos do Cliente</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1.5rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '4px', textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.2rem' }}>{submissions.filter(s => s.userId === selectedUser.id).length}</p>
                                            <p style={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.3 }}>PROTOCOLOS</p>
                                        </div>
                                        <div style={{ padding: '1.5rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '4px', textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.2rem' }}>{allDocs.filter(d => d.userId === selectedUser.id).length}</p>
                                            <p style={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.3 }}>DOCUMENTOS</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedUser(null)} style={{ width: '100%', padding: '1.25rem', background: 'var(--admin-fg)', color: 'var(--admin-bg)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em', cursor: 'pointer' }}>CONCLUIR VISUALIZAÇÃO</button>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}

function OverviewCard({ icon, label, value }: { icon: any, label: string, value: number }) {
    return (
        <motion.div
            whileHover={{ y: -2, background: 'var(--admin-card-bg)', borderColor: 'var(--admin-sidebar-border)' }}
            className="card-premium"
            style={{
                padding: '2rem 1.5rem',
                flexDirection: 'column',
                gap: '1.25rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '10px', background: 'var(--admin-card-bg)', border: '0.5px solid var(--admin-card-border)', borderRadius: '4px', color: 'var(--admin-muted)' }}>{icon}</div>
                <h3 style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--admin-label-color)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</h3>
            </div>
            <div>
                <p style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: 'Outfit' }}>{value}</p>
                <div style={{ height: '1px', width: '2rem', background: 'var(--admin-card-border)', marginTop: '0.75rem' }} />
            </div>
        </motion.div>
    );
}

function SidebarLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick} 
            style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.85rem 1.25rem', 
                borderRadius: '4px', 
                background: active ? 'var(--admin-hover)' : 'transparent',
                color: active ? 'var(--admin-fg)' : 'var(--admin-muted)',
                border: active ? '0.5px solid var(--admin-card-border)' : '0.5px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}
            onMouseOver={(e) => !active && (e.currentTarget.style.color = 'var(--admin-fg)')}
            onMouseOut={(e) => !active && (e.currentTarget.style.color = 'var(--admin-muted)')}
        >
            <span style={{ opacity: active ? 1 : 0.4 }}>{icon}</span>
            {label}
        </button>
    );
}

function AdminTh({ children, align = 'left', style = {} }: any) {
    return <th style={{ padding: '1rem 1.5rem', fontSize: '0.55rem', fontWeight: 500, color: 'var(--admin-label-color)', letterSpacing: '0.2em', textAlign: align, textTransform: 'uppercase', borderBottom: '1px solid var(--admin-card-border)', ...style }}>{children}</th>;
}

function AdminTd({ children, align = 'left', onClick }: any) {
    return <td style={{ padding: '1rem 1.5rem', textAlign: align, verticalAlign: 'middle' }} onClick={onClick}>{children}</td>;
}

function PrioritySelector({ current, onSelect, loading }: any) {
    const priorities = [
        { id: 'A DEFINIR', color: 'var(--admin-muted-low)' },
        { id: 'NORMAL', color: 'var(--admin-muted)' },
        { id: 'ALTA', color: 'var(--admin-fg)' },
        { id: 'URGENTE', color: '#f59e0b' },
        { id: 'VIP', color: '#ef4444' }
    ];

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {priorities.map(p => {
                const isActive = (current || 'A DEFINIR').toUpperCase() === p.id;
                return (
                    <button
                        key={p.id}
                        disabled={loading}
                        onClick={() => onSelect(p.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            background: isActive ? p.color : 'var(--admin-input-bg)',
                            color: isActive ? (p.color === '#ef4444' || p.color === '#f59e0b' ? '#fff' : 'var(--admin-bg)') : 'var(--admin-muted)',
                            fontSize: '0.6rem',
                            fontWeight: 500,
                            border: '1px solid ' + (isActive ? p.color : 'var(--admin-card-border)'),
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {p.id}
                    </button>
                );
            })}
        </div>
    );
}

function StatusBadge({ priority }: any) {
    const priorities_list: { id: string; color: string; bg: string }[] = [
        { id: 'A DEFINIR', color: '#888888',  bg: 'rgba(136,136,136,0.10)' },
        { id: 'NORMAL',    color: '#60a5fa',  bg: 'rgba(96,165,250,0.12)'  },
        { id: 'ALTA',      color: '#f59e0b',  bg: 'rgba(245,158,11,0.12)'  },
        { id: 'URGENTE',   color: '#ef4444',  bg: 'rgba(239,68,68,0.12)'   },
        { id: 'VIP',       color: '#c8a96e',  bg: 'rgba(200,169,110,0.15)' },
    ];
    const p = priorities_list.find(pl => pl.id === (priority?.toUpperCase() || '')) || priorities_list[0];
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: p.bg, color: p.color, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: `1px solid ${p.color}44` }}>
            <div style={{ width: '5px', height: '5px', background: p.color, borderRadius: '50%', flexShrink: 0 }} />
            {priority || 'A DEFINIR'}
        </div>
    );
}

const FUNNEL_COLORS: Record<string, { color: string; bg: string }> = {
    PARAGUAI:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
    OFFSHORE:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
    HOLDING:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    CRIPTO:      { color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
    SUCESSORIO:  { color: '#facc15', bg: 'rgba(250,204,21,0.12)'  },
    CONTENCIOSO: { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    COMPLIANCE:  { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)'  },
    CONTABIL:    { color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
};

function FunnelBadge({ funnelType, title }: { funnelType: string; title: string }) {
    const c = FUNNEL_COLORS[funnelType?.toUpperCase()] || { color: '#aaaaaa', bg: 'rgba(170,170,170,0.10)' };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px', background: c.bg, color: c.color, borderRadius: '6px', border: `1px solid ${c.color}33`, whiteSpace: 'nowrap' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
            {title}
        </span>
    );
}

function DetailGroup({ label, value, icon }: any) {
    return (
        <div style={{ background: 'var(--admin-card-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--admin-card-border)' }}>
            <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.12em' }}>{icon} {label}</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-fg)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{value || '—'}</p>
        </div>
    );
}
