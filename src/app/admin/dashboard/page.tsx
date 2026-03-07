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
    Download
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
            <aside style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', position: 'fixed', height: '100vh', zIndex: 100 }}>
                <div style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/logo-branco.svg" alt="BBLAW" style={{ maxWidth: '100px' }} />
                    <span style={{ fontSize: '0.5rem', fontWeight: 900, background: '#fff', color: '#000', padding: '2px 6px', borderRadius: '3px' }}>ADM</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <SidebarLink icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
                    <SidebarLink icon={<FileText size={18} />} label="Leads Detalhados" active={activeTab === 'LEADS'} onClick={() => setActiveTab('LEADS')} />
                    <SidebarLink icon={<ClipboardList size={18} />} label="Respostas & Webhooks" active={activeTab === 'SUBMISSIONS'} onClick={() => setActiveTab('SUBMISSIONS')} />
                    <SidebarLink icon={<Users size={18} />} label="Usuários Registrados" active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} />
                    <SidebarLink icon={<ShieldCheck size={18} />} label="Monitor MindTech" active={activeTab === 'WEBHOOKS'} onClick={() => setActiveTab('WEBHOOKS')} />
                    <SidebarLink icon={<Settings size={18} />} label="Configurações" active={false} onClick={() => { }} />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>
                            {session?.user?.name?.[0]}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{session?.user?.name}</p>
                            <p style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 700 }}>Master Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            signOut({ callbackUrl: '/auth/signin', redirect: true });
                        }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 900, color: '#ff4b4b', transition: 'all 0.2s', padding: '1rem', background: 'rgba(255,75,75,0.05)', borderRadius: '12px', border: '1px solid rgba(255,75,75,0.1)' }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,75,75,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,75,75,0.2)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,75,75,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,75,75,0.1)';
                        }}
                    >
                        <LogOut size={18} /> DESCONECTAR ACESSO
                    </button>
                </div>
            </aside>

            {/* Viewport Principal */}
            <main style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
                {/* Header Superior */}
                <header style={{ height: '80px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input
                            type="text"
                            placeholder="Pesquisa rápida em toda a rede..."
                            style={{ background: 'transparent', border: 'none', padding: '0.5rem 0 0.5rem 1.5rem', width: '100%', fontSize: '0.8rem', color: '#fff', outline: 'none' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <button style={{ opacity: 0.3 }}><Bell size={18} /></button>
                        <button onClick={toggleTheme} style={{ opacity: 0.3 }}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
                    </div>
                </header>

                <div style={{ padding: '3rem' }}>
                    <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                                {activeTab === 'OVERVIEW' ? 'Visão Geral (Overview)' : activeTab === 'LEADS' ? 'Banco de Leads Estratégicos' : activeTab === 'SUBMISSIONS' ? 'Monitor de Respostas & Webhooks' : activeTab === 'WEBHOOKS' ? 'Integração Webhook MindTech' : 'Diretório de Usuários'}
                            </h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.4 }}>{activeTab === 'OVERVIEW' ? 'Resumo de todos os fluxos e cadastros em andamento.' : activeTab === 'LEADS' ? 'Controle completo de informações enviadas pelos leads via formulários customizados.' : activeTab === 'SUBMISSIONS' ? 'Fluxo de dados estratégicos e eventos de integração.' : activeTab === 'WEBHOOKS' ? 'Eventos disparados em tempo real para o n8n MindTech.' : 'Base completa de clientes autenticados no ecossistema BBLAW.'}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {activeTab === 'LEADS' && (
                                <>
                                    <button
                                        onClick={() => exportListPDF('LEADS')}
                                        style={{ background: '#fff', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}
                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Download size={16} /> PDF
                                    </button>
                                    <button
                                        onClick={() => exportToCSV(leads, 'leads_bblaw')}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}
                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Download size={16} /> CSV
                                    </button>
                                </>
                            )}
                            {activeTab === 'SUBMISSIONS' && (
                                <>
                                    <button
                                        onClick={() => exportListPDF('SUBMISSIONS')}
                                        style={{ background: '#fff', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}
                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Download size={16} /> PDF
                                    </button>
                                    <button
                                        onClick={() => exportToCSV(submissions, 'protocolos_bblaw')}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}
                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Download size={16} /> CSV
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Espaço de Dados Estilo SaaS */}
                    {activeTab === 'OVERVIEW' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                                    <FileText size={24} />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>TOTAL DE LEADS</h3>
                                </div>
                                <p style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: '#fff', textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>{leads.length}</p>
                            </div>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                                    <ClipboardList size={24} />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>PROTOCOLOS ATIVOS</h3>
                                </div>
                                <p style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: '#fff', textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>{submissions.length}</p>
                            </div>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                                    <Users size={24} />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>USUÁRIOS CADASTRADOS</h3>
                                </div>
                                <p style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: '#fff', textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>{users.length}</p>
                            </div>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#fff' }}>
                                    <ShieldCheck size={24} />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>LEADS VIP / ALTA PRIORIDADE</h3>
                                </div>
                                <p style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: '#fff', textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>{submissions.filter((s: any) => ['ALTA', 'VIP', 'URGENTE'].includes(s.priority)).length}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                            {activeTab === 'LEADS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <AdminTh>LEAD / CONTATO</AdminTh>
                                            <AdminTh>IDENTIFICAÇÃO</AdminTh>
                                            <AdminTh>INTERESSE / JURISDIÇÃO</AdminTh>
                                            <AdminTh>DATA / HORA</AdminTh>
                                            <AdminTh align="right">AÇÃO</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '6rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <FileText size={32} style={{ margin: '0 auto 1.5rem' }} />
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SEM LEADS REGISTRADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeads.map((lead) => (
                                                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', cursor: 'pointer' }}
                                                    onClick={() => setSelectedLead(lead)}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <AdminTd>
                                                        <p style={{ fontWeight: 800 }}>{lead.nome_completo_pessoal}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.3 }}>{lead.email} • {lead.whatsapp}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>{lead.cpf_nit || '—'}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>{lead.ocupacao || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>{lead.jurisdicao || '—'}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{lead.relacao_empresa || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <button style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', opacity: 0.5 }}><ChevronRight size={14} /></button>
                                                    </AdminTd>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : activeTab === 'SUBMISSIONS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <AdminTh>CLIENTE / E-MAIL</AdminTh>
                                            <AdminTh>PROTOCOLO</AdminTh>
                                            <AdminTh>STATUS / PRIORIDADE</AdminTh>
                                            <AdminTh>WEBHOOK (MINDTECH)</AdminTh>
                                            <AdminTh>DATA / HORA</AdminTh>
                                            <AdminTh align="right">AÇÕES</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubmissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '6rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <ClipboardList size={32} style={{ margin: '0 auto 1.5rem' }} />
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SEM PROTOCOLOS REGISTRADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSubmissions.map((sub) => (
                                                <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <AdminTd>
                                                        <p style={{ fontWeight: 800 }}>{sub.user?.fullName || sub.user?.name}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.3 }}>{sub.user?.email}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                            {funnelConfig[sub.funnelType]?.title || sub.funnelType}
                                                        </span>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <StatusBadge priority={sub.priority} />
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.6rem', fontWeight: 900, opacity: 0.6 }}>
                                                            <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }} />
                                                            SINCRONIZADO
                                                        </div>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</p>
                                                        <p style={{ fontSize: '0.6rem', opacity: 0.3 }}>{new Date(sub.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <button style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', opacity: 0.5 }}><ChevronRight size={14} /></button>
                                                    </AdminTd>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : activeTab === 'WEBHOOKS' ? (
                                <div style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', marginBottom: '2rem' }}>
                                        <ShieldCheck size={48} color="#fff" />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Integração n8n MindTech Ativa</h3>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.4, maxWidth: '500px', margin: '0 auto 3rem' }}>
                                        Todos os formulários preenchidos estão sendo transmitidos em tempo real para a plataforma de inteligência MindTech.
                                    </p>

                                    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', marginBottom: '0.5rem' }}>URL do Receptor</p>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)' }}>https://n8n.mindtechbusiness.com.br/webhook-test/forms</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div>
                                                <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status da Conexão</p>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>ESTÁVEL / ONLINE</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Latência Média</p>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>124ms</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <AdminTh>USUÁRIO</AdminTh>
                                            <AdminTh>DOCUMENTO / CPF</AdminTh>
                                            <AdminTh>CONTATO</AdminTh>
                                            <AdminTh>ORIGEM</AdminTh>
                                            <AdminTh align="right">PROCESSO</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '6rem 0', textAlign: 'center', opacity: 0.2 }}>
                                                    <Users size={32} style={{ margin: '0 auto 1.5rem' }} />
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SEM USUÁRIOS REGISTRADOS</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <AdminTd>
                                                        <p style={{ fontWeight: 800 }}>{user.fullName || user.name}</p>
                                                        <p style={{ fontSize: '0.65rem', opacity: 0.3 }}>{user.email}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>{user.document || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>{user.phone || '—'}</p>
                                                    </AdminTd>
                                                    <AdminTd>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>{user.origemLead}</span>
                                                    </AdminTd>
                                                    <AdminTd align="right">
                                                        <button style={{ fontSize: '0.65rem', fontWeight: 800, borderBottom: '1px solid white', paddingBottom: '2px', opacity: 0.8 }}>DETALHAR</button>
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
                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.2em', marginBottom: '1rem' }}>RECURSOS ESTRATÉGICOS</p>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>Detalhes do <br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>Protocolo</span></h3>
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
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{key.replace(/_/g, ' ')}</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 }}>
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

function SidebarLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', borderRadius: '12px', background: active ? 'rgba(255,255,255,0.05)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s ease', fontWeight: 800, fontSize: '0.85rem' }}>
            {icon} {label}
        </button>
    );
}

function AdminTh({ children, align = 'left', style = {} }: any) {
    return <th style={{ padding: '1.25rem 2rem', fontSize: '0.6rem', fontWeight: 900, opacity: 0.3, letterSpacing: '0.2em', textAlign: align, textTransform: 'uppercase', ...style }}>{children}</th>;
}

function AdminTd({ children, align = 'left' }: any) {
    return <td style={{ padding: '1.5rem 2rem', textAlign: align, verticalAlign: 'middle' }}>{children}</td>;
}

function StatusBadge({ priority }: any) {
    const isHigh = priority === 'ALTA' || priority === 'URGENTE' || priority === 'VIP';
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', border: isHigh ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', opacity: isHigh ? 1 : 0.2 }} />
            {priority || 'NORMAL'}
        </div>
    );
}

function DetailGroup({ label, value, icon }: any) {
    return (
        <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.2, textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.1em' }}>{icon} {label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{value || '—'}</p>
        </div>
    );
}
