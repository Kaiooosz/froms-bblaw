'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    FileDown,
    LogOut,
    Search,
    Clock,
    MessageCircle,
    X,
    ExternalLink,
    Calendar,
    Mail,
    Phone,
    Globe,
    Briefcase,
    ShieldCheck,
    Info,
    MapPin,
    ClipboardList
} from 'lucide-react';
import '@/components/OffshoreForm/styles.css';

export default function AdminDashboard() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/admin/leads');
            if (res.status === 401) {
                router.push('/admin/login');
                return;
            }
            const data = await res.json();
            setLeads(data);
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

    const filteredLeads = leads.filter(lead =>
        lead.nome_completo_pessoal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp?.includes(searchTerm)
    );

    return (
        <div className="form-page-wrapper">
            <header className="form-header">
                <div className="logo-container">
                    <h2 className="logo-text" style={{ fontSize: '1.25rem' }}>PAINEL <span className="accent-text">ADMIN</span></h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleLogout} className="theme-toggle" title="Sair">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="form-main-container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 className="form-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Leads <span className="accent-text">Capturados</span></h1>
                        <p className="form-description">Gerenciamento de solicitações de abertura offshore e proteção patrimonial.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou whatsapp..."
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

                <div className="form-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.5fr', gap: '1rem', background: 'var(--secondary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                        <div>Candidato</div>
                        <div>Contato</div>
                        <div>Jurisdição</div>
                        <div>Data</div>
                        <div style={{ textAlign: 'right' }}>Ação</div>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '6rem', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p style={{ opacity: 0.5 }}>Carregando leads do Supabase...</p>
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div style={{ padding: '6rem', textAlign: 'center', opacity: 0.5 }}>
                                <ClipboardList size={40} style={{ margin: '0 auto 1rem' }} />
                                <p>Nenhum lead encontrado.</p>
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
                                            <div style={{ fontSize: '0.65rem' }}>{new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
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
            </main>

            {/* Modal de Detalhes */}
            <AnimatePresence>
                {selectedLead && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <div
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setSelectedLead(null)}
                        />
                        <div
                            style={{
                                position: 'relative',
                                background: 'var(--card)',
                                width: '100%',
                                maxWidth: '900px',
                                maxHeight: '90vh',
                                borderRadius: '2rem',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ padding: '2rem', background: 'var(--secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Detalhes do Lead</h2>
                                        <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>ID: {selectedLead.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLead(null)} className="theme-toggle">
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>

                                    {/* Seção 1: Dados Pessoais */}
                                    <div>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                            <Info size={18} /> Informações Pessoais
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <DetailItem label="Nome Completo" value={selectedLead.nome_completo_pessoal} />
                                            <DetailItem label="Email" value={selectedLead.email} icon={<Mail size={14} />} />
                                            <DetailItem label="WhatsApp" value={selectedLead.whatsapp} icon={<Phone size={14} />} />
                                            <DetailItem label="Data Nascimento" value={selectedLead.data_nascimento} icon={<Calendar size={14} />} />
                                            <DetailItem label="Endereço" value={selectedLead.endereco} icon={<MapPin size={14} />} />
                                            <DetailItem label="CPF/NIT" value={selectedLead.cpf_nit} />
                                            <DetailItem label="Passaporte" value={selectedLead.passaporte} />
                                        </div>
                                    </div>

                                    {/* Seção 2: Estrutura Offshore */}
                                    <div>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                            <Globe size={18} /> Estrutura Desejada
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <DetailItem label="Jurisdição" value={selectedLead.jurisdicao} />
                                            <DetailItem label="Relação" value={selectedLead.relacao_empresa} />
                                            <DetailItem label="Nome Opção 1" value={selectedLead.empresa_opcao1} />
                                            <DetailItem label="Nome Opção 2" value={selectedLead.empresa_opcao2} />
                                            <DetailItem label="Imóveis no Brasil" value={selectedLead.imoveis_brasil === 'sim' ? 'Sim' : 'Não'} />
                                            <DetailItem label="Tipo de Conta" value={selectedLead.conta_bancaria} />
                                        </div>
                                    </div>

                                    {/* Seção 3: Ocupação e Compliance */}
                                    <div>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                            <Briefcase size={18} /> Profissional & Compliance
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <DetailItem label="Ocupação" value={selectedLead.ocupacao} />
                                            <DetailItem label="Empresa/CNPJ" value={selectedLead.cnpj || selectedLead.empresa_trabalha} />
                                            <DetailItem label="Pessoa PEP" value={selectedLead.pep === 'sim' ? 'Sim' : 'Não'} />
                                            <DetailItem label="Residência EUA" value={selectedLead.residencia_eua === 'sim' ? 'Sim' : 'Não'} />
                                            <div className="sigilo-box" style={{ margin: '1rem 0 0', padding: '1rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                                                <ShieldCheck size={16} />
                                                <span>Aceitou os termos em {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seção 4: Documentos */}
                                <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--secondary)', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <ClipboardList size={22} /> Documentação Anexada
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {selectedLead.documento_residencia ? (
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/leads-documents/${selectedLead.documento_residencia}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ padding: '1rem', background: 'var(--background)', borderRadius: '1rem', border: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', textDecoration: 'none', color: 'inherit' }}
                                                className="doc-link"
                                            >
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Comprovante de Residência</span>
                                                <ExternalLink size={14} color="var(--primary)" />
                                            </a>
                                        ) : (
                                            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Residência não enviado</span>
                                            </div>
                                        )}

                                        {selectedLead.documento_identidade ? (
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/leads-documents/${selectedLead.documento_identidade}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ padding: '1rem', background: 'var(--background)', borderRadius: '1rem', border: '1px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', textDecoration: 'none', color: 'inherit' }}
                                                className="doc-link"
                                            >
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Passaporte/ID</span>
                                                <ExternalLink size={14} color="var(--primary)" />
                                            </a>
                                        ) : (
                                            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>ID não enviado</span>
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.5, textAlign: 'center' }}>
                                        * Arquivos armazenados de forma criptografada no Supabase Storage.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-row:hover {
                    background: var(--secondary) !important;
                    transform: scale(1.002);
                }
                table {
                    min-width: 800px;
                }
            `}} />
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) {
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
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
    // Simplificação para este ambiente, em produção usaria framer-motion real se instalado
    return <>{children}</>;
}
