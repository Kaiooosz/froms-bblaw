import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const role = String((session.user as any)?.role || "").toUpperCase();
    const email = (session.user?.email || "").toLowerCase().trim();

    // Master Admin Detection
    const isActuallyAdmin = role === "ADMIN" || email === "bezerraborges@gmail.com";

    if (isActuallyAdmin) {
        redirect("/admin/dashboard");
    } else {
        redirect("/funnels");
    }
}
