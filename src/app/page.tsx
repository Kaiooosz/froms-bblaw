'use client';

import dynamic from 'next/dynamic';

const OffshoreForm = dynamic(() => import("@/components/OffshoreForm"), {
  ssr: false,
  loading: () => <div style={{ height: '100vh', background: 'var(--background)' }} />
});

export default function Home() {
  return (
    <main>
      <OffshoreForm />
    </main>
  );
}
