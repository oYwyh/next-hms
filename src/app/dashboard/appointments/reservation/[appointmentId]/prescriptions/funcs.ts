import db from "@/lib/db";
import { appointmentTable, prescriptionTable, reservationTable, userTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getInfo = async (appointmentId: string | number) => {
    const appointment = await db.query.appointmentTable.findFirst({
        columns: {
            userId: true,
            doctorId: true,
            status: true
        },
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    if (appointment == null) throw new Error('Failed to get appointment info');

    const patient = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${appointment?.userId}`
    })

    const reservation = await db.query.reservationTable.findFirst({
        where: sql`${reservationTable.appointmentId} = ${appointmentId}`
    })


    const prescription = await db.query.prescriptionTable.findFirst({
        where: sql`${prescriptionTable.reservationId} = ${reservation?.id}`
    })

    if (appointment.status === 'completed') return redirect('/dashboard/appointments')

    if (!patient || !reservation) throw new Error('Failed to get appointment info');

    return {
        patient,
        reservation,
        prescription,
    };
}