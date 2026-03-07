import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        const userEmail = session?.user?.email?.toLowerCase() || ""
        const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/"/g, "").trim().toLowerCase()
        const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === adminEmail

        if (!session || !isAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
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
                role: true
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Fetch users error:", error)
        return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 })
    }
}
