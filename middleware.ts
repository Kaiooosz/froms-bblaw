import { auth } from "./src/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const pathname = req.nextUrl.pathname

    // 1. SILENT ROOT REDIRECT
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/funnels", req.nextUrl))
    }

    const isAdminPage = pathname.startsWith("/admin")
    const isFormPage = pathname.startsWith("/form")
    const isFunnelsPage = pathname.startsWith("/funnels")

    // 2. ADMIN PROTECTION
    if (isAdminPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))

        const userEmail = (req.auth?.user?.email || "").toLowerCase().trim()
        const isActuallyAdmin = (req.auth?.user as any)?.role === "ADMIN" || userEmail === "bezerraborges@gmail.com";

        if (!isActuallyAdmin) {
            return NextResponse.redirect(new URL("/funnels", req.nextUrl))
        }
    }

    // 3. AUTH PROTECTION
    if (isFormPage || isFunnelsPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/", "/admin/:path*", "/auth/:path*", "/form/:path*", "/funnels/:path*"],
}

