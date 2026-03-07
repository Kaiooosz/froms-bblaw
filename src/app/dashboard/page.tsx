'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function DashboardRouter() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/signin');
        } else if (status === 'authenticated') {
            const role = (session?.user as any)?.role;
            if (role === 'ADMIN') {
                router.replace('/admin/dashboard');
            } else {
                router.replace('/funnels'); // Client dashboard / Form selection
            }
        }
    }, [status, session, router]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#000',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Loader2 className="animate-spin" size={48} color="white" style={{ opacity: 0.5 }} />
            <p style={{
                marginTop: '2rem',
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: 800,
                opacity: 0.5,
                letterSpacing: '0.2em'
            }}>
                AUTENTICANDO ACESSO...
            </p>
        </div>
    );
}
