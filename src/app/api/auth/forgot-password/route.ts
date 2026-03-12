import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const { email: rawEmail } = await request.json();
        const email = (rawEmail || "").toLowerCase().trim();

        if (!email) {
            return NextResponse.json({ message: "E-mail obrigatório" }, { status: 400 });
        }

        const user = await (prisma as any).user.findUnique({
            where: { email }
        });

        // For security, don't reveal if user exists. 
        // Always return success but only act if user exists.
        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

            await (prisma as any).user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpires
                }
            });

            // TODO: Enviar email com o link de reset usando Resend ou similar
            // await resend.emails.send({ to: email, subject: "Recuperação de senha", ... });
        }

        return NextResponse.json({ success: true, message: "Se o e-mail estiver em nossa base, você receberá um link de recuperação." });
    } catch (error) {
        console.error("FORGOT_PASSWORD_ERROR:", error);
        return NextResponse.json({ message: "Erro ao processar solicitação" }, { status: 500 });
    }
}
