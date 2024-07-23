'use server'

import { TnameSchema } from "@/components/ui/custom/Name";
import db from "@/lib/db"
import { appointmentTable, doctorTable, reviewTable, userMedicalFilesTable, userMedicalFoldersTable, userTable } from "@/lib/db/schema";
import { deleteFiles } from "@/lib/r2";
import { and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function appointmentDetails(
    appointmentId: string | number | undefined
) {
    const appointment = await db.query.appointmentTable.findFirst({
        where: sql`${appointmentTable.id} = ${appointmentId}`
    })

    const user = await db.query.userTable.findFirst({
        where: sql`${userTable.id} = ${appointment?.userId}`
    })

    const doctor = await db.query.doctorTable.findFirst({
        where: sql`${doctorTable.id} = ${appointment?.doctorId}`,
    })

    if (!doctor || !user || !appointment) throw new Error('Failed to get appointment details');

    return {
        appointment,
        user,
        doctor
    }
}

export async function createFolder(
    data: TnameSchema,
    userId: string
) {

    if (!userId) throw new Error('Unauthorized');

    const exist = await db.query.userMedicalFoldersTable.findFirst({
        columns: { name: true },
        where: (userMedicalFoldersTable: { [key: string]: any }, { eq }) => and(
            eq(userMedicalFoldersTable.userId, userId),
            eq(userMedicalFoldersTable.name, data.name)
        ),
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
    const files = await db.select().from(userMedicalFilesTable).where(
        sql`${userMedicalFilesTable.folderId} = ${folderId}`
    );

    const filesToDelete = files.map((file) => {
        return file.name;
    });

    if (filesToDelete.length > 0) {
        console.log('filesToDelete', filesToDelete);
        await deleteFiles(filesToDelete, true);
    }

    const folder = await db.delete(userMedicalFoldersTable).where(
        sql`${userMedicalFoldersTable.id} = ${folderId}`
    );

    if (folder || filesToDelete.length > 0) {
        revalidatePath('/user/files');
        return {
            deleted: true
        };
    }

    return {
        deleted: false
    };
}
