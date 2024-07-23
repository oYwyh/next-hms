import ReceptionistPage from "@/app/dashboard/_components/receptionist/Page";
import AdminPage from "@/app/dashboard/_components/admin/Page";
import DoctorPage from "@/app/dashboard/_components/doctor/Page";
import { validateRequest } from "@/lib/auth";
import { TUser } from "@/types/index.types";
import { redirect } from "next/navigation";
import { use } from "react";

export default async function DashboardPage() {
    const { user } = await validateRequest()

    if (!user) return redirect('/auth')


    return (
        <>
            {user.role == 'admin' && <AdminPage />}
            {user.role == 'doctor' && <DoctorPage />}
            {user.role == 'receptionist' && <ReceptionistPage />}
        </>
    )
}