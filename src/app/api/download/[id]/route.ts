import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
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

        // Gera signed URL do Supabase (expira em 60s)
        const { data: signedData, error: signedError } = await supabase.storage
            .from("documentos")
            .createSignedUrl(document.path, 60)

        if (signedError) {
            console.error("Signed URL error:", signedError)
            return NextResponse.json({ message: "Erro ao gerar URL de download" }, { status: 500 })
        }

        return NextResponse.json({ url: signedData.signedUrl })
    } catch (error: any) {
        console.error("Download route error:", error)
        return NextResponse.json({ message: "Erro interno no download", error: error.message }, { status: 500 })
    }
}
