import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
    const session = await auth();
    console.log("DASHBOARD_ROUTER_SESSION:", !!session, session?.user?.email, (session?.user as any)?.role);

    if (!session) {
        console.log("DASHBOARD_ROUTER: NO SESSION, REDIRECTING TO SIGNIN");
        redirect("/auth/signin");
    }

    const role = String((session.user as any)?.role || "").toUpperCase();
    const email = (session.user?.email || "").toLowerCase().trim();

    // Master Admin Detection
    const isActuallyAdmin = role === "ADMIN" || email === "bezerraborges@gmail.com";
    console.log("DASHBOARD_ROUTER_DECISION:", { email, role, isActuallyAdmin });

    if (isActuallyAdmin) {
        redirect("/admin/dashboard");
    } else {
        redirect("/funnels");
    }
}
