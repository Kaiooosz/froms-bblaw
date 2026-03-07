import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json({ message: "Não autenticado" }, { status: 401 })
        }

        const userEmail = (session.user?.email || "").toLowerCase().trim()
        const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/"/g, "").trim().toLowerCase()
        const isAdmin = (session.user as any)?.role === "ADMIN" ||
            userEmail === adminEmail ||
            userEmail === "bezerraborges@gmail.com"

        if (!isAdmin) {
            return NextResponse.json({ message: "Acesso negado: Somente administradores" }, { status: 403 })
        }

        const users = await prisma.user.findMany({
            orderBy: { id: 'desc' },
            select: {
                id: true,
                name: true,
                fullName: true,
                email: true,
                document: true,
                phone: true,
                origemLead: true,
                role: true
            }
        })

        return NextResponse.json(users)
    } catch (error: any) {
        console.error("DEBUG: FETCH_USERS_ERROR:", error)
        return NextResponse.json({
            message: "Erro interno ao buscar usuários",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
