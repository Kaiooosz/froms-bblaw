import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function test() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "amborgesvinicius@gmail.com"
        const adminPass = process.env.ADMIN_PASSWORD || "Bitcoin2026*"

        console.log("Checking Admin Credentials from ENV:")
        console.log(`Email: ${adminEmail}`)
        console.log(`Password length: ${adminPass.length}`)

        const userCount = await prisma.user.count()
        console.log(`Connection test: User count = ${userCount}`)

        // Testing bcrypt
        const testHash = await bcrypt.hash("test123", 10)
        const match = await bcrypt.compare("test123", testHash)
        console.log(`Bcrypt test: ${match ? "PASS" : "FAIL"}`)

    } catch (err) {
        console.error("Test failed:", err)
    } finally {
        await prisma.$disconnect()
    }
}

test()
