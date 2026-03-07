import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log("AUTH: Missing credentials");
                        return null;
                    }

                    const inputEmail = (credentials.email as string).toLowerCase().trim();
                    const inputPassword = (credentials.password as string).trim();

                    console.log("AUTH_ATTEMPT:", { inputEmail });

                    // 1. SUPREME ADMIN BYPASS
                    const adminEmail = "bezerraborges@gmail.com"
                    const adminPass = "bitcoin2026*"

                    if (inputEmail === adminEmail && inputPassword === adminPass) {
                        console.log("AUTH: Admin match success");
                        return {
                            id: "admin-fixed-id",
                            email: adminEmail,
                            name: "Administrador BBLAW",
                            role: "ADMIN"
                        };
                    }

                    // 2. STANDARD DB CHECK
                    const user = await (prisma as any).user.findUnique({
                        where: { email: inputEmail }
                    });

                    if (!user) {
                        console.log("AUTH: User not found in DB:", inputEmail);
                        return null;
                    }

                    if (!user.password) {
                        console.log("AUTH: User has no password set:", inputEmail);
                        return null;
                    }

                    const isValid = await bcrypt.compare(inputPassword, user.password);
                    if (!isValid) {
                        console.log("AUTH: Invalid password for:", inputEmail);
                        return null;
                    }

                    console.log("AUTH: Success for user:", inputEmail, "Role:", user.role);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || user.fullName,
                        role: user.role || "CLIENT"
                    };
                } catch (error) {
                    console.error("AUTH_FATAL_ERROR:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.email = user.email;
                token.sub = user.id; // Essential for some NextAuth internals
            }

            // Re-enforce admin role in token
            if (token.email === "bezerraborges@gmail.com") {
                token.role = "ADMIN";
            } else if (!token.role) {
                token.role = "CLIENT";
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id || token.sub;
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
    secret: process.env.AUTH_SECRET || "bblaw-ultra-secret-2025",
})
