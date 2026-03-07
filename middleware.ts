import { auth } from "./src/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const pathname = req.nextUrl.pathname

    console.log("MIDDLEWARE_CHECK:", { pathname, isLoggedIn, user: req.auth?.user?.email, role: (req.auth?.user as any)?.role })

    const isDashboardPage = pathname.startsWith("/dashboard")
    const isAdminPage = pathname.startsWith("/admin")
    const isAuthPage = pathname.startsWith("/auth")
    const isFormPage = pathname.startsWith("/form")
    const isFunnelsPage = pathname.startsWith("/funnels")

    if (isAdminPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))

        const userEmail = (req.auth?.user?.email || "").toLowerCase().trim()
        const isActuallyAdmin = (req.auth?.user as any)?.role === "ADMIN" || userEmail === "bezerraborges@gmail.com";

        if (!isActuallyAdmin) {
            return NextResponse.redirect(new URL("/funnels", req.nextUrl))
        }
        return NextResponse.next()
    }

    if (isDashboardPage || isFormPage || isFunnelsPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
        return NextResponse.next()
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*", "/form/:path*", "/funnels/:path*"],
}

