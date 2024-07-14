'use server'

import { TnameSchema } from "@/components/ui/custom/Name";
import db from "@/lib/db"
import { appointmentTable, userMedicalFoldersTable, userTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function book(
    userId: string,
    doctorId: string,
    date: string,
    from: string,
    to: string
) {
    const appointment = await db.insert(appointmentTable).values({
        user_id: userId,
        doctor_id: doctorId,
        date: date,
        from: from,
        to: to
    }).returning();

    if (appointment) {
        return {
            reserved: true,
            appointment: appointment[0]
        }
    }
}

export async function appointmentDetails(
    appointmentId: string | number | undefined
) {
    const appointment = await db.query.appointmentTable.findFirst({
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    const user = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${appointment?.user_id}`
    })

    const doctor = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${appointment?.doctor_id}`,
        with: {
            doctor: true,
        }
    })

    if (!doctor || !user || !appointment) throw new Error('Failed to get appointment details');

    return {
        appointment,
        user,
        doctor
    }
}

export async function cancel(
    appointmentId: string | number
) {
    console.log('a7a')
    const appointment = await db.delete(appointmentTable).where(
        sql`${appointmentTable.id} = ${appointmentId}`
    )

    if (appointment) {
        revalidatePath('/user/appointments');
        return {
            canceled: true
        }
    }
}

export async function createFolder(
    data: TnameSchema,
    userId: string
) {

    if (!userId) throw new Error('Unauthorized');

    const exist = await db.query.userMedicalFoldersTable.findFirst({
        columns: { name: true },
        where: (userMedicalFoldersTable: { [key: string]: any }, { eq }) => eq(userMedicalFoldersTable.name, data.name),
    });

    if (exist) return { error: 'Folder already exists' }

    const folder = await db.insert(userMedicalFoldersTable).values({
        name: data.name,
        userId: userId,
    }).returning();

    revalidatePath('/user/files')

    return {
        folder: folder,
        created: true
    }
}

export async function deleteFolder(
    folderId: number
) {
    const folder = await db.delete(userMedicalFoldersTable).where(
        sql`${userMedicalFoldersTable.id} = ${folderId}`
    )

    if (folder) {
        revalidatePath('/user/files')
        return {
            deleted: true
        }
    }
}