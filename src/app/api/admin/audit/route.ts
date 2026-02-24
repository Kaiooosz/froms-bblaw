import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(logs);
    } catch (error) {
        console.error("PRISMA FETCH AUDIT ERROR:", error);
        return NextResponse.json([]);
    }
}
