import { PrismaClient } from "@prisma/client"

// Evita múltiplas instâncias do Prisma em desenvolvimento (Next.js Hot Reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    // Removido logs excessivos em produção para evitar poluição
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
