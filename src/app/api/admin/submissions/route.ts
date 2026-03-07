import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session) return NextResponse.json({ message: "Não autenticado" }, { status: 401 })

        const userEmail = (session.user?.email || "").toLowerCase().trim()
        const adminEmail = (process.env.ADMIN_EMAIL || "bezerraborges@gmail.com").replace(/"/g, "").trim().toLowerCase()

        // Verificação de Admin Robusta
        const isAdmin = (session.user as any)?.role === "ADMIN" ||
            userEmail === adminEmail ||
            userEmail === "bezerraborges@gmail.com"

        if (!isAdmin) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
        }

        // Busca Submissões com dados do usuário relacionado
        const submissions = await (prisma as any).submission.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        fullName: true,
                        document: true,
                        phone: true,
                        origemLead: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(submissions)
    } catch (error: any) {
        console.error("ADMIN_SUBMISSIONS_FAIL:", error)
        return NextResponse.json({
            message: "Erro ao buscar protocolos",
            error: error.message
        }, { status: 500 })
    }
}
