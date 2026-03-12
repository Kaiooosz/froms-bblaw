import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDownloadUrl } from "@/lib/google-drive"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()
        if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 })

        const document = await (prisma as any).document.findUnique({
            where: { id }
        })

        if (!document) return NextResponse.json({ message: "Documento não encontrado" }, { status: 404 })

        // Verifica permissão: dono do arquivo ou role ADMIN
        const isAdmin = (session.user as any)?.role === "ADMIN"
        const isOwner = document.userId === session.user?.id

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ message: "Sem permissão para baixar este arquivo" }, { status: 403 })
        }

        // Gera URL de download via Google Drive
        const url = await getDownloadUrl(document.path)

        return NextResponse.json({ url })
    } catch (error: any) {
        console.error("Download route error:", error)
        return NextResponse.json({ message: "Erro interno no download" }, { status: 500 })
    }
}
