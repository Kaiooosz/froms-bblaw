import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()
        const userEmail = (session?.user?.email || "").toLowerCase().trim()
        const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/"/g, "").trim().toLowerCase()
        const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === adminEmail

        if (!session || !isAdmin) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
        }

        const { status } = await req.json()

        const updated = await (prisma as any).submission.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("Update submission status error:", error)
        return NextResponse.json({ message: "Erro ao atualizar status", error: error.message }, { status: 500 })
    }
}
