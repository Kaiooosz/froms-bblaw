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

        const users = await (prisma as any).user.findMany({
            orderBy: { id: 'desc' },
            select: {
                id: true,
                name: true,
                fullName: true,
                email: true,
                document: true,
                phone: true,
                origemLead: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json(users)
    } catch (error: any) {
        console.error("ADMIN_USERS_FAIL:", error)
        return NextResponse.json({
            message: "Erro ao buscar usuários"
        }, { status: 500 })
    }
}
