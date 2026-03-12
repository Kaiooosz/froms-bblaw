import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        const userEmail = (session?.user?.email || "").toLowerCase().trim()
        const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/"/g, "").trim().toLowerCase()
        const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === adminEmail

        if (!session || !isAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
        }

        const documents = await (prisma as any).document.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(documents)
    } catch (error: any) {
        console.error("Admin fetch documents error:", error)
        return NextResponse.json({ message: "Erro ao buscar documentos" }, { status: 500 })
    }
}
