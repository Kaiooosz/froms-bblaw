import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        const data = await request.json();

        // Basic validation
        if (!data.email || !data.whatsapp) {
            return NextResponse.json(
                { message: 'Campos obrigatórios faltando.' },
                { status: 400 }
            );
        }

        const lead = await prisma.lead.create({
            data: {
                relacao_empresa: data.relacao_empresa,
                whatsapp: data.whatsapp,
                participacao: data.participacao ? parseInt(data.participacao) : null,
                socio_responsavel: data.socio_responsavel,
                empresa_opcao1: data.empresa_opcao1,
                empresa_opcao2: data.empresa_opcao2,
                empresa_opcao3: data.empresa_opcao3,
                jurisdicao: data.jurisdicao,
                jurisdicao_outra: data.jurisdicao_outra,
                imoveis_brasil: data.imoveis_brasil,
                uso_empresa: data.uso_empresa || [],
                uso_empresa_outro: data.uso_empresa_outro,
                atividade_empresa: data.atividade_empresa,
                conta_bancaria: data.conta_bancaria,
                ativos_texto: data.ativos_texto,
                diretor_tipo: data.diretor_tipo,
                herdeiros: data.herdeiros,
                origem_fundos: data.origem_fundos || [],
                origem_fundos_outro: data.origem_fundos_outro,
                nome_completo_pessoal: data.nome_completo_pessoal,
                data_nascimento: data.data_nascimento,
                genero: data.genero,
                estado_civil: data.estado_civil,
                endereco: data.endereco,
                passaporte: data.passaporte,
                cidade_nascimento: data.cidade_nascimento,
                telefone: data.telefone,
                email: data.email,
                residencia_fiscal: data.residencia_fiscal,
                cpf_nit: data.cpf_nit,
                ocupacao: data.ocupacao,
                cnpj: data.cnpj,
                empresa_trabalha: data.empresa_trabalha,
                funcao: data.funcao,
                pep: data.pep,
                residencia_eua: data.residencia_eua,
                declaracao_aceite: !!data.declaracao_aceite,
                documento_residencia: data.documento_residencia,
                documento_identidade: data.documento_identidade,
                userId: session?.user?.id
            } as any
        });

        // Webhook integration MindTech (For Custom Form Components)
        try {
            await fetch('https://n8n.mindtechbusiness.com.br/webhook-test/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    userEmail: data.email || session?.user?.email,
                    userName: data.nome_completo_pessoal || session?.user?.name,
                    funnelType: 'OFFSHORE_CUSTOM', // Distinguish this form
                    data: data,
                    priority: 'NORMAL',
                    tags: ['CustomForm'],
                    score: 0,
                    submissionId: lead.id,
                    createdAt: new Date().toISOString()
                })
            });
            console.log(`[WEBHOOK_EVENT] Dados enviados com sucesso para MindTech para o funil OFFSHORE_CUSTOM`);
        } catch (webhookError) {
            console.error("[WEBHOOK_ERROR] Falha ao enviar para o webhook:", webhookError);
        }

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error: any) {
        console.error('Error saving lead:', error);
        return NextResponse.json(
            { message: 'Erro ao salvar informações.', error: error.message },
            { status: 500 }
        );
    }
}
