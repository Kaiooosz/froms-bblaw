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
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { funnelConfig } from '@/lib/funnels';
import { useTheme } from '@/components/ThemeProvider';
import '@/app/forms.css';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBMISSIONS' | 'USERS'>('OVERVIEW');
    const [users, setUsers] = useState<any[]>([]);
    const [filterType, setFilterType] = useState('ALL');
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN')) {
            window.location.href = '/auth/signin';
        } else if (status === 'authenticated') {
            fetchSubmissions();
            fetchUsers();
        }
    }, [status, session]);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/submissions');
            const data = await res.json();
            setSubmissions(data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data || []);
        } catch (err) { console.error(err); }
    };

    const filteredSubmissions = (submissions || []).filter(sub => {
        const matchesSearch =
            sub.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' || sub.funnelType.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const filteredUsers = (users || []).filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <SidebarLink icon={<ClipboardList size={18} />} label="Protocolos" active={activeTab === 'SUBMISSIONS'} onClick={() => setActiveTab('SUBMISSIONS')} />
                    <SidebarLink icon={<Users size={18} />} label="Base de Usuários" active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} />
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
                        onClick={async () => {
                            await signOut({ redirect: false });
                            window.location.href = '/auth/signin';
                        }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, transition: 'opacity 0.2s', padding: '0.5rem' }}
                        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseOut={(e) => (e.currentTarget.style.opacity = '0.5')}
                    >
                        <LogOut size={16} /> SAIR E TROCAR USUÁRIO
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
                                {activeTab === 'OVERVIEW' ? 'Visão Geral (Overview)' : activeTab === 'SUBMISSIONS' ? 'Monitor de Protocolos' : 'Diretório de Usuários'}
                            </h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.4 }}>{activeTab === 'OVERVIEW' ? 'Resumo de todos os fluxos e cadastros em andamento.' : activeTab === 'SUBMISSIONS' ? 'Fluxo de dados estratégicos recebidos em tempo real.' : 'Base completa de clientes autenticados no ecossistema BBLAW.'}</p>
                        </div>

                        {activeTab === 'SUBMISSIONS' && (
                            <select
                                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, outline: 'none', color: '#fff' }}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">TODOS OS FILTROS</option>
                                {Object.keys(funnelConfig).map(id => (
                                    <option key={id} value={id}>{funnelConfig[id].title.toUpperCase()}</option>
                                ))}
                            </select>
                        )}
                    </header>

                    {/* Espaço de Dados Estilo SaaS */}
                    {activeTab === 'OVERVIEW' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--foreground)', opacity: 0.5 }}>
                                    <ClipboardList size={24} />
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>TOTAL DE PROTOCOLOS</h3>
                                </div>
                                <p style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>{submissions.length}</p>
                            </div>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--foreground)', opacity: 0.5 }}>
                                    <Users size={24} />
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>USUÁRIOS CADASTRADOS</h3>
                                </div>
                                <p style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>{users.length}</p>
                            </div>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#ff4444', opacity: 0.8 }}>
                                    <ShieldCheck size={24} />
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>LEADS VIP / ALTA PRIORIDADE</h3>
                                </div>
                                <p style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, color: '#ff4444' }}>{submissions.filter((s: any) => ['ALTA', 'VIP', 'URGENTE'].includes(s.priority)).length}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                            {activeTab === 'SUBMISSIONS' ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <AdminTh>CLIENTE / E-MAIL</AdminTh>
                                            <AdminTh>PROTOCOLO</AdminTh>
                                            <AdminTh>STATUS / PRIORIDADE</AdminTh>
                                            <AdminTh>DATA / HORA</AdminTh>
                                            <AdminTh align="right">AÇÕES</AdminTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubmissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '6rem 0', textAlign: 'center', opacity: 0.2 }}>
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

            {/* Modal de Detalhes Estilo Sidebar (Lateral Direita) */}
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

                                            // Handling file uploads (base64)
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

                                            // Handle other object representations or arrays cleanly
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
                                <button style={{ flex: 1.5, padding: '1.25rem', background: '#fff', color: '#000', fontWeight: 900, borderRadius: '100px', fontSize: '0.8rem', letterSpacing: '0.05em' }}>MARCAR COMO PROCESSADO</button>
                                <button onClick={() => setSelectedSubmission(null)} style={{ flex: 1, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, color: '#fff', borderRadius: '100px', fontSize: '0.8rem' }}>FECHAR</button>
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 12px', borderRadius: '100px', background: isHigh ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.05)', color: isHigh ? '#ff4444' : '#44ff44', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }} />
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
