import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const resolvedParams = await params;

    if (!session) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { status } = await request.json(); // 'aprovado' ou 'recusado'

        const lead = await prisma.lead.update({
            where: { id: resolvedParams.id },
            data: { status }
        });

        // Registrar na Auditoria
        await prisma.auditLog.create({
            data: {
                action: status === 'aprovado' ? 'LEAD_APROVADO' : 'LEAD_RECUSADO',
                details: `Lead ${lead.nome_completo_pessoal} (${lead.email}) teve o status alterado para ${status}.`,
                user: session.email || 'Admin',
            }
        });

        return NextResponse.json({ success: true, lead });
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        return NextResponse.json({ message: 'Erro ao analisar requisição' }, { status: 500 });
    }
}
