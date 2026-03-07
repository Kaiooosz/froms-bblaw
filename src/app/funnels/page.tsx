import Link from 'next/link';
import {
    Globe,
    Shield,
    Gem,
    CaseLower,
    Gavel,
    Coins,
    FileUp
} from 'lucide-react';
import styles from '@/styles/Funnels.module.css';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserMenu from '@/app/funnels/UserMenu';

const funnels = [
    {
        id: 'residencia-paraguai',
        category: 'INTERNACIONAL',
        title: 'Residência Fiscal Paraguai',
        icon: Globe,
        href: '/form/residencia_py'
    },
    {
        id: 'offshore',
        category: 'INTERNACIONAL',
        title: 'Offshore Internacional',
        icon: Shield,
        href: '/form/offshore'
    },
    {
        id: 'holding',
        category: 'CONSULTIVO',
        title: 'Holding Nacional',
        icon: Gem,
        href: '/form/holding'
    },
    {
        id: 'cripto',
        category: 'CRIPTO',
        title: 'Estruturação Cripto',
        icon: Coins,
        href: '/form/cripto'
    },
    {
        id: 'sucessorio',
        category: 'ESTATE',
        title: 'Planejamento Sucessório',
        icon: CaseLower,
        href: '/form/sucessorio'
    },
    {
        id: 'contencioso',
        category: 'JUDICIAL',
        title: 'Contencioso Estratégico',
        icon: Gavel,
        href: '/form/contencioso'
    }
];

export const metadata = {
    title: "Formulários Estratégicos – Bezerra Borges",
};

export default async function FunnelsPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className={styles.container}>
            <style dangerouslySetInnerHTML={{
                __html: `
                body {
                    background-color: #000 !important;
                }
                ::-webkit-scrollbar-track {
                    background: #000 !important;
                }
                ::-webkit-scrollbar-thumb {
                    background: #333 !important;
                }
            `}} />
            <nav className={styles.nav}>
                <img src="/LogoBranco.svg" alt="BBLAW" className={styles.navLogo} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <UserMenu userName={session?.user?.name || ''} />
                </div>
            </nav>

            <header className={styles.header}>
                <h1 className={styles.title}>Formulários Estratégicos</h1>
                <p className={styles.subtitle}>Selecione o formulário para iniciar a transmissão de dados.</p>
            </header>

            <div className={styles.grid}>
                {funnels.map((funnel) => {
                    const Icon = funnel.icon;
                    return (
                        <Link key={funnel.id} href={funnel.href} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIcon}><Icon size={20} /></div>
                            </div>
                            <div className={styles.cardBody}>
                                <span className={styles.category}>{funnel.category}</span>
                                <h3 className={styles.cardTitle}>{funnel.title}</h3>
                            </div>
                            <div className={styles.cardAction}>
                                <span>PREENCHER</span>
                                <span className={styles.arrow}>→</span>
                            </div>
                        </Link>
                    );
                })}

                {/* Card de Documentação */}
                <Link href="/documentos" className={styles.card} style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'linear-gradient(45deg, rgba(255,255,255,0.03), transparent)' }}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon} style={{ background: '#fff', color: '#000' }}><FileUp size={20} /></div>
                    </div>
                    <div className={styles.cardBody}>
                        <span className={styles.category} style={{ color: '#fff' }}>CHECKLIST</span>
                        <h3 className={styles.cardTitle}>Documentação de Suporte</h3>
                        <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem' }}>Envie seus documentos de identificação e residência.</p>
                    </div>
                    <div className={styles.cardAction}>
                        <span>ENVIAR DOCS</span>
                        <span className={styles.arrow}>→</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
