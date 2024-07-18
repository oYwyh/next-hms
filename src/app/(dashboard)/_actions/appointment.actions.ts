'use server'

import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { appointmentTable, prescriptionTable, reservationTable, userTable } from "@/lib/db/schema";
import { TdiagnosisSchema } from "@/app/(dashboard)/types";


export async function createReservation(
    appointmentId: number,
    data: TdiagnosisSchema,
    selectedLaboratory: string[],
    selectedRadiology: string[],
    selectedMedicine: string[]
) {
    const laboratoryText = selectedLaboratory.join(',');
    const radiologyText = selectedRadiology.join(',');
    const medicineText = selectedMedicine.join(',');

    const reservation = await db.insert(reservationTable).values({
        appointmentId: appointmentId,
        history: data.history,
        diagnosis: data.diagnosis,
        laboratory: laboratoryText,
        radiology: radiologyText,
        medicine: medicineText
    }).returning();

    await db.insert(prescriptionTable).values({
        laboratory: '',
        radiology: '',
        medicine: '',
        reservationId: reservation[0].id,
    }).returning();

    if (reservation) {
        return {
            reserved: true,
            reservation: reservation[0]
        }
    }
}

export async function createPrescription(
    appointmentId: string | number,
    reservationId: string | number,
    value: string,
    type: 'laboratory' | 'radiology' | 'medicine',
    last: boolean
) {

    if (last == true) {
        await db.update(appointmentTable)
            .set({
                status: 'completed'
            })
            .where(sql`${appointmentTable.id} = ${appointmentId}`)
            .returning();
    }
    const prescription = await db.update(prescriptionTable)
        .set({
            [type]: value
        })
        .where(sql`${prescriptionTable.reservationId} = ${reservationId}`).returning();


    if (prescription) {
        revalidatePath(`/doctor/appointments`);
        return {
            done: true
        }
    } else {
        throw new Error('Failed to create prescription');
    }
}

export async function cancel(
    appointmentId: string | number
) {
    const { user } = await validateRequest()
    console.log('a7a')
    const appointment = await db.delete(appointmentTable).where(
        sql`${appointmentTable.id} = ${appointmentId}`
    )

    if (appointment) {
        if (user?.role === 'user') {
            revalidatePath('/user/appointments');
        }
        if (user?.role === 'doctor') {
            revalidatePath('/doctor/appointments');
        }
        if (user?.role === 'admin') {
            revalidatePath('/admin/appointments');
        }
        return {
            canceled: true
        }
    }
}