import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(leads);
    } catch (fetchLeadsError) {
        console.error('Error fetching leads:', fetchLeadsError);
        return NextResponse.json({ message: 'Erro ao buscar leads' }, { status: 500 });
    }
}
