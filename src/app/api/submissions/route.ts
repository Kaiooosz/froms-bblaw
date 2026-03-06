import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
        }

        const submissionData = await req.json()
        const { funnelType, data } = submissionData

        // Robust userId lookup fallback
        let userId = (session.user as any).id
        if (!userId || userId === 'admin' || userId === 'test-user') {
            const dbUser = await (prisma as any).user.findUnique({
                where: { email: session.user.email }
            })
            if (dbUser) {
                userId = dbUser.id
            }
        }

        if (!userId) {
            return NextResponse.json({ message: "Usuário não encontrado no banco" }, { status: 400 })
        }

        let priority = 'NORMAL'
        const tags = [...(submissionData.tags || [])]
        let score = 0

        // Lógica de Pontuação Automática BBLAW
        const patrimonio = data.patrimonio_estimado || data.patrimonio_cripto || ''
        const renda = data.renda_mensal || data.faturamento_mensal_corp || ''

        // Regra VIP: Patrimônio > 5M
        if (patrimonio.includes('10 milhões') || patrimonio.includes('2 – 10 milhões') || patrimonio === '10M+') {
            priority = 'ALTA'
            tags.push('VIP')
            score += 100
        }

        // Regra Prioridade Alta: Renda > 100k
        if (renda.includes('100') || renda.includes('300')) {
            priority = 'ALTA'
            score += 50
        }

        // Regra Urgência: Prazo Jurídico
        if (data.prazo_correndo === 'Sim') {
            priority = 'ALTA'
            tags.push('URGENTE')
            score += 80
        }

        // Regra Origem: Settee
        const userOrigem = (session.user as any).origemLead
        if (userOrigem === 'SETTEE') {
            priority = 'ALTA'
            tags.push('SETTEE_PARTNER')
            score += 30
        }

        const submission = await (prisma as any).submission.create({
            data: {
                userId: userId,
                funnelType,
                data,
                priority,
                tags,
                score
            }
        })

        // Eventos de Disparo Final (Simulados)
        console.log(`[CRM_EVENT] Contato criado para ${session.user.email} no Pipeline: ${funnelType}`)
        console.log(`[TAG_EVENT] Tags aplicadas: ${tags.join(', ')}`)

        if (priority === 'ALTA') {
            console.log(`[SDR_NOTIFY] Notificando SDR via WhatsApp Interno: Novo Lead de Alta Prioridade (${funnelType})`)
        }

        // Webhook integration MindTech
        try {
            await fetch('https://n8n.mindtechbusiness.com.br/webhook-test/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    userEmail: session.user.email,
                    userName: session.user.name,
                    funnelType,
                    data,
                    priority,
                    tags,
                    score,
                    submissionId: submission.id,
                    createdAt: new Date().toISOString()
                })
            });
            console.log(`[WEBHOOK_EVENT] Dados enviados com sucesso para MindTech para o funil ${funnelType}`);
        } catch (webhookError) {
            console.error("[WEBHOOK_ERROR] Falha ao enviar para o webhook:", webhookError);
        }

        console.log(`[WA_CLIENT_AUTO] Enviando mensagem ao cliente: "Recebemos seu formulário. Nossa equipe entrará em contato em breve."`)

        return NextResponse.json({ success: true, submissionId: submission.id })
    } catch (error) {
        console.error("Submission error:", error)
        return NextResponse.json({ message: "Erro ao processar formulário" }, { status: 500 })
    }
}
