import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const { name, email: rawEmail, password, document, birthDate, phone, origemLead } = await request.json()
        const email = (rawEmail || "").toLowerCase().trim()

        if (!email || !password || !name) {
            return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
        }

        const existingUser = await (prisma as any).user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ message: "E-mail já cadastrado" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await (prisma as any).user.create({
            data: {
                name,
                fullName: name,
                email,
                password: hashedPassword,
                document,
                birthDate,
                phone,
                origemLead: origemLead || "DIRETO",
                role: "CLIENT"
            }
        })

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email }
        })
    } catch (error: any) {
        console.error("SIGNUP_API_CRITICAL_ERROR:", error);
        return NextResponse.json({
            message: "Erro interno ao processar cadastro",
            details: error.message
        }, { status: 500 })
    }
}
