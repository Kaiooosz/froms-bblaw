import Head from 'next/head';
import Link from 'next/link';
import {
    Globe,
    Shield,
    Gem,
    CaseLower,
    Gavel,
    Coins,
    User
} from 'lucide-react';
import styles from '@/styles/Funnels.module.css';

const funnels = [
    {
        id: 'residencia-paraguai',
        category: 'INTERNACIONAL',
        title: 'Residência Fiscal Paraguai',
        icon: Globe,
        href: '/forms/residencia-paraguai'
    },
    {
        id: 'offshore',
        category: 'INTERNACIONAL',
        title: 'Offshore Internacional',
        icon: Shield,
        href: '/forms/offshore'
    },
    {
        id: 'holding',
        category: 'CONSULTIVO',
        title: 'Holding Nacional',
        icon: Gem,
        href: '/forms/patrimonial'
    },
    {
        id: 'cripto',
        category: 'CRIPTO',
        title: 'Estruturação Cripto',
        icon: Coins,
        href: '/forms/cripto'
    },
    {
        id: 'sucessorio',
        category: 'ESTATE',
        title: 'Planejamento Sucessório',
        icon: CaseLower,
        href: '/forms/sucessorio'
    },
    {
        id: 'contencioso',
        category: 'JUDICIAL',
        title: 'Contencioso Estratégico',
        icon: Gavel,
        href: '/forms/strategic-litigation'
    }
];

import { signOut } from 'next-auth/react';
// ... existing imports ...

export default function FunnelsPage() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Formulários Estratégicos – Bezerra Borges</title>
            </Head>

            <nav className={styles.nav}>
                <img src="/LogoBranco.svg" alt="BBLAW" className={styles.navLogo} />
                <div className={styles.userInfo} style={{ cursor: 'pointer' }} onClick={() => signOut({ callbackUrl: '/' })}>
                    <div className={styles.userIcon}><User size={16} /></div>
                    <span>SAIR</span>
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
