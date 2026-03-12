import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

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
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const inputEmail = (credentials.email as string).toLowerCase().trim();
                    const inputPassword = (credentials.password as string).trim();

                    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
                        .split(",").map(e => e.toLowerCase().trim()).filter(Boolean);
                    const adminPasswordEnv = process.env.ADMIN_PASSWORD || "";

                    // Login de admin via variáveis de ambiente (sem fallback hardcoded)
                    if (adminEmails.length > 0 && adminPasswordEnv && adminEmails.includes(inputEmail) && inputPassword === adminPasswordEnv) {
                        return {
                            id: "admin-fixed-id",
                            email: inputEmail,
                            name: "Administrador BBLAW",
                            role: "ADMIN"
                        };
                    }

                    // Tentativa de login via Banco de Dados (Prisma)
                    try {
                        const user = await prisma.user.findUnique({ where: { email: inputEmail } });
                        if (user && user.password && await bcrypt.compare(inputPassword, user.password)) {
                            return { id: user.id, email: user.email, name: user.name || user.fullName, role: user.role || "CLIENT" };
                        }
                    } catch (dbErr) {
                        console.error("AUTH_DB_ERROR");
                    }

                    return null;
                } catch {
                    console.error("AUTH_CRITICAL_ERROR");
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
            // Força ADMIN para todos os emails admin configurados via env
            const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
                .split(",").map(e => e.toLowerCase().trim()).filter(Boolean);
            if (adminEmails.length > 0 && adminEmails.includes((token.email as string || "").toLowerCase())) {
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
