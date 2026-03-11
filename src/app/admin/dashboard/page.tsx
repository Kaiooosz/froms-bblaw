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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="white" />
            <p style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'white', fontWeight: 900, opacity: 0.3, letterSpacing: '0.2em' }}>SISTEMA DE GESTÃO BBLAW</p>
        </div>
    );
   return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', fontFamily: 'Inter' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                body { background-color: #000 !important; }
                .dash-grid {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.015) 0.5px, transparent 0.5px),
                                    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0.5px, transparent 0.5px);
                    background-size: 60px 60px;
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
            `}} />

            <div className="dash-grid" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', top: '0', right: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Sidebar Lateral */}
            <aside style={{
                width: '280px',
                background: '#050505',
                borderRight: '0.5px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                zIndex: 100
            }}>
                <div style={{ padding: '3rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck color="#000" size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>BBLAW</h2>
                        <p style={{ fontSize: '0.55rem', opacity: 0.3, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>INTEL UNIT</p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <SidebarLink icon={<LayoutDashboard size={16} />} label="VISÃO GERAL" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.03)', margin: '1rem 0.75rem' }} />
                    <SidebarLink icon={<Users size={16} />} label="LEADS ESTRATÉGICOS" active={activeTab === 'LEADS'} onClick={() => setActiveTab('LEADS')} />
                    <SidebarLink icon={<ClipboardList size={16} />} label="PROTOCOLOS ATIVOS" active={activeTab === 'SUBMISSIONS'} onClick={() => setActiveTab('SUBMISSIONS')} />
                    <SidebarLink icon={<FileUp size={16} />} label="REPOSITÓRIO DOCS" active={activeTab === 'DOCS'} onClick={() => setActiveTab('DOCS')} />
                    <SidebarLink icon={<Users size={16} />} label="DIRETÓRIO USUÁRIOS" active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} />
                </nav>

                <div style={{ padding: '2rem', borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900 }}>
                            {session?.user?.name?.[0] || 'A'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.name || 'Admin'}</p>
                            <p style={{ fontSize: '0.5rem', opacity: 0.3, fontWeight: 700 }}>PAINEL DE CONTROLE</p>
                        </div>
                    </div>
                    <button onClick={() => signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontWeight: 900, padding: '8px 12px', borderRadius: '8px', transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                        <LogOut size={14} /> ENCERRAR SESSÃO
                    </button>
                </div>
            </aside>

            {/* Viewport Principal */}
            <main style={{ marginLeft: '280px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <header className="dash-header" style={{ padding: '3.5rem 4rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, fontFamily: 'Outfit' }}>
                            {activeTab === 'OVERVIEW' ? 'SISTEMA DE INTELIGÊNCIA' : (activeTab === 'LEADS' ? 'LEADS ESTRATÉGICOS' : (activeTab === 'SUBMISSIONS' ? 'PROTOCOLOS ATIVOS' : activeTab))}
                        </h1>
                        <p style={{ fontSize: '0.65rem', opacity: 0.3, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '6px' }}>GERENCIAMENTO DE ATIVOS E DADOS BBLAW</p>
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

                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.05)' }} />

                        <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', padding: '0.75rem', borderRadius: '10px', color: '#fff', transition: 'all 0.3s' }}>
                            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                </header>

                <div style={{ flex: 1, padding: '0 4rem 4rem' }}>
                    {/* Filtros e Ações */}
                    <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                        {(activeTab === 'LEADS' || activeTab === 'SUBMISSIONS') && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '4px 12px', borderRadius: '10px', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                                    <Filter size={12} style={{ opacity: 0.3 }} />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', fontSize: '0.55rem', color: '#fff', fontWeight: 900, outline: 'none', letterSpacing: '0.05em', cursor: 'pointer' }}
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
                                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.55rem', background: '#fff', color: '#000', borderRadius: '8px', fontWeight: 900, transition: 'var(--transition-smooth)' }}
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

                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2.5rem' }}>
                                <h4 style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '2rem', textAlign: 'center' }}>DISTRIBUIÇÃO POR ESTÁGIO</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
                                    {[
                                        { id: 'PENDING', label: 'AGUARDANDO', color: 'rgba(255,255,255,0.2)' },
                                        { id: 'REVIEWING', label: 'TRIAGEM', color: 'rgba(255,255,255,0.5)' },
                                        { id: 'COMPLETED', label: 'FINALIZADO', color: '#ffffff' }
                                    ].map(st => {
                                        const count = submissions.filter(s => s.status === st.id).length + leads.filter(l => l.status === st.id).length;
                                        const total = submissions.length + leads.length;
                                        const percent = total ? (count / total) * 100 : 0;
                                        return (
                                            <div key={st.id} style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.25rem', color: st.color, letterSpacing: '-0.05em' }}>{count}</div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.4, marginBottom: '1.25rem', letterSpacing: '0.1em' }}>{st.label}</div>
                                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: st.color }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2.5rem' }}>
                                <h4 style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem' }}>ATIVIDADE RECENTE</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[...submissions, ...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((act, i) => (
                                        <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', borderLeft: `2px solid ${act.priority === 'VIP' ? '#fff' : (act.priority === 'URGENTE' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)')}` }}>
                                            <div style={{ width: '6px', height: '6px', background: act.status === 'COMPLETED' ? '#fff' : (act.status === 'REVIEWING' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'), borderRadius: '50%' }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>{act.nome_completo_pessoal || act.user?.fullName || act.user?.name}</p>
                                                <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{act.email} • {new Date(act.createdAt).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <span style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2 }}>{('funnelType' in act) ? 'PROTOCOLO' : 'LEAD'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: '#050505', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                            {activeTab === 'LEADS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
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
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900 }}>SEM DADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeads.map((lead) => (
                                                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', cursor: 'pointer' }}
                                                    onClick={() => setSelectedLead(lead)}
                                                >
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>{lead.nome_completo_pessoal}</p>
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
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                                                title="Download PDF"
                                                            >
                                                                <Download size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedLead(lead)}
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
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
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900 }}>SEM DADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSubmissions.map((sub) => (
                                                <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', cursor: 'pointer' }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <AdminTd onClick={() => setSelectedSubmission(sub)}>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>{sub.user?.fullName || sub.user?.name}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{sub.user?.email}</p>
                                                    </AdminTd>
                                                    <AdminTd onClick={() => setSelectedSubmission(sub)}>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                                            {funnelConfig[sub.funnelType]?.title || sub.funnelType}
                                                        </span>
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
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                                                title="Download PDF"
                                                            >
                                                                <Download size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedSubmission(sub)}
                                                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
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
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <AdminTh>CLIENTE</AdminTh>
                                            <AdminTh>FLUXO</AdminTh>
                                            <AdminTh>ARQUIVO / NOME</AdminTh>
                                            <AdminTh>TIPO</AdminTh>
                                            <AdminTh align="right">AÇÃO</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <FileUp size={24} style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900 }}>SEM DOCUMENTOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDocs.map((doc) => (
                                                <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <AdminTd>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900 }}>
                                                                {(doc.user?.name || doc.user?.fullName || '?')[0]}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>{doc.user?.name || doc.user?.fullName || 'NÃO IDENTIFICADO'}</p>
                                                                <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>{doc.user?.email || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <span style={{ fontSize: '0.55rem', fontWeight: 900, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '100px', opacity: 0.6 }}>{doc.funnelType}</span>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.6 }}>{doc.filename}</p>
                                                        <p style={{ fontSize: '0.5rem', opacity: 0.2 }}>{(doc.size / 1024).toFixed(0)} KB</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', opacity: 0.3 }} />
                                                            <span style={{ fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.6 }}>{doc.tipo}</span>
                                                        </div>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <button
                                                            onClick={() => {
                                                                fetch(`/api/download/${doc.id}`).then(r => r.json()).then(d => {
                                                                    if (d.url) window.open(d.url, '_blank');
                                                                });
                                                            }}
                                                            style={{ padding: '0.55rem 1.25rem', borderRadius: '100px', background: '#fff', color: '#000', fontSize: '0.55rem', fontWeight: 900, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)', e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.4)')}
                                                            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)', e.currentTarget.style.boxShadow = 'none')}
                                                        >
                                                            ABRIR
                                                        </button>
                                                    </AdminTd>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : activeTab === 'WEBHOOKS' ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <ShieldCheck size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>MindTech Ativa</h3>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.4, maxWidth: '400px', margin: '0 auto' }}>Sincronização estável com o n8n.</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900 }}>SEM DADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>{user.fullName || user.name}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{user.email}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>{user.document || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <span style={{ fontSize: '0.55rem', fontWeight: 900, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '100px' }}>{user.origemLead}</span>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', cursor: 'pointer', transition: 'all 0.3s' }}
                                                            onMouseOver={(e) => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#000')}
                                                            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = '#fff')}
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
                                style={{ position: 'relative', width: 'min(640px, 90vw)', background: '#080808', borderLeft: '1px solid rgba(255,255,255,0.1)', height: '100%', display: 'flex', flexDirection: 'column', padding: '3rem' }}>
                                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.2em', marginBottom: '0.75rem' }}>RECURSOS ESTRATÉGICOS</p>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Detalhes do <br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>Protocolo</span></h3>
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
                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Documentos Enviados</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {allDocs.filter(d => d.userId === selectedSubmission.userId && d.funnelType === selectedSubmission.funnelType).length === 0 ? (
                                                <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Nenhum documento vinculado a este protocolo.</p>
                                            ) : (
                                                allDocs.filter(d => d.userId === selectedSubmission.userId && d.funnelType === selectedSubmission.funnelType).map(doc => (
                                                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>{doc.filename}</p>
                                                            <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>{doc.tipo.toUpperCase()}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                fetch(`/api/download/${doc.id}`).then(r => r.json()).then(d => {
                                                                    if (d.url) window.open(d.url, '_blank');
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

                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Configuração de Urgência</h4>
                                        <PrioritySelector
                                            current={selectedSubmission.priority}
                                            onSelect={(p: string) => updatePriority(selectedSubmission.id, 'submission', p)}
                                            loading={isUpdating}
                                        />
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem' }}>
                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.1em', marginBottom: '2.5rem' }}>DADOS DA TRANSMISSÃO</h4>
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
                                                            <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '1rem' }}>{label}</p>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                {val.map((file: any, fIdx: number) => (
                                                                    <a key={fIdx} href={file.base64} download={file.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: 700, transition: 'background 0.2s', textDecoration: 'none' }}
                                                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                                    >
                                                                        <FileText size={18} opacity={0.5} />
                                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                                                            <span style={{ fontSize: '0.55rem', opacity: 0.2, fontWeight: 900, marginTop: '2px' }}>CONFERIR ARQUIVO</span>
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
                                                        <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.5 }}>
                                                            {Array.isArray(val) ? val.join(', ') : (typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val))}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => exportSubmissionPDF(selectedSubmission)} style={{ flex: 1, padding: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> BAIXAR PDF
                                    </button>
                                    <button onClick={() => updateStatus(selectedSubmission.id, 'submission', 'COMPLETED')} style={{ flex: 1.5, padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 900, borderRadius: '100px', fontSize: '0.8rem', letterSpacing: '0.05em', cursor: 'pointer', opacity: isUpdating ? 0.5 : 1 }} disabled={isUpdating}>
                                        {isUpdating ? 'ATUALIZANDO...' : (selectedSubmission.status === 'COMPLETED' ? 'PROCESSADO ✓' : 'MARCAR COMO PROCESSADO')}
                                    </button>
                                    <button onClick={() => setSelectedSubmission(null)} style={{ flex: 1, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, color: '#fff', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer' }}>FECHAR</button>
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
                                style={{ position: 'relative', width: 'min(700px, 90vw)', background: '#080808', borderLeft: '1px solid rgba(255,255,255,0.1)', height: '100%', display: 'flex', flexDirection: 'column', padding: '3.5rem' }}>
                                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.2em', marginBottom: '1rem' }}>INFORMAÇÕES DE FORMULÁRIO</p>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>Dados do <br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>Lead Estratégico</span></h3>
                                    </div>
                                    <button onClick={() => setSelectedLead(null)} style={{ opacity: 0.3, padding: '0.5rem' }}><X size={40} /></button>
                                </header>

                                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="detail-grid">
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
                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Documentos Enviados pelo Lead</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {allDocs.filter(d => d.userId === selectedLead.userId).length === 0 ? (
                                                <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Nenhum documento vinculado a este lead.</p>
                                            ) : (
                                                allDocs.filter(d => d.userId === selectedLead.userId).map(doc => (
                                                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>{doc.filename}</p>
                                                            <p style={{ fontSize: '0.55rem', opacity: 0.3 }}>{doc.tipo.toUpperCase()} - {doc.funnelType}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                fetch(`/api/download/${doc.id}`).then(r => r.json()).then(d => {
                                                                    if (d.url) window.open(d.url, '_blank');
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

                                    <div style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Definir Prioridade do Lead</h4>
                                        <PrioritySelector
                                            current={selectedLead.priority}
                                            onSelect={(p: string) => updatePriority(selectedLead.id, 'lead', p)}
                                            loading={isUpdating}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        <h4 style={{ gridColumn: '1 / -1', fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.1em', marginTop: '1rem' }}>RESPOSTAS DO FORMULÁRIO</h4>
                                        {Object.entries(selectedLead).map(([key, value]) => {
                                            // Filtra campos internos ou já mostrados no cabeçalho
                                            if (['id', 'userId', 'createdAt', 'updatedAt', 'user'].includes(key)) return null;
                                            if (value === null || value === undefined || value === '') return null;

                                            // Formata a label
                                            const label = key.replace(/_/g, ' ').toUpperCase();

                                            return (
                                                <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{label}</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>
                                                        {Array.isArray(value) ? value.join(', ') :
                                                            (typeof value === 'boolean' ? (value ? 'SIM' : 'NÃO') :
                                                                (typeof value === 'object' ? JSON.stringify(value) : String(value)))}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => exportLeadPDF(selectedLead)} style={{ flex: 1, padding: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> EXPORTAR PDF
                                    </button>
                                    <button onClick={() => updateStatus(selectedLead.id, 'lead', 'COMPLETED')} style={{ flex: 1.5, padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 900, borderRadius: '100px', fontSize: '0.8rem', letterSpacing: '0.05em', cursor: 'pointer', opacity: isUpdating ? 0.5 : 1 }} disabled={isUpdating}>
                                        {isUpdating ? 'ATUALIZANDO...' : (selectedLead.status === 'COMPLETED' ? 'PROCESSADO ✓' : 'CONCLUIR LEAD')}
                                    </button>
                                    <button onClick={() => setSelectedLead(null)} style={{ flex: 1, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, color: '#fff', borderRadius: '100px', fontSize: '0.8rem', cursor: 'pointer' }}>FECHAR</button>
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
                                style={{ width: 'min(500px, 95vw)', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '3rem', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
                                <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: '#fff', opacity: 0.3, cursor: 'pointer' }}><X size={24} /></button>
                                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, margin: '0 auto 1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {selectedUser.name?.[0] || selectedUser.fullName?.[0]}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{selectedUser.fullName || selectedUser.name}</h3>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 700 }}>{selectedUser.email}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2 }}>DOCUMENTO</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{selectedUser.document || 'NÃO INFORMADO'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2 }}>ORIGEM</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6' }}>{selectedUser.origemLead || 'DIRETO'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2 }}>MEMBRO DESDE</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '3rem' }}>
                                    <h4 style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Requisitos do Cliente</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.2rem' }}>{submissions.filter(s => s.userId === selectedUser.id).length}</p>
                                            <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.3 }}>PROTOCOLOS</p>
                                        </div>
                                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center' }}>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.2rem' }}>{allDocs.filter(d => d.userId === selectedUser.id).length}</p>
                                            <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.3 }}>DOCUMENTOS</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedUser(null)} style={{ width: '100%', padding: '1.25rem', background: '#fff', color: '#000', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}>CONCLUIR VISUALIZAÇÃO</button>
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
            whileHover={{ y: -2, background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
            className="card-premium"
            style={{
                padding: '2rem 1.5rem',
                flexDirection: 'column',
                gap: '1.25rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'rgba(255,255,255,0.6)' }}>{icon}</div>
                <h3 style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</h3>
            </div>
            <div>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: 'Outfit' }}>{value}</p>
                <div style={{ height: '1px', width: '2rem', background: 'rgba(255,255,255,0.1)', marginTop: '0.75rem' }} />
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
                borderRadius: '12px', 
                background: active ? 'rgba(255,255,255,0.04)' : 'transparent', 
                color: active ? '#fff' : 'rgba(255,255,255,0.3)', 
                border: active ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}
            onMouseOver={(e) => !active && (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseOut={(e) => !active && (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
            <span style={{ opacity: active ? 1 : 0.4 }}>{icon}</span>
            {label}
        </button>
    );
}

function AdminTh({ children, align = 'left', style = {} }: any) {
    return <th style={{ padding: '1rem 1.5rem', fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, letterSpacing: '0.2em', textAlign: align, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', ...style }}>{children}</th>;
}

function AdminTd({ children, align = 'left', onClick }: any) {
    return <td style={{ padding: '1rem 1.5rem', textAlign: align, verticalAlign: 'middle' }} onClick={onClick}>{children}</td>;
}

function PrioritySelector({ current, onSelect, loading }: any) {
    const priorities = [
        { id: 'A DEFINIR', color: 'rgba(255,255,255,0.2)' },
        { id: 'NORMAL', color: 'rgba(255,255,255,0.4)' },
        { id: 'ALTA', color: 'rgba(255,255,255,0.6)' },
        { id: 'URGENTE', color: 'rgba(255,255,255,0.8)' },
        { id: 'VIP', color: '#ffffff' }
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
                            borderRadius: '100px',
                            background: isActive ? p.color : 'rgba(255,255,255,0.05)',
                            color: isActive ? (p.color === '#fff' ? '#000' : '#fff') : 'rgba(255,255,255,0.3)',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            border: '1px solid ' + (isActive ? p.color : 'rgba(255,255,255,0.1)'),
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
    const priorities_list = [
        { id: 'A DEFINIR', color: 'rgba(255,255,255,0.2)' },
        { id: 'NORMAL', color: 'rgba(255,255,255,0.4)' },
        { id: 'ALTA', color: 'rgba(255,255,255,0.6)' },
        { id: 'URGENTE', color: 'rgba(255,255,255,0.8)' },
        { id: 'VIP', color: '#ffffff' }
    ];
    const p = priorities_list.find(pl => pl.id === priority?.toUpperCase()) || priorities_list[0];
    const isSpecial = ['ALTA', 'URGENTE', 'VIP', 'NORMAL'].includes(priority?.toUpperCase());

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '6px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.03)', color: isSpecial ? p.color : 'rgba(255,255,255,0.3)', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: isSpecial ? `1px solid ${p.color}33` : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '5px', height: '5px', background: isSpecial ? p.color : 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            {priority || 'A DEFINIR'}
        </div>
    );
}

function DetailGroup({ label, value, icon }: any) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.12em' }}>{icon} {label}</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{value || '—'}</p>
        </div>
    );
}
