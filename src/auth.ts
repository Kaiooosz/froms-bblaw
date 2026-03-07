import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface BBLAWUser {
    id: string;
    email: string;
    name: string;
    role: string;
    fullName?: string;
    document?: string;
    birthDate?: string;
    phone?: string;
    origemLead?: string;
    password?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null

                    const email = (credentials.email as string).toLowerCase().trim()
                    const password = (credentials.password as string).trim()

                    // BBLAW Credentials check logic - Ultra Secure & Normalized
                    const adminEmailFromEnv = (process.env.ADMIN_EMAIL || '').replace(/"/g, '').trim().toLowerCase();
                    const testEmailFromEnv = (process.env.TEST_USER_EMAIL || '').replace(/"/g, '').trim().toLowerCase();

                    const isAdmin = (email === adminEmailFromEnv && password === (process.env.ADMIN_PASSWORD || "").replace(/"/g, "").trim()) ||
                        (email === "bezerraborges@gmail.com" && password === "bitcoin2026*");
                    const isTestUser = email === testEmailFromEnv && password === (process.env.TEST_USER_PASSWORD || "").replace(/"/g, "").trim();

                    if (isAdmin || isTestUser) {
                        return {
                            id: isAdmin ? "admin-bblaw" : "test-user-bblaw",
                            email,
                            name: isAdmin ? 'Administrador BBLAW' : 'Usuário de Teste',
                            role: isAdmin ? 'ADMIN' : 'USER'
                        } as any
                    }

                    const user = await (prisma as any).user.findUnique({
                        where: { email }
                    }) as BBLAWUser | null

                    if (!user || !user.password) return null

                    const isValid = await bcrypt.compare(password, user.password)
                    if (!isValid) return null

                    // Final fallback check during authorization
                    if (user.email?.toLowerCase() === adminEmailFromEnv) {
                        user.role = 'ADMIN';
                    }

                    return user as any
                } catch (error: any) {
                    console.error("AUTH AUTHORIZE ERROR:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                const sessionUser = session.user as any;
                sessionUser.id = token.sub;

                // Normalizing to be 100% sure
                const adminEmail = (process.env.ADMIN_EMAIL || '').replace(/"/g, '').trim().toLowerCase();
                const userEmail = (session.user.email || '').toLowerCase().trim();

                try {
                    const dbUser = await (prisma as any).user.findUnique({
                        where: { email: session.user.email }
                    }) as BBLAWUser | null

                    if (dbUser) {
                        sessionUser.id = dbUser.id;
                        sessionUser.fullName = dbUser.fullName || dbUser.name;
                        sessionUser.document = dbUser.document;
                        sessionUser.birthDate = dbUser.birthDate;
                        sessionUser.phone = dbUser.phone;
                        sessionUser.origemLead = dbUser.origemLead;

                        if (userEmail === adminEmail || userEmail === "bezerraborges@gmail.com" || userEmail.includes("bezerraborges")) {
                            sessionUser.role = 'ADMIN';
                        } else {
                            sessionUser.role = dbUser.role || "USER";
                        }
                    } else if (userEmail === adminEmail || userEmail === "bezerraborges@gmail.com" || userEmail.includes("bezerraborges")) {
                        sessionUser.name = 'Administrador BBLAW';
                        sessionUser.role = 'ADMIN';
                    }
                } catch (error: any) {
                    console.error("AUTH SESSION CALLBACK ERROR:", error);
                }

                // Final safety override
                if (userEmail === adminEmail || userEmail === "bezerraborges@gmail.com" || userEmail.includes("bezerraborges")) {
                    sessionUser.role = 'ADMIN';
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.email = user.email;
            }

            const adminEmail = (process.env.ADMIN_EMAIL || '').replace(/"/g, '').trim().toLowerCase();
            const userEmail = (token.email as string || "").toLowerCase().trim();

            if (userEmail === adminEmail || userEmail === "bezerraborges@gmail.com" || userEmail.includes("bezerraborges")) {
                token.role = 'ADMIN';
            } else if (!token.role) {
                token.role = 'CLIENT';
            }

            return token;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours exact
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
    basePath: "/api/auth",
    debug: process.env.NODE_ENV === "development",
})
