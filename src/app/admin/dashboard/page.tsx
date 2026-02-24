'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/dist/client/components/navigation';
import {
    Users, FileDown, LogOut, Search, MessageCircle, X, ExternalLink, Calendar, Mail, Phone, Globe, Briefcase, ShieldCheck, Info, MapPin, ClipboardList, Settings, Activity, CheckCircle, XCircle, Save
} from 'lucide-react';
import '@/components/OffshoreForm/styles.css';

const T = {
    PT: {
        panel: "PAINEL", admin: "ADMIN", logout: "Sair",
        tabLeads: "Leads Pendentes", tabAudit: "Auditoria", tabSettings: "Configurações",
        titleLeads: "Leads Capturados", descLeads: "Gerenciamento de solicitações aguardando revisão.",
        titleAudit: "Auditoria do Sistema", descAudit: "Registro de todas as ações administrativas realizadas.",
        titleSettings: "Configurações do App", descSettings: "Controle das variáveis globais e de contato da plataforma.",
        search: "Buscar por nome, email ou whatsapp...",
        candidate: "Candidato", contact: "Contato", juris: "Jurisdição", date: "Data", action: "Ação",
        noData: "Nenhum dado encontrado.", loading: "Carregando...",
        approve: "Aprovar", reject: "Recusar",
        details: "Detalhes Completos do Lead",
        wppLabel: "Número WhatsApp de Contato do Site", notifLabel: "Habilitar Notificações do Sistema",
        save: "Salvar Configurações",
        personalInfo: "Informações Pessoais", offshoreInfo: "Estrutura Desejada", profInfo: "Profissional & Compliance", docsInfo: "Documentos Anexados"
    },
    EN: {
        panel: "PANEL", admin: "ADMIN", logout: "Logout",
        tabLeads: "Pending Leads", tabAudit: "Audit", tabSettings: "Settings",
        titleLeads: "Captured Leads", descLeads: "Management of requests pending review.",
        titleAudit: "System Audit", descAudit: "Log of all administrative actions performed.",
        titleSettings: "App Settings", descSettings: "Control of global variables and platform contact info.",
        search: "Search by name, email or whatsapp...",
        candidate: "Candidate", contact: "Contact", juris: "Jurisdiction", date: "Date", action: "Action",
        noData: "No data found.", loading: "Loading...",
        approve: "Approve", reject: "Reject",
        details: "Full Lead Details",
        wppLabel: "Website WhatsApp Contact Number", notifLabel: "Enable System Notifications",
        save: "Save Settings",
        personalInfo: "Personal Information", offshoreInfo: "Desired Structure", profInfo: "Professional & Compliance", docsInfo: "Attached Documents"
    },
    ES: {
        panel: "PANEL", admin: "ADMIN", logout: "Salir",
        tabLeads: "Leads Pendientes", tabAudit: "Auditoría", tabSettings: "Configuraciones",
        titleLeads: "Leads Capturados", descLeads: "Gestión de solicitudes en espera de revisión.",
        titleAudit: "Auditoría del Sistema", descAudit: "Registro de todas las acciones administrativas realizadas.",
        titleSettings: "Ajustes de la App", descSettings: "Control de las variables globales y contacto de la plataforma.",
        search: "Buscar por nombre, correo electrónico o whatsapp...",
        candidate: "Candidato", contact: "Contacto", juris: "Jurisdicción", date: "Fecha", action: "Acción",
        noData: "No se encontraron datos.", loading: "Cargando...",
        approve: "Aprobar", reject: "Rechazar",
        details: "Detalles Completos del Lead",
        wppLabel: "Número de WhatsApp del Sitio", notifLabel: "Habilitar Notificaciones del Sistema",
        save: "Guardar Ajustes",
        personalInfo: "Información Personal", offshoreInfo: "Estructura Deseada", profInfo: "Profesional y Cumplimiento", docsInfo: "Documentos Adjuntos"
    }
};

type Lang = 'PT' | 'EN' | 'ES';

export default function AdminDashboard() {
    const [lang, setLang] = useState<Lang>('PT');
    const [activeTab, setActiveTab] = useState<'leads' | 'audit' | 'settings'>('leads');

    // Dados
    const [leads, setLeads] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [config, setConfig] = useState<any>({ whatsapp: '', notificacao: true });

    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const router = useRouter();

    const t = T[lang];

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resLeads, resAudit, resConfig] = await Promise.all([
                fetch('/api/admin/leads'),
                fetch('/api/admin/audit'),
                fetch('/api/admin/config')
            ]);

            if (resLeads.status === 401) {
                router.push('/admin/login');
                return;
            }

            const dataLeads = await resLeads.json();
            if (Array.isArray(dataLeads)) setLeads(dataLeads);

            const dataAudit = await resAudit.json();
            if (Array.isArray(dataAudit)) setAuditLogs(dataAudit);

            const dataConfig = await resConfig.json();
            if (dataConfig?.id) setConfig(dataConfig);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/admin/login');
    };

    const handleLeadStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/leads/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Atualiza o cache local fechando o modal e forçando refetch para pegar auditoria nova
                setSelectedLead(null);
                fetchAllData();
            } else {
                alert('Erro ao processar');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveConfig = async () => {
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                fetchAllData();
                alert('Configurações salvas com sucesso!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const pendingLeads = leads.filter(l => l.status === 'pendente' || !l.status);
    const filteredLeads = pendingLeads.filter(lead =>
        lead.nome_completo_pessoal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp?.includes(searchTerm)
    );

    return (
        <div className="form-page-wrapper">
            <header className="form-header">
                <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/LogoBranco.svg" alt="Bezerra Borges Advogados" style={{ height: '24px', width: 'auto' }} />
                    <h2 className="logo-text" style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>
                        {t.panel} <span className="accent-text" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.admin}</span>
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Language Switch */}
                    <div style={{ display: 'flex', background: 'var(--secondary)', borderRadius: '2rem', padding: '0.25rem' }}>
                        {(['PT', 'EN', 'ES'] as Lang[]).map(l => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '1.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    background: lang === l ? 'var(--primary)' : 'transparent',
                                    color: lang === l ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <button onClick={handleLogout} className="theme-toggle" title={t.logout} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0 1rem', width: 'auto', borderRadius: '1rem' }}>
                        <LogOut size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.logout}</span>
                    </button>
                </div>
            </header>

            <main className="form-main-container" style={{ maxWidth: '1200px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
                    {[
                        { id: 'leads', icon: Users, label: t.tabLeads },
                        { id: 'audit', icon: Activity, label: t.tabAudit },
                        { id: 'settings', icon: Settings, label: t.tabSettings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                transition: 'all 0.2s',
                                fontSize: '0.9rem'
                            }}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'leads' && (
                    <div className="animate-fade-in-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div>
                                <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                    {t.titleLeads.split(' ')[0]} <span className="accent-text">{t.titleLeads.split(' ')[1] || ''}</span>
                                </h1>
                                <p className="form-description">{t.descLeads}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                    <input
                                        type="text"
                                        placeholder={t.search}
                                        className="form-input"
                                        style={{ paddingLeft: '3rem', fontSize: '0.875rem' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="sigilo-box" style={{ margin: 0, padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                                    <strong>{filteredLeads.length}</strong> Leads
                                </div>
                            </div>
                        </div>

                        <div className="form-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '2rem', border: '1px solid var(--border)' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.5fr', gap: '1rem', background: 'var(--secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>
                                <div>{t.candidate}</div>
                                <div>{t.contact}</div>
                                <div>{t.juris}</div>
                                <div>{t.date}</div>
                                <div style={{ textAlign: 'right' }}>{t.action}</div>
                            </div>

                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {loading ? (
                                    <div style={{ padding: '6rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                        <p style={{ opacity: 0.5 }}>{t.loading}</p>
                                    </div>
                                ) : filteredLeads.length === 0 ? (
                                    <div style={{ padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                                        <ClipboardList size={40} style={{ margin: '0 auto 1rem' }} />
                                        <p>{t.noData}</p>
                                    </div>
                                ) : (
                                    <div>
                                        {filteredLeads.map((lead) => (
                                            <div
                                                key={lead.id}
                                                className="admin-row"
                                                onClick={() => setSelectedLead(lead)}
                                                style={{
                                                    padding: '1.25rem 2rem',
                                                    display: 'grid',
                                                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.5fr',
                                                    gap: '1rem',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{lead.nome_completo_pessoal}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{lead.email}</div>
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <MessageCircle size={14} color="#25D366" />
                                                        {lead.whatsapp}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{
                                                        padding: '0.25rem 0.6rem',
                                                        background: 'var(--primary)',
                                                        color: 'var(--primary-foreground)',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {lead.jurisdicao}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                                    <div>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</div>
                                                    <div style={{ fontSize: '0.65rem' }}>{new Date(lead.createdAt).toLocaleTimeString('pt-BR')}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <button className="theme-toggle" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="animate-fade-in-up">
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t.titleAudit}</h1>
                            <p className="form-description">{t.descAudit}</p>
                        </div>

                        <div className="form-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '2rem', border: '1px solid var(--border)' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1fr', gap: '1rem', background: 'var(--secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>
                                <div>Ação</div>
                                <div>Detalhes</div>
                                <div>Usuário</div>
                                <div>Data</div>
                            </div>
                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {loading ? (
                                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>{t.loading}</div>
                                ) : auditLogs.length === 0 ? (
                                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>{t.noData}</div>
                                ) : (
                                    auditLogs.map(log => (
                                        <div key={log.id} style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: log.action.includes('APROVADO') ? '#25D366' : log.action.includes('RECUSADO') ? '#ef4444' : 'var(--primary)' }}>
                                                {log.action}
                                            </div>
                                            <div style={{ fontSize: '0.875rem' }}>{log.details}</div>
                                            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{log.user}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(log.createdAt).toLocaleString('pt-BR')}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="animate-fade-in-up">
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t.titleSettings}</h1>
                            <p className="form-description">{t.descSettings}</p>
                        </div>

                        <div className="form-card" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="form-group mb-0">
                                <label className="form-label">{t.wppLabel}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={config.whatsapp}
                                    onChange={e => setConfig({ ...config, whatsapp: e.target.value })}
                                />
                                <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem' }}>Número oficial para contato e disparo do botão de alerta de envio do Lead.</p>
                            </div>

                            <div className="form-group mb-0">
                                <label className="option-card" style={{ padding: '1rem 1.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.notificacao}
                                        onChange={e => setConfig({ ...config, notificacao: e.target.checked })}
                                        style={{ position: 'absolute', width: '0', height: '0', opacity: 0 }}
                                    />
                                    <div className={`option-indicator ${config.notificacao ? 'checked' : ''}`} style={{ background: config.notificacao ? 'var(--primary)' : 'transparent', borderColor: config.notificacao ? 'var(--primary)' : 'var(--border)' }}>
                                        {config.notificacao && <CheckCircle size={14} color="var(--primary-foreground)" />}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{t.notifLabel}</span>
                                </label>
                            </div>

                            <button onClick={handleSaveConfig} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Save size={18} /> {t.save}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Detalhes - Oculto caso Audit/Settings esteja ativo */}
            {selectedLead && activeTab === 'leads' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setSelectedLead(null)}
                    />
                    <div
                        style={{
                            position: 'relative', background: 'var(--card)', width: '100%', maxWidth: '900px', maxHeight: '90vh',
                            borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '2rem', background: 'var(--secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t.details}</h2>
                                    <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>ID: {selectedLead.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="theme-toggle">
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>

                                {/* Info Pessoal */}
                                <div>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                        <Info size={18} /> {t.personalInfo}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <DetailItem label="Nome Completo" value={selectedLead.nome_completo_pessoal} />
                                        <DetailItem label="Data Nascimento" value={selectedLead.data_nascimento} icon={<Calendar size={14} />} />
                                        <DetailItem label="Email" value={selectedLead.email} icon={<Mail size={14} />} />
                                        <DetailItem label="WhatsApp" value={selectedLead.whatsapp} icon={<Phone size={14} />} />
                                        <DetailItem label="CPF/NIT" value={selectedLead.cpf_nit} />
                                        <DetailItem label="Passaporte" value={selectedLead.passaporte} />
                                    </div>
                                </div>

                                {/* Offshore Structure */}
                                <div>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                        <Globe size={18} /> {t.offshoreInfo}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <DetailItem label="Relação do Usuário" value={selectedLead.relacao_empresa} />
                                        <DetailItem label="Jurisdição Preferida" value={selectedLead.jurisdicao} />
                                        <DetailItem label="Tipo de Conta" value={selectedLead.conta_bancaria} />
                                        <DetailItem label="Opção Nome 1" value={selectedLead.empresa_opcao1} />
                                    </div>
                                </div>

                                {/* Compliance */}
                                <div>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                        <Briefcase size={18} /> {t.profInfo}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <DetailItem label="Origem de Fundos" value={selectedLead.origem_fundos?.join(', ')} />
                                        <DetailItem label="Finalidade" value={selectedLead.uso_empresa?.join(', ')} />
                                        <DetailItem label="Pessoa Politicamente Exposta" value={selectedLead.pep} />
                                    </div>
                                </div>

                                {/* Documents */}
                                <div>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                        <ShieldCheck size={18} /> {t.docsInfo}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {selectedLead.documento_residencia ? (
                                            <div className="option-card" style={{ padding: '1rem', cursor: 'pointer', background: 'var(--background)', borderColor: 'var(--primary)', opacity: 0.8 }} onClick={() => window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/leads-documents/${selectedLead.documento_residencia}`)}>
                                                <FileDown size={18} style={{ marginRight: '0.5rem' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Comprovante de Endereço</span>
                                            </div>
                                        ) : <DetailItem label="Comprovante de Endereço" value="Não enviado" />}

                                        {selectedLead.documento_identidade ? (
                                            <div className="option-card" style={{ padding: '1rem', cursor: 'pointer', background: 'var(--background)', borderColor: 'var(--primary)', opacity: 0.8 }} onClick={() => window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/leads-documents/${selectedLead.documento_identidade}`)}>
                                                <FileDown size={18} style={{ marginRight: '0.5rem' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Identidade / Passaporte</span>
                                            </div>
                                        ) : <DetailItem label="Identidade" value="Não enviado" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACÕES (Aprovar / Recusar) */}
                        <div style={{ padding: '1.5rem 2.5rem', background: 'var(--secondary)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleLeadStatusChange(selectedLead.id, 'recusado')}
                                className="btn"
                                style={{ background: '#ef444415', color: '#ef4444', borderColor: '#ef444430', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '1rem' }}
                            >
                                <XCircle size={18} /> {t.reject}
                            </button>
                            <button
                                onClick={() => handleLeadStatusChange(selectedLead.id, 'aprovado')}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '1rem' }}
                            >
                                <CheckCircle size={18} /> {t.approve}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-row:hover {
                    background: var(--secondary) !important;
                    transform: scale(1.002);
                }
            `}} />
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string | null | undefined, icon?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, fontWeight: 700, marginBottom: '0.2rem' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 600 }}>
                {icon}
                {value}
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
