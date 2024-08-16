import { DataTable } from "@/components/ui/table/DataTable";
import db from "@/lib/db";
import { appointmentTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { AppointmentTableColumns } from "@/app/_components/appointment/columns";
import { validateRequest } from "@/lib/auth";
import { useGetUser } from "@/hooks/useGetUser";

async function getData() {
    const user = await useGetUser();

    const appointments = await db.query.appointmentTable.findMany({
        where: user?.role === 'admin'
            ? sql`TRUE` // This will fetch all appointments
            : sql`${user?.role === 'user' ? appointmentTable.userId : Number(appointmentTable.doctorId)} = ${user?.role === 'user' ? user?.id : Number(user?.id)}`,
        with: {
            user: {
                columns: {
                    firstname: true,
                    lastname: true,
                }
            },
            doctor: {
                columns: {
                    userId: true,
                },
                with: {
                    user: {
                        columns: {
                            id: true,
                            firstname: true,
                            lastname: true,
                        }
                    }
                }
            }
        }
    });

    const mergedAppointments = appointments.map((appointment) => {
        const mergedAppointment = {
            id: appointment?.id,
            userId: appointment?.userId,
            doctorId: appointment?.doctorId,
            doctorUserId: appointment?.doctor.user.id,
            date: appointment?.date,
            time: `${appointment?.from} - ${appointment?.to}`,
            patientName: appointment?.user.firstname + ' ' + appointment?.user.lastname,
            doctorName: appointment?.doctor.user.firstname + ' ' + appointment?.doctor.user.lastname,
            status: appointment?.status
        };
        return mergedAppointment;
    });

    return mergedAppointments;
}

export default async function ManageAppointmentsPage() {
    const data = await getData()

    return (
        <div>
            <DataTable
                columns={AppointmentTableColumns}
                data={data}
                search="doctorName"
                hiddenColumns={['id', 'userId', 'doctorId']}
                restrictedColumns={['userId', 'doctorId']}
            />
        </div>
    )
}