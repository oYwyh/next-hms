'use server'

import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { appointmentTable, doctorTable, prescriptionTable, receiptTable, reservationTable, userTable } from "@/lib/db/schema";
import { TdiagnosisSchema } from "@/types/dashboard.types";
import { TDepartments, UserRoles } from "@/types/index.types";

export async function book({
    userId,
    doctorId,
    date,
    from,
    to,
    department = 'opd'
}: {
    userId: string,
    doctorId: number,
    date: string,
    from: string,
    to: string,
    department?: TDepartments
}) {
    const appointment = await db.insert(appointmentTable).values({
        userId: userId,
        doctorId: doctorId,
        date: date,
        from: from,
        to: to,
        department
    }).returning();

    if (appointment) {
        return {
            reserved: true,
            appointment: appointment[0]
        }
    }
}

export async function createReservation({
    appointmentId,
    data,
    laboratories,
    radiologies,
    medicines
}: {
    appointmentId: number,
    data: TdiagnosisSchema,
    laboratories: string[],
    radiologies: string[],
    medicines: string[]
}) {
    const laboratoryText = laboratories.join(',');
    const radiologyText = radiologies.join(',');
    const medicineText = medicines.join(',');

    const reservation = await db.insert(reservationTable).values({
        appointmentId: appointmentId,
        history: data.history,
        diagnosis: data.diagnosis,
        laboratories: laboratoryText,
        radiologies: radiologyText,
        medicines: medicineText
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

export async function createPrescription({
    appointmentId,
    reservationId,
    name,
    type,
    last
}: {
    appointmentId: string | number,
    reservationId: string | number,
    name: string,
    type: 'laboratory' | 'radiology' | 'medicine',
    last: boolean
}) {

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
            [type]: name
        })
        .where(sql`${prescriptionTable.reservationId} = ${reservationId}`).returning();


    if (prescription) {
        revalidatePath(`/dashboard/appointments`);
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

