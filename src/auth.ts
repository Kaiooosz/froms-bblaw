import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

const logDebug = (msg: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${msg}`);
};

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                logDebug(`[AUTH] Tentativa de login -> Email: [${credentials?.email}]`);
                
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const inputEmail = (credentials.email as string).toLowerCase().trim();
                    const inputPassword = (credentials.password as string).trim();

                    const adminEmailEnv = (process.env.ADMIN_EMAIL || "amborgesvinicius@gmail.com").toLowerCase().trim();
                    const adminPasswordEnv = process.env.ADMIN_PASSWORD || "Bitcoin2026*";
                    const testEmailEnv = (process.env.TEST_USER_EMAIL || "teste@teste.com").toLowerCase().trim();
                    const testPasswordEnv = process.env.TEST_USER_PASSWORD || "teste1";

                    const isAdminEmail = inputEmail === adminEmailEnv;
                    const isTestEmail = inputEmail === testEmailEnv;

                    if ((isAdminEmail && inputPassword === adminPasswordEnv) || (isTestEmail && inputPassword === testPasswordEnv)) {
                        logDebug(`AUTH_SUCCESS: Bypass logado -> ${inputEmail}`);
                        return {
                            id: isTestEmail ? "test-user-id" : "admin-fixed-id",
                            email: inputEmail,
                            name: isTestEmail ? "Usuário de Teste" : "Administrador BBLAW",
                            role: (isTestEmail || isAdminEmail) ? "ADMIN" : "CLIENT"
                        };
                    }

                    // Tentativa de login via Banco de Dados (Prisma)
                    try {
                        const user = await prisma.user.findUnique({ where: { email: inputEmail } });
                        if (user && user.password && await bcrypt.compare(inputPassword, user.password)) {
                            return { id: user.id, email: user.email, name: user.name || user.fullName, role: user.role || "CLIENT" };
                        }
                    } catch (dbErr) {
                         console.error("AUTH_DB_ERROR:", dbErr);
                    }

                    return null;
                } catch (error) {
                    console.error("AUTH_CRITICAL_ERROR:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "CLIENT";
                token.email = user.email;
            }
            // Força ADMIN para o email principal
            if (token.email === "bezerraborges@gmail.com" || token.email === "amborgesvinicius@gmail.com") {
                token.role = "ADMIN";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role || "CLIENT";
                session.user.email = token.email as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            try {
                if (url.startsWith("/")) return `${baseUrl}${url}`;
                const parsed = new URL(url);
                if (parsed.origin === baseUrl) return url;
            } catch {
                // URL inválida, retorna base
            }
            return baseUrl;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
    session: { strategy: "jwt" },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
});
