import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const role = (session.user as any)?.role;
    const email = session.user?.email?.toLowerCase() || "";
    const adminEmail = (process.env.ADMIN_EMAIL || "").replace(/"/g, "").trim().toLowerCase();

    if (role === "ADMIN" || email === adminEmail || email === "bezerraborges@gmail.com") {
        redirect("/admin/dashboard");
    } else {
        redirect("/funnels");
    }
}
