import AdminPage from "@/app/(dashboard)/dashboard/(admin)/page";
import DoctorPage from "@/app/(dashboard)/dashboard/(doctor)/page";
import { validateRequest } from "@/lib/auth";
import { TUser } from "@/lib/types";
import { redirect } from "next/navigation";
import { use } from "react";

export default async function DashboardPage() {
    const { user } = await validateRequest()

    if (!user) return redirect('/auth/login')

    return (
        <>
            {user.role == 'admin' && <AdminPage />}
            {user.role == 'doctor' && <DoctorPage />}
        </>
    )
}