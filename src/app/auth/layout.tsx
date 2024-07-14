import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = await validateRequest();

    if (user?.role == 'admin') redirect("/admin")
    if (user?.role == 'doctor') redirect("/doctor")
    if (user?.role == "user") redirect("user")

    return children;
}