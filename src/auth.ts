import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Configuração robusta para NextAuth v5 (Auth.js)
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null;

                    const inputEmail = (credentials.email as string).toLowerCase().trim();
                    const inputPassword = (credentials.password as string).trim();

                    // 1. ADMIN BYPASS (Acesso Fixo)
                    const adminEmail = process.env.ADMIN_EMAIL || "bezerraborges@gmail.com";
                    const adminPass = process.env.ADMIN_PASSWORD || "bitcoin2026*";

                    if (inputEmail === adminEmail && inputPassword === adminPass) {
                        return {
                            id: "admin-fixed-id",
                            email: adminEmail,
                            name: "Administrador BBLAW",
                            role: "ADMIN" as any
                        };
                    }

                    // 2. DB CHECK
                    // Cast para evitar problemas de tipagem com o prisma global
                    const user = await (prisma as any).user.findUnique({
                        where: { email: inputEmail }
                    });

                    if (!user || !user.password) {
                        console.log(`AUTH_FAIL: Usuário não existe ou sem senha local -> ${inputEmail}`);
                        return null;
                    }

                    const isValid = await bcrypt.compare(inputPassword, user.password);
                    if (!isValid) {
                        console.log(`AUTH_FAIL: Senha incorreta -> ${inputEmail}`);
                        return null;
                    }

                    console.log(`AUTH_SUCCESS: Login via credenciais -> ${inputEmail}`);
                    return {
                        id: user.id || "no-id",
                        email: user.email,
                        name: user.name || user.fullName || "Usuário BBLAW",
                        role: user.role || "CLIENT"
                    };
                } catch (error) {
                    console.error("AUTH_CRITICAL_ERROR:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // No primeiro login, o user estará disponível
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "CLIENT";
                token.email = user.email;
            }

            // Sync com DB se for login Google (procurar o role no banco)
            if (account?.provider === "google" && token.email) {
                const dbUser = await (prisma as any).user.findUnique({
                    where: { email: token.email }
                });
                if (dbUser) {
                    token.role = dbUser.role || "CLIENT";
                    token.id = dbUser.id;
                }
            }

            // Garante o role ADMIN para o email fixo
            if (token.email === (process.env.ADMIN_EMAIL || "bezerraborges@gmail.com")) {
                token.role = "ADMIN";
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role || "CLIENT";
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Força redirecionamento para /funnels após o login
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (url === baseUrl || url.includes('/auth/signin')) return `${baseUrl}/funnels`;
            return url;
        }
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin" // Redireciona erros de volta para o login
    },
    session: { strategy: "jwt" },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
})
