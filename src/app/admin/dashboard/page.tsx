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
    Menu as MenuIcon
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
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADS' | 'SUBMISSIONS' | 'USERS' | 'WEBHOOKS'>('LEADS');
    const [users, setUsers] = useState<any[]>([]);
    const [filterType, setFilterType] = useState('ALL');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            }
        };

        checkAuth();
    }, [status, session]);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/submissions');
            let data = await res.json();
            if (!Array.isArray(data)) data = [];
            setSubmissions(data);
        } catch (err) { setSubmissions([]); }
        finally { setLoading(false); }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/admin/leads');
            let data = await res.json();
            if (!Array.isArray(data)) data = [];
            setLeads(data);
        } catch (err) { setLeads([]); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            let data = await res.json();
            if (!Array.isArray(data)) data = [];
            setUsers(data);
        } catch (err) { setUsers([]); }
    };

    const filteredLeads = (Array.isArray(leads) ? leads : []).filter(lead =>
        (lead.nome_completo_pessoal || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.whatsapp || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSubmissions = (Array.isArray(submissions) ? submissions : []).filter(sub => {
        const matchesSearch =
            (sub.user?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' || sub.funnelType.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
        (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                ['Prioridade', sub.priority || 'NORMAL'],
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
        <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff' }}>
            {/* Sidebar Lateral Minimalista */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 1.5rem',
                position: 'fixed',
                height: '100vh',
                zIndex: 100,
                background: '#000',
                transition: 'transform 0.3s ease',
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                left: 0,
                top: 0
            }} className="admin-sidebar">
                <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src="/LogoBranco.svg" alt="BBLAW" style={{ maxWidth: '80px' }} />
                        <span style={{ fontSize: '0.4rem', fontWeight: 900, background: '#fff', color: '#000', padding: '2px 5px', borderRadius: '3px', letterSpacing: '0.05em' }}>ADM</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem' }} className="mobile-only">
                        <X size={20} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                    <SidebarLink icon={<LayoutDashboard size={16} />} label="Overview" active={activeTab === 'OVERVIEW'} onClick={() => { setActiveTab('OVERVIEW'); setIsSidebarOpen(false); }} />
                    <SidebarLink icon={<FileText size={16} />} label="Leads Detalhados" active={activeTab === 'LEADS'} onClick={() => { setActiveTab('LEADS'); setIsSidebarOpen(false); }} />
                    <SidebarLink icon={<ClipboardList size={16} />} label="Formulários Recebidos" active={activeTab === 'SUBMISSIONS'} onClick={() => { setActiveTab('SUBMISSIONS'); setIsSidebarOpen(false); }} />
                    <SidebarLink icon={<Users size={16} />} label="Usuários Registrados" active={activeTab === 'USERS'} onClick={() => { setActiveTab('USERS'); setIsSidebarOpen(false); }} />
                    <SidebarLink icon={<Settings size={16} />} label="Configurações" active={false} onClick={() => { }} />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                            {session?.user?.name?.[0]}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{session?.user?.name}</p>
                            <p style={{ fontSize: '0.55rem', opacity: 0.4, fontWeight: 700 }}>Master Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            signOut({ callbackUrl: '/auth/signin', redirect: true });
                        }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#ff4b4b', transition: 'all 0.2s', padding: '0.75rem', background: 'rgba(255,75,75,0.05)', borderRadius: '10px', border: '1px solid rgba(255,75,75,0.1)' }}
                    >
                        <LogOut size={16} /> DESCONECTAR
                    </button>
                </div>
            </aside>

            {/* Viewport Principal */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="admin-main">
                {/* Header Superior */}
                <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff' }} className="mobile-only">
                            <MenuIcon size={20} />
                        </button>
                        <div style={{ position: 'relative', width: 'min(300px, 50vw)' }}>
                            <Search size={12} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                style={{ background: 'transparent', border: 'none', padding: '0.5rem 0 0.5rem 1.25rem', width: '100%', fontSize: '0.75rem', color: '#fff', outline: 'none' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button style={{ opacity: 0.3 }}><Bell size={16} /></button>
                        <button onClick={toggleTheme} style={{ opacity: 0.3 }}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
                    </div>
                </header>

                <div style={{ padding: '1.5rem' }}>
                    <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                                {activeTab === 'OVERVIEW' ? 'Overview' : activeTab === 'LEADS' ? 'Leads Estratégicos' : activeTab === 'SUBMISSIONS' ? 'Formulários Recebidos' : activeTab === 'WEBHOOKS' ? 'MindTech Webhook' : 'Usuários'}
                            </h2>
                            <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>{activeTab === 'OVERVIEW' ? 'Resumo da rede.' : activeTab === 'LEADS' ? 'Gestão de leads.' : activeTab === 'SUBMISSIONS' ? 'Dados dos formulários preenchidos.' : activeTab === 'WEBHOOKS' ? 'Integração em tempo real.' : 'Diretório de clientes.'}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {(activeTab === 'LEADS' || activeTab === 'SUBMISSIONS') && (
                                <>
                                    <button onClick={() => activeTab === 'LEADS' ? exportListPDF('LEADS') : exportListPDF('SUBMISSIONS')} style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Download size={14} /> PDF
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Espaço de Dados Estilo SaaS */}
                    {activeTab === 'OVERVIEW' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <OverviewCard icon={<FileText size={16} />} label="LEADS" value={leads.length} />
                            <OverviewCard icon={<ClipboardList size={16} />} label="PROTOCOLOS" value={submissions.length} />
                            <OverviewCard icon={<Users size={16} />} label="USUÁRIOS" value={users.length} />
                            <OverviewCard icon={<ShieldCheck size={16} />} label="VIP/ALTA" value={submissions.filter((s: any) => ['ALTA', 'VIP', 'URGENTE'].includes(s.priority)).length} />
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', overflowX: 'auto' }}>
                            {activeTab === 'LEADS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <AdminTh>LEAD</AdminTh>
                                            <AdminTh>IDENTIFICAÇÃO</AdminTh>
                                            <AdminTh>JURISDIÇÃO</AdminTh>
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
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.7rem', fontWeight: 700 }}>{lead.jurisdicao || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
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
                                                        <button style={{ fontSize: '0.6rem', fontWeight: 800 }}>DETALHAR</button>
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
            </main>
            {/* Modal de Detalhes do Protocolo (Lateral Direita) */}
            <AnimatePresence>
                {selectedSubmission && (
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
                                    <DetailGroup label="Cliente Final" value={selectedSubmission.user?.fullName || selectedSubmission.user?.name} icon={<Users size={12} />} />
                                    <DetailGroup label="Tipo de Fluxo" value={funnelConfig[selectedSubmission.funnelType]?.title || selectedSubmission.funnelType} icon={<ClipboardList size={12} />} />
                                    <DetailGroup label="Canal de E-mail" value={selectedSubmission.user?.email} icon={<Mail size={12} />} />
                                    <DetailGroup label="Contato / WhatsApp" value={selectedSubmission.user?.phone} icon={<Users size={12} />} />
                                    <DetailGroup label="Registro / Doc" value={selectedSubmission.user?.document || 'PENDENTE'} icon={<ShieldCheck size={12} />} />
                                    <DetailGroup label="Prioridade" value={selectedSubmission.priority} icon={<ShieldCheck size={12} />} />
                                    <DetailGroup label="Tags" value={selectedSubmission.tags?.join(', ') || 'Nenhuma'} icon={<FileText size={12} />} />
                                    <DetailGroup label="Pontuação (Score)" value={selectedSubmission.score || '0'} icon={<CheckCircle2 size={12} />} />
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem' }}>
                                    <h4 style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.1em', marginBottom: '2.5rem' }}>DADOS DA TRANSMISSÃO</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                        {Object.keys(selectedSubmission.data).map(key => {
                                            const val = selectedSubmission.data[key];

                                            if (Array.isArray(val) && val.length > 0 && val[0] && typeof val[0] === 'object' && 'base64' in val[0]) {
                                                return (
                                                    <div key={key}>
                                                        <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '1rem' }}>{key.replace(/_/g, ' ')}</p>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            {val.map((file: any, fIdx: number) => (
                                                                <a key={fIdx} href={file.base64} download={file.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: 700, transition: 'background 0.2s', textDecoration: 'none' }}
                                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                                >
                                                                    <FileText size={18} opacity={0.5} />
                                                                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                                                    <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>{(file.size / 1024).toFixed(0)} KB</span>
                                                                    <ArrowUpRight size={14} opacity={0.2} />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={key}>
                                                    <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{key.replace(/_/g, ' ')}</p>
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
                                <button style={{ flex: 1.5, padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 900, borderRadius: '100px', fontSize: '0.8rem', letterSpacing: '0.05em' }}>MARCAR COMO PROCESSADO</button>
                                <button onClick={() => setSelectedSubmission(null)} style={{ flex: 1, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, color: '#fff', borderRadius: '100px', fontSize: '0.8rem' }}>FECHAR</button>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Detalhes do Lead (Lateral Direita) */}
            <AnimatePresence>
                {selectedLead && (
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <DetailGroup label="Nome Completo" value={selectedLead.nome_completo_pessoal} icon={<Users size={12} />} />
                                    <DetailGroup label="E-mail" value={selectedLead.email} icon={<Mail size={12} />} />
                                    <DetailGroup label="WhatsApp" value={selectedLead.whatsapp} icon={<ExternalLink size={12} />} />
                                    <DetailGroup label="CPF / Documento" value={selectedLead.cpf_nit} icon={<ShieldCheck size={12} />} />
                                    <DetailGroup label="Ocupação / Cargo" value={selectedLead.ocupacao} icon={<LayoutDashboard size={12} />} />
                                    <DetailGroup label="Jurisdição" value={selectedLead.jurisdicao} icon={<FileText size={12} />} />
                                    <DetailGroup label="Relação Empresa" value={selectedLead.relacao_empresa} icon={<Settings size={12} />} />
                                    <DetailGroup label="Criado em" value={new Date(selectedLead.createdAt).toLocaleString('pt-BR')} icon={<Calendar size={12} />} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    <h4 style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.1em' }}>INFORMAÇÕES ADICIONAIS DO FORMULÁRIO</h4>
                                    {Object.entries(selectedLead).map(([key, value]) => {
                                        if (['id', 'createdAt', 'userId', 'nome_completo_pessoal', 'email', 'whatsapp', 'cpf_nit', 'ocupacao', 'jurisdicao', 'relacao_empresa'].includes(key)) return null;
                                        if (value === null || value === undefined || value === '') return null;

                                        return (
                                            <div key={key}>
                                                <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{key.replace(/_/g, ' ')}</p>
                                                <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 }}>
                                                    {Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : String(value))}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => exportLeadPDF(selectedLead)} style={{ flex: 1, padding: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, borderRadius: '100px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> EXPORTAR DOSSIÊ PDF
                                </button>
                                <button onClick={() => setSelectedLead(null)} style={{ width: '100%', padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 900, borderRadius: '100px', fontSize: '0.8rem' }}>FECHAR E RETORNAR</button>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function OverviewCard({ icon, label, value }: { icon: any, label: string, value: number }) {
    return (
        <motion.div
            whileHover={{ y: -3, background: 'rgba(255,255,255,0.06)' }}
            style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'background 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.5)' }}>
                {icon}
                <h3 style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em' }}>{label}</h3>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: '#fff', letterSpacing: '-0.02em' }}>{value}</p>
        </motion.div>
    );
}

function SidebarLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', borderRadius: '10px', background: active ? 'rgba(255,255,255,0.08)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>
            {icon} {label}
        </button>
    );
}

function AdminTh({ children, align = 'left', style = {} }: any) {
    return <th style={{ padding: '1rem 1.5rem', fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, letterSpacing: '0.2em', textAlign: align, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', ...style }}>{children}</th>;
}

function AdminTd({ children, align = 'left' }: any) {
    return <td style={{ padding: '1rem 1.5rem', textAlign: align, verticalAlign: 'middle' }}>{children}</td>;
}

function StatusBadge({ priority }: any) {
    const isHigh = ['ALTA', 'URGENTE', 'VIP'].includes(priority);
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '6px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.03)', color: isHigh ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: isHigh ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent' }}>
            <div style={{ width: '5px', height: '5px', background: isHigh ? '#fff' : 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
            {priority || 'NORMAL'}
        </div>
    );
}

function DetailGroup({ label, value, icon }: any) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.12em' }}>{icon} {label}</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{value || '—'}</p>
        </div>
    );
}
