'use client';

import { User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from '@/styles/Funnels.module.css';

export default function SignOutButton() {
    return (
        <div className={styles.userInfo} style={{ cursor: 'pointer' }} onClick={() => signOut({ callbackUrl: '/' })}>
            <div className={styles.userIcon}><User size={16} /></div>
            <span>SAIR</span>
        </div>
    );
}
