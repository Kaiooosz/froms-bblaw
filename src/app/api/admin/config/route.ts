import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        let config = await prisma.appConfig.findUnique({
            where: { id: "config_unico" }
        });

        if (!config) {
            config = await prisma.appConfig.create({
                data: { id: "config_unico" }
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("PRISMA FETCH CONFIG ERROR:", error);
        return NextResponse.json({ whatsapp: '+5511982712025', notificacao: true });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

    try {
        const { whatsapp, notificacao } = await request.json();

        const config = await prisma.appConfig.upsert({
            where: { id: "config_unico" },
            update: { whatsapp, notificacao },
            create: { id: "config_unico", whatsapp, notificacao }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CONFIG_UPDATE',
                details: `Configurações atualizadas: WhatsApp para ${whatsapp}, notificações para ${notificacao}`,
                user: session.email || 'Admin',
            }
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("Erro ao atualizar config:", error);
        return NextResponse.json({ message: 'Erro ao atualizar configurações' }, { status: 500 });
    }
}
