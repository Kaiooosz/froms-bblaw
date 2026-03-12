import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session) return NextResponse.json({ message: "Não autenticado" }, { status: 401 })

        const userEmail = (session.user?.email || "").toLowerCase().trim()
        const adminEmail = (process.env.ADMIN_EMAIL || "bezerraborges@gmail.com").replace(/"/g, "").trim().toLowerCase()

        const isAdmin = (session.user as any)?.role === "ADMIN" ||
            userEmail === adminEmail ||
            userEmail === "bezerraborges@gmail.com"

        if (!isAdmin) {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
        }

        const leads = await (prisma as any).lead.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        fullName: true
                    }
                }
            }
        })

        return NextResponse.json(leads)
    } catch (error: any) {
        console.error("ADMIN_LEADS_FAIL:", error)
        return NextResponse.json({
            message: "Erro ao buscar leads"
        }, { status: 500 })
    }
}
