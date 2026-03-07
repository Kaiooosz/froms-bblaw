import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = "kaiotsuno.10@gmail.com";
    const password = "@Kaio240102";
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(`[FIX] Verificando banco para: ${email}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: "CLIENT"
            },
            create: {
                email,
                password: hashedPassword,
                name: "Kaio",
                role: "CLIENT"
            },
        });

        console.log("[SUCESSO] Usuário garantido no banco.");
        console.log("ID:", user.id);
    } catch (error) {
        console.error("[ERRO] Falha no script:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
