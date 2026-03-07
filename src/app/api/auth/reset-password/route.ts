import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
        }

        const user = await (prisma as any).user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json({ message: "Link de redefinição inválido ou expirado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        return NextResponse.json({ success: true, message: "Senha redefinida com sucesso" });
    } catch (error) {
        console.error("RESET_PASSWORD_ERROR:", error);
        return NextResponse.json({ message: "Erro ao processar redefinição" }, { status: 500 });
    }
}
