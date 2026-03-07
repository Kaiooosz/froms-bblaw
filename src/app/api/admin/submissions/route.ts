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
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
        }

        const submissions = await (prisma as any).submission.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        fullName: true,
                        document: true,
                        birthDate: true,
                        phone: true,
                        origemLead: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json(submissions)
    } catch (error) {
        console.error("Admin fetch error:", error)
        return NextResponse.json({ message: "Erro ao buscar dados" }, { status: 500 })
    }
}
