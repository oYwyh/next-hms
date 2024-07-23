import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = await validateRequest();

    if (!user || user.role == "user") {
        redirect("/");
    }

    return (
        <>
            {children}
        </>
    );
}