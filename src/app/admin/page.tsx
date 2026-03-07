import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
    const session = await auth()

    // 1. VERIFICAÇÃO DE SESSÃO
    if (!session || !session.user) {
        redirect("/auth/signin")
    }

    // 2. VERIFICAÇÃO DE ROLE (ADMIN)
    const userEmail = (session.user.email || "").toLowerCase().trim()
    const isAdmin = (session.user as any).role === "ADMIN" || userEmail === "bezerraborges@gmail.com"

    if (!isAdmin) {
        redirect("/funnels")
    }

    // 3. SE É ADMIN, MANDA PARA O DASHBOARD
    redirect("/admin/dashboard")

    return null
}
