import { DataTable } from "@/components/ui/table/DataTable";
import db from "@/lib/db";
import { useGetUser } from "@/hooks/userHooks";
import { appointmentTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { AppointmentTableColumns } from "./appointmentColumns";

async function getData() {
    const user = await useGetUser();

    const appointments = await db.query.appointmentTable.findMany({
        where: sql`${user?.role == 'user' ? appointmentTable.user_id : appointmentTable.doctor_id} = ${user?.id}`,
        with: {
            user: {
                columns: {
                    firstname: true,
                    lastname: true,
                }
            },
            doctor: {
                columns: {
                    user_id: true,
                },
                with: {
                    user: {
                        columns: {
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
            userId: appointment?.user_id,
            doctorId: appointment?.doctor_id,
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
                hiddenColumns={['userId', 'doctorId']}
                restrictedColumns={['userId', 'doctorId']}
            />
        </div>
    )
}