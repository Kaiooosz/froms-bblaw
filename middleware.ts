import { auth } from "./src/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const pathname = req.nextUrl.pathname
    const userRole = (req.auth?.user as any)?.role || "CLIENT"
    const userEmail = (req.auth?.user?.email || "").toLowerCase().trim()
    const isActuallyAdmin = userRole === "ADMIN" || userEmail === "bezerraborges@gmail.com"

    // 1. SILENT ROOT REDIRECT
    if (pathname === "/") {
        if (isLoggedIn && isActuallyAdmin) {
            return NextResponse.redirect(new URL("/admin", req.nextUrl))
        }
        return NextResponse.redirect(new URL("/funnels", req.nextUrl))
    }

    const isAdminPage = pathname.startsWith("/admin")
    const isFormPage = pathname.startsWith("/form")
    const isFunnelsPage = pathname.startsWith("/funnels")

    // 2. ADMIN-ONLY PROTECTION
    // Se o usuário é ADMIN e está em áreas de CLIENTE, manda pra ADMIN
    if (isLoggedIn && isActuallyAdmin && (isFunnelsPage || isFormPage)) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl))
    }

    // 3. CLIENT-ONLY PROTECTION (Bloqueia quem não é admin de entrar em /admin)
    if (isAdminPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
        if (!isActuallyAdmin) {
            return NextResponse.redirect(new URL("/funnels", req.nextUrl))
        }
    }

    // 4. AUTH PROTECTION (CLIENT AREAS)
    if ((isFormPage || isFunnelsPage) && !isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/", "/admin/:path*", "/auth/:path*", "/form/:path*", "/funnels/:path*"],
}

