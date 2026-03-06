import { auth } from "./src/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard")
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin")
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isFormPage = req.nextUrl.pathname.startsWith("/form")

    if (isAdminPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
        if ((req.auth?.user as any)?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
        }
        return NextResponse.next()
    }

    if (isDashboardPage || isFormPage) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
        return NextResponse.next()
    }

    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*", "/form/:path*"],
}

