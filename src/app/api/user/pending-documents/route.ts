import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const FUNNEL_DOCS: Record<string, { id: string; label: string }[]> = {
    residencia_py: [
        { id: 'rg_cnh_passaporte', label: 'Documento Pessoal (RG, CNH ou Passaporte)' },
        { id: 'cert_nascimento', label: 'Certidão de Nascimento' },
        { id: 'cert_casamento', label: 'Certidão de Casamento' },
        { id: 'antecedentes', label: 'Antecedentes Criminais (PF + Apostilamento)' },
        { id: 'vacina_febre', label: 'Vacina Febre Amarela' },
        { id: 'foto_interpol', label: 'Foto Estilo Interpol' },
    ],
    offshore: [
        { id: 'passaporte', label: 'Passaporte (Apostilado/Notarizado)' },
        { id: 'residencia', label: 'Comprovante de Residência' },
        { id: 'ref_bancaria', label: 'Carta de Referência Bancária' },
        { id: 'comprovante_fundos', label: 'Comprovativo de Fundos' },
        { id: 'outro', label: 'Documentos Societários (CNPJ, Contrato)' },
    ],
    holding: [
        { id: 'irpf', label: 'IRPF Atualizado' },
        { id: 'relacao_imoveis', label: 'Matrículas de Imóveis' },
        { id: 'contrato_social', label: 'Contrato Social' },
        { id: 'doc_identidade', label: 'Documento de Identidade' },
    ],
    cripto: [
        { id: 'relatorio_fiscal', label: 'Relatório Fiscal Cripto' },
        { id: 'notificacao_rfb', label: 'Notificação RFB' },
        { id: 'doc_identidade', label: 'Documento de Identidade' },
    ],
    sucessorio: [
        { id: 'doc_identidade', label: 'Documentos Pessoais (RG ou CNH)' },
        { id: 'cert_casamento', label: 'Certidão de Casamento' },
        { id: 'relacao_bens', label: 'IRPF / Relação de Bens' },
    ],
    contencioso: [
        { id: 'processo', label: 'Petição Inicial / Mandado' },
        { id: 'notificacao', label: 'Notificações Recebidas' },
        { id: 'provas', label: 'Provas (Contratos, e-mails)' },
        { id: 'doc_identidade', label: 'Procuração Pré-assinada' },
    ],
}

const FUNNEL_LABELS: Record<string, string> = {
    residencia_py: 'Residência Fiscal Paraguai',
    offshore: 'Offshore Internacional',
    holding: 'Holding Nacional',
    cripto: 'Estruturação Cripto',
    sucessorio: 'Planejamento Sucessório',
    contencioso: 'Contencioso Estratégico',
    compliance: 'Retainer / Compliance',
    contabil: 'Contabilidade Empresarial',
}

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
        }

        const userId = session.user.id

        // Busca submissions para saber quais funnels o usuário está em andamento
        const submissions = await (prisma as any).submission.findMany({
            where: { userId },
            select: { funnelType: true },
        })

        // Busca documentos já enviados
        const uploadedDocs = await (prisma as any).document.findMany({
            where: { userId },
            select: { funnelType: true, tipo: true },
        })

        const uploadedSet = new Set(
            uploadedDocs.map((d: any) => `${d.funnelType}::${d.tipo}`)
        )

        // Funnels únicos do usuário
        const userFunnels = [...new Set(submissions.map((s: any) => s.funnelType as string))]

        const result = userFunnels.map((funnel) => {
            const requiredDocs = FUNNEL_DOCS[funnel] || []
            const pending = requiredDocs.filter(
                (doc) => !uploadedSet.has(`${funnel}::${doc.id}`)
            )
            const sent = requiredDocs.filter(
                (doc) => uploadedSet.has(`${funnel}::${doc.id}`)
            )

            return {
                funnel,
                funnelLabel: FUNNEL_LABELS[funnel] || funnel,
                total: requiredDocs.length,
                sentCount: sent.length,
                pendingCount: pending.length,
                pending: pending.map((d) => d.label),
                sent: sent.map((d) => d.label),
            }
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Pending documents error:', error)
        return NextResponse.json({ message: 'Erro interno', error: error.message }, { status: 500 })
    }
}
