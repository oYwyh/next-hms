import { Button } from "@/components/ui/Button";
import Link from "next/link";
import ManageAppointmentsPage from "../../_components/ManageAppointments";

export default function AppointmentsPage() {
    return (
        <>
            <Link href="/user/booking">
                <Button>
                    Book Appointment
                </Button>
            </Link>
            <ManageAppointmentsPage />
        </>
    )
}