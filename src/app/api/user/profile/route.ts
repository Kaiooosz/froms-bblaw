import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
        }

        // Get user ID from session or email
        let userId = (session.user as any).id;
        if (!userId) {
            const dbUser = await (prisma as any).user.findUnique({
                where: { email: session.user.email }
            });
            if (dbUser) userId = dbUser.id;
        }

        if (!userId) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
        }

        // Fetch user's own submissions
        const submissions = await (prisma as any).submission.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        });

        // Also fetch user's own profile data for prefilling
        const userData = await (prisma as any).user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                fullName: true,
                email: true,
                phone: true,
                document: true,
            }
        });

        return NextResponse.json({
            user: userData,
            submissions: submissions || []
        });

    } catch (error) {
        console.error("Profile API error:", error)
        return NextResponse.json({ message: "Erro ao buscar dados do perfil" }, { status: 500 })
    }
}
