'use client';

import { User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from '@/styles/Funnels.module.css';

export default function SignOutButton() {
    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
    };

    return (
        <div className={styles.userInfo} style={{ cursor: 'pointer' }} onClick={handleSignOut}>
            <div className={styles.userIcon}><User size={16} /></div>
            <span>SAIR</span>
        </div>
    );
}
