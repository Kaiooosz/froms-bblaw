import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const { name, email, password, document, birthDate, phone, origemLead } = await request.json()

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
                role: "USER"
            }
        })

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email }
        })
    } catch (error: any) {
        console.error("Signup error:", error)
        return NextResponse.json({ message: "Erro ao criar conta" }, { status: 500 })
    }
}
