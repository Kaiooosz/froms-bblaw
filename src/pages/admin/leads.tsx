import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Head from 'next/head';
import styles from '@/styles/AdminLeads.module.css';

const prisma = new PrismaClient();

type LeadRow = {
    id: string;
    nomeCompleto: string | null; // maps to nome_completo_pessoal
    whatsapp: string | null;
    email: string | null;
    cidadeEstado: string | null; // maps to cidade_nascimento
    representa: string | null; // maps to relacao_empresa
};

interface Props {
    leads: LeadRow[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const leadsData = await prisma.lead.findMany({
        select: {
            id: true,
            nome_completo_pessoal: true,
            whatsapp: true,
            email: true,
            cidade_nascimento: true,
            relacao_empresa: true,
        },
        orderBy: { id: 'desc' },
    });

    // Map Prisma fields to our LeadRow shape
    const leads: LeadRow[] = leadsData.map((l) => ({
        id: l.id,
        nomeCompleto: l.nome_completo_pessoal,
        whatsapp: l.whatsapp,
        email: l.email,
        cidadeEstado: l.cidade_nascimento,
        representa: l.relacao_empresa,
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
                            <td>{lead.id}</td>
                            <td>{lead.nomeCompleto ?? '-'} </td>
                            <td>{lead.whatsapp ?? '-'} </td>
                            <td>{lead.email ?? '-'} </td>
                            <td>{lead.cidadeEstado ?? '-'} </td>
                            <td>{lead.representa ?? '-'} </td>
                            <td>
                                <Link
                                    href={`/api/admin/leads/${lead.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button className={styles.downloadBtn}>PDF</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
