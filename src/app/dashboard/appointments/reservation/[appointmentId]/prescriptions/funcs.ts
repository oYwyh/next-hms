import { prescriptions } from "@/constants";
import db from "@/lib/db";
import { appointmentTable, prescriptionTable, reservationTable, userTable } from "@/lib/db/schema";
import { TIndex, TReservation } from "@/types/index.types";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export const getInfo = async (appointmentId: number) => {
    const appointment = await db.query.appointmentTable.findFirst({
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    if (appointment == null) throw new Error('Failed to get appointment info');

    const patient = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${appointment?.userId}`
    })

    const reservation: any & TIndex<any> = await db.query.reservationTable.findFirst({
        where: sql`${reservationTable.appointmentId} = ${appointmentId}`
    })

    const prescription: any & TIndex<any> = await db.query.prescriptionTable.findFirst({
        where: sql`${prescriptionTable.reservationId} = ${reservation?.id}`
    })

    if (appointment.status === 'completed') return redirect('/dashboard/appointments')
    if (!patient || !reservation) throw new Error('Failed to get appointment info')

    // Mapping from prescription keys to reservation keys
    const keyMapping: Record<string, string> = {
        laboratory: 'laboratories',
        radiology: 'radiologies',
        medicine: 'medicines'
    };

    const test = Object.keys(reservation).filter(key => {
        return Object.values(keyMapping).includes(key) && reservation[key] != '';
    });

    const test2 = Object.keys(prescription).filter(key => {
        return ['laboratory', 'radiology', 'medicine'].includes(key) && prescription[key] == '';
    });

    // Combine test2 and filter out keys whose mapped reservation key doesn't exist in test
    const existingPrescriptions = test2.filter(key => {
        return test.includes(keyMapping[key]);
    });

    return {
        patient,
        reservation,
        prescription,
        existingPrescriptions
    };
}