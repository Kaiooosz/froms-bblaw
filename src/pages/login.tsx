import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth/signin');
    }, [router]);

    return (
        <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>REDIRECIONANDO...</div>
        </div>
    );
}
