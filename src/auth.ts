import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const inputEmail = (credentials.email as string).toLowerCase().trim();
                    const inputPassword = (credentials.password as string).trim();

                    // 1. ADMIN BYPASS
                    const adminEmail = "bezerraborges@gmail.com"
                    const adminPass = "bitcoin2026*"

                    if (inputEmail === adminEmail && inputPassword === adminPass) {
                        return {
                            id: "admin-fixed-id",
                            email: adminEmail,
                            name: "Administrador BBLAW",
                            role: "ADMIN"
                        };
                    }

                    // 2. DB CHECK
                    const user = await (prisma as any).user.findUnique({
                        where: { email: inputEmail }
                    });

                    if (!user) {
                        return null;
                    }

                    if (!user.password) {
                        return null;
                    }

                    const isValid = await bcrypt.compare(inputPassword, user.password);
                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || user.fullName,
                        role: user.role || "CLIENT"
                    };
                } catch (error) {
                    console.error("LOGIN_FATAL_ERROR:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "CLIENT";
                token.email = user.email;
            }

            if (account?.provider === "google") {
                const dbUser = await (prisma as any).user.findUnique({
                    where: { email: token.email }
                });
                if (dbUser) {
                    token.role = dbUser.role || "CLIENT";
                    token.id = dbUser.id;
                }
            }

            if (token.email === "bezerraborges@gmail.com") {
                token.role = "ADMIN";
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role || "CLIENT";

                if (session.user.email === "bezerraborges@gmail.com") {
                    (session.user as any).role = "ADMIN";
                }
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
})
