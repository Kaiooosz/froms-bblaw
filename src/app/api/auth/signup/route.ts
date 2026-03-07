import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email: rawEmail, password, document, phone, origemLead } = body

        console.log(`SIGNUP_ATTEMPT: Iniciando cadastro para ${rawEmail}`);

        const email = (rawEmail || "").toLowerCase().trim()

        // 1. VALIDAÇÃO BÁSICA
        if (!email || !password || !name) {
            return NextResponse.json({ message: "Dados obrigatórios ausentes (nome, e-mail ou senha)" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ message: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
        }

        // 2. VERIFICAÇÃO DE PRISMA / DB
        if (!prisma) {
            console.error("PRISMA_NOT_FOUND: Instância do Prisma não encontrada.");
            return NextResponse.json({ message: "Erro de configuração do servidor (DB)" }, { status: 500 })
        }

        // 3. VERIFICAÇÃO DE USUÁRIO EXISTENTE
        const existingUser = await (prisma as any).user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ message: "Este e-mail já está em uso" }, { status: 400 })
        }

        // 4. HASH DA SENHA
        const hashedPassword = await bcrypt.hash(password, 12)

        // 5. CRIAÇÃO DO USUÁRIO
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
            user: { id: user.id, email: user.email }
        })

    } catch (error: any) {
        console.error("SIGNUP_API_CRITICAL_ERROR:", {
            message: error.message,
            stack: error.stack,
            code: error.code // Prisma error codes
        });

        // Erro específico do Prisma (ex: P2002 para unique constraint)
        if (error.code === 'P2002') {
            return NextResponse.json({ message: "E-mail ou documento já cadastrado" }, { status: 400 })
        }

        return NextResponse.json({
            message: "Erro interno ao processar seu cadastro no servidor",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}
