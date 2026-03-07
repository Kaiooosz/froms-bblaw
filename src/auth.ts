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

                    const email = (credentials.email as string).toLowerCase()
                    const password = credentials.password as string

                    // BBLAW Credentials check logic
                    const isAdmin = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD
                    const isTestUser = email === process.env.TEST_USER_EMAIL && password === process.env.TEST_USER_PASSWORD

                    if (isAdmin || isTestUser) {
                        let user = await (prisma as any).user.findUnique({
                            where: { email }
                        })

                        if (!user) {
                            user = await (prisma as any).user.create({
                                data: {
                                    email,
                                    name: isAdmin ? 'Administrador BBLAW' : 'Usuário de Teste',
                                    fullName: isAdmin ? 'Administrador BBLAW' : 'Usuário de Teste',
                                    role: isAdmin ? 'ADMIN' : 'USER',
                                    password: await bcrypt.hash(password, 10)
                                }
                            })
                        }
                        return user as any
                    }

                    const user = await (prisma as any).user.findUnique({
                        where: { email }
                    }) as BBLAWUser | null

                    if (!user || !user.password) return null

                    const isValid = await bcrypt.compare(
                        password,
                        user.password
                    )

                    if (!isValid) return null

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
                sessionUser.role = token.role || "USER";

                try {
                    // If user exists in DB, enrich session with more data
                    const dbUser = await (prisma as any).user.findUnique({
                        where: { email: session.user.email }
                    }) as BBLAWUser | null

                    if (dbUser) {
                        sessionUser.id = dbUser.id; // Override with real DB ID
                        sessionUser.fullName = dbUser.fullName || dbUser.name;
                        sessionUser.document = dbUser.document;
                        sessionUser.birthDate = dbUser.birthDate;
                        sessionUser.phone = dbUser.phone;
                        sessionUser.origemLead = dbUser.origemLead;
                        sessionUser.role = dbUser.role || "USER";
                    } else if (session.user.email === process.env.ADMIN_EMAIL) {
                        sessionUser.name = 'Administrador BBLAW';
                        sessionUser.role = 'ADMIN';
                    } else if (session.user.email === process.env.TEST_USER_EMAIL) {
                        sessionUser.name = 'Usuário de Teste';
                        sessionUser.role = 'USER';
                    }
                } catch (error: any) {
                    console.error("AUTH SESSION CALLBACK ERROR:", error);
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
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
