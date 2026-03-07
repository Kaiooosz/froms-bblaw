import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const role = (session.user as any)?.role;
    if (role === "ADMIN") {
        redirect("/admin/dashboard");
    } else {
        redirect("/funnels");
    }
}
