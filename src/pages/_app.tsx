import type { AppProps } from 'next/app';
import '@/app/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';

import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        const handleRejection = (event: PromiseRejectionEvent) => {
            if (event.reason && typeof event.reason.message === 'string' && event.reason.message.includes('MetaMask')) {
                event.preventDefault(); // Stop Next.js from showing the overlay
                console.warn('Ignorando aviso silencioso do MetaMask...');
            }
        };

        window.addEventListener('unhandledrejection', handleRejection);
        return () => window.removeEventListener('unhandledrejection', handleRejection);
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <Component {...pageProps} />
            </AuthProvider>
        </ThemeProvider>
    );
}
