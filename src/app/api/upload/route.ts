import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { uploadToDrive } from "@/lib/google-drive"
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
        const userEmail = session.user?.email || userId || "unknown"
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
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload para o Google Drive
        const driveFileId = await uploadToDrive(
            buffer,
            filename,
            file.type || "application/octet-stream",
            userEmail,
            funnelType,
            tipo
        )

        // Salva no Prisma (path = Drive file ID)
        const document = await (prisma as any).document.create({
            data: {
                userId,
                funnelType,
                tipo,
                filename: file.name,
                path: driveFileId,
                size: file.size
            }
        })

        return NextResponse.json({ success: true, document })
    } catch (error: any) {
        const msg = error?.message || String(error)
        console.error("Upload route error:", msg)
        // Diagnóstico: expor causa raiz em variável de ambiente de dev
        return NextResponse.json({ message: "Erro interno no upload", detail: msg }, { status: 500 })
    }
}
