import Link from 'next/link';
import {
    Globe,
    Shield,
    Gem,
    CaseLower,
    Gavel,
    Coins,
} from 'lucide-react';
import styles from '@/styles/Funnels.module.css';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from './SignOutButton';

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
            <nav className={styles.nav}>
                <img src="/LogoBranco.svg" alt="BBLAW" className={styles.navLogo} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                        Olá, <span style={{ fontWeight: 800, color: '#fff' }}>{session?.user?.name}</span>
                    </div>
                    <SignOutButton />
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
            </div>
        </div>
    );
}
