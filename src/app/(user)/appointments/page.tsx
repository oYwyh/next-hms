import ManageAppointmentsPage from "@/app/_components/appointment/ManageAppointments";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AppointmentsPage() {
    return (
        <>
            <Button>
                <Link href={'/book'}>Book an appointment</Link>
            </Button>
            <ManageAppointmentsPage />
        </>
    )
}