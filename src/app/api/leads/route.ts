import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
    try {
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
                relacao_empresa: data.relacao_empresa || 'Não informado',
                whatsapp: data.whatsapp || 'Não informado',
                participacao: data.participacao ? parseInt(data.participacao) : null,
                socio_responsavel: data.socio_responsavel || null,
                empresa_opcao1: data.empresa_opcao1 || 'Não informado',
                empresa_opcao2: data.empresa_opcao2 || null,
                empresa_opcao3: data.empresa_opcao3 || null,
                jurisdicao: data.jurisdicao || 'Não informado',
                jurisdicao_outra: data.jurisdicao_outra || null,
                imoveis_brasil: data.imoveis_brasil || 'Não informado',
                uso_empresa: data.uso_empresa || [],
                uso_empresa_outro: data.uso_empresa_outro || null,
                atividade_empresa: data.atividade_empresa || null,
                conta_bancaria: data.conta_bancaria || 'Não informado',
                ativos_texto: data.ativos_texto || null,
                diretor_tipo: data.diretor_tipo || null,
                herdeiros: data.herdeiros || null,
                origem_fundos: data.origem_fundos || [],
                origem_fundos_outro: data.origem_fundos_outro || null,
                nome_completo_pessoal: data.nome_completo_pessoal || 'Não informado',
                data_nascimento: data.data_nascimento || 'Não informado',
                genero: data.genero || null,
                estado_civil: data.estado_civil || null,
                endereco: data.endereco || null,
                passaporte: data.passaporte || null,
                cidade_nascimento: data.cidade_nascimento || null,
                telefone: data.telefone || null,
                email: data.email || 'Não informado',
                residencia_fiscal: data.residencia_fiscal || null,
                cpf_nit: data.cpf_nit || null,
                ocupacao: data.ocupacao || 'Não informado',
                cnpj: data.cnpj || null,
                empresa_trabalha: data.empresa_trabalha || null,
                funcao: data.funcao || null,
                pep: data.pep || 'nao',
                residencia_eua: data.residencia_eua || 'nao',
                declaracao_aceite: !!data.declaracao_aceite,
                documento_residencia: data.documento_residencia || null,
                documento_identidade: data.documento_identidade || null
            }
        });

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error: any) {
        console.error('Error saving lead:', error);
        return NextResponse.json(
            { message: 'Erro ao salvar informações.', error: error.message },
            { status: 500 }
        );
    }
}
