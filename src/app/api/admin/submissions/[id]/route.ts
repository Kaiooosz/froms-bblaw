import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()
        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 })
        }

        const { priority } = await req.json()

        const updated = await (prisma as any).submission.update({
            where: { id },
            data: { priority }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Update priority error:", error)
        return NextResponse.json({ message: "Erro ao atualizar prioridade" }, { status: 500 })
    }
}
