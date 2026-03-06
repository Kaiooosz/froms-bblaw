import Head from 'next/head';
import WealthPlanningForm from '@/components/WealthPlanningForm';

export default function WealthPlanningPage() {
    return (
        <>
            <Head>
                <title>Planejamento Patrimonial | Bezerra Borges Advogados</title>
            </Head>
            <WealthPlanningForm />
        </>
    );
}
