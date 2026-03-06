import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import styles from '@/styles/AdminLeads.module.css';
import { prisma } from '@/lib/prisma';

type LeadRow = {
    id: string;
    nomeCompleto: string | null;
    whatsapp: string | null;
    email: string | null;
    cidadeEstado: string | null;
    funil: string | null;
};

interface Props {
    leads: LeadRow[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const leadsData = await (prisma as any).lead.findMany({
        select: {
            id: true,
            nome_completo_pessoal: true,
            whatsapp: true,
            email: true,
            cidade_nascimento: true,
            form_type: true,
            user: {
                select: {
                    email: true,
                    document: true,
                    phone: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    const leads: LeadRow[] = leadsData.map((l: any) => ({
        id: l.id,
        nomeCompleto: l.nome_completo_pessoal,
        whatsapp: l.user?.phone || l.whatsapp,
        email: l.user?.email || l.email, // Prefer account email
        cidadeEstado: l.user?.document || l.cidade_nascimento, // Use document here for visibility
        funil: l.form_type,
    }));

    return { props: { leads } };
};


export default function AdminLeads({ leads }: Props) {
    return (
        <div className={styles.container}>
            <Head>
                <title>Admin – Leads</title>
            </Head>
            <h1 className={styles.title}>Leads Recebidos</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>WhatsApp</th>
                        <th>E‑mail</th>
                        <th>Cidade/Estado</th>
                        <th>Representa</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <tr key={lead.id}>
                            <td style={{ fontSize: '0.75rem', opacity: 0.5 }}>{lead.id.substring(0, 8)}...</td>
                            <td style={{ fontWeight: 600 }}>{lead.nomeCompleto ?? '-'} </td>
                            <td>{lead.whatsapp ?? '-'} </td>
                            <td>{lead.email ?? '-'} </td>
                            <td>{lead.cidadeEstado ?? '-'} </td>
                            <td>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    textTransform: 'uppercase'
                                }}>
                                    {lead.funil || 'Offshore'}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link
                                        href={`/api/admin/leads/${lead.id}/pdf`}
                                        target="_blank"
                                    >
                                        <button className={styles.downloadBtn}>Baixar PDF</button>
                                    </Link>
                                    <button className={styles.downloadBtn} style={{ background: 'transparent', border: '1px solid #333' }}>Detalhes</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
