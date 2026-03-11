import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email: rawEmail, password, document, phone, origemLead } = body

        console.log(`SIGNUP_ATTEMPT: Iniciando cadastro para ${rawEmail}`);

        const email = (rawEmail || "").toLowerCase().trim()

        // 1. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
        if (!email || !password || !name) {
            return NextResponse.json({ message: "Nome, e-mail e senha são obrigatórios" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ message: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
        }

        // 2. VERIFICAÇÃO DE USUÁRIO EXISTENTE
        const existingUser = await (prisma as any).user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ message: "Este e-mail já está cadastrado" }, { status: 400 })
        }

        // 3. HASH DA SENHA (BCRYPT 10)
        const hashedPassword = await bcrypt.hash(password.trim(), 10)

        // 4. CRIAÇÃO DO USUÁRIO (Sincronizado com schema.prisma)
        const user = await (prisma as any).user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                document: document || null,
                phone: phone || null,
                origemLead: origemLead || "DIRETO",
                role: "CLIENT"
            }
        })

        console.log(`SIGNUP_SUCCESS: Usuário criado com ID ${user.id}`);

        return NextResponse.json({
            success: true,
            message: "Conta criada com sucesso",
            userId: user.id
        }, { status: 201 })

    } catch (error: any) {
        console.error("SIGNUP_API_CRITICAL_ERROR:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        return NextResponse.json({
            message: "Erro interno ao processar seu cadastro no servidor",
            details: error.message
        }, { status: 500 })
    }
}
