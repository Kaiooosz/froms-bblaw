import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) return NextResponse.json({ message: "Não autorizado" }, { status: 401 })

        const formData = await req.formData()
        const file = formData.get("file") as File
        const funnelType = formData.get("funnelType") as string
        const tipo = formData.get("tipo") as string

        if (!file || !funnelType || !tipo) {
            return NextResponse.json({ message: "Campos obrigatórios faltando" }, { status: 400 })
        }

        const userId = session.user?.id
        if (!userId) return NextResponse.json({ message: "Usuário não identificado" }, { status: 401 })

        // Validar extensões (PDF, JPG, PNG, WEBP) e tamanho (max 10MB)
        const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "webp"]
        const ext = file.name.split(".").pop()?.toLowerCase() || ""
        if (!allowedExtensions.includes(ext)) {
            return NextResponse.json({ message: "Extensão de arquivo não permitida" }, { status: 400 })
        }
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ message: "Arquivo muito grande (max 10MB)" }, { status: 400 })
        }

        const filename = `${Date.now()}-${file.name}`
        const path = `${userId}/${funnelType}/${tipo}/${filename}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const supabase = getSupabaseClient()

        // Upload para Supabase Storage (Bucket: documentos)
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("documentos")
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return NextResponse.json({ message: "Erro no upload para o Storage" }, { status: 500 })
        }

        // Salva no Prisma
        const document = await (prisma as any).document.create({
            data: {
                userId,
                funnelType,
                tipo,
                filename: file.name,
                path,
                size: file.size
            }
        })

        return NextResponse.json({ success: true, document })
    } catch (error: any) {
        console.error("Upload route error:", error)
        return NextResponse.json({ message: "Erro interno no upload", error: error.message }, { status: 500 })
    }
}
