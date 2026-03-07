import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 })

        const documents = await (prisma as any).document.findMany({
            where: { userId: session.user?.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(documents)
    } catch (error: any) {
        console.error("User documents error:", error)
        return NextResponse.json({ message: "Erro ao buscar documentos", error: error.message }, { status: 500 })
    }
}
