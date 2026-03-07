import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const role = String((session.user as any)?.role || "").toUpperCase();
    const email = (session.user?.email || "").toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/"/g, "").trim().toLowerCase();

    const isActuallyAdmin = role === "ADMIN" ||
        email === adminEmail ||
        email === "bezerraborges@gmail.com" ||
        email.includes("bezerraborges");

    if (isActuallyAdmin) {
        redirect("/admin/dashboard");
    } else {
        redirect("/funnels");
    }
}
