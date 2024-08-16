'use server'

import { TnameSchema } from "@/components/ui/custom/Name";
import db from "@/lib/db"
import { appointmentTable, doctorTable, reviewTable, userMedicalFilesTable, userMedicalFoldersTable, userTable } from "@/lib/db/schema";
import { deleteFile } from "@/lib/r2";
import { and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";


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

    await Promise.all(files.map(async (file) => {
        await deleteFile({ name: file.name, s3: true, table: 'userFiles', id: file.id });
    }));


    const folder = await db.delete(userMedicalFoldersTable).where(
        sql`${userMedicalFoldersTable.id} = ${folderId}`
    );

    if (folder) {
        revalidatePath('/user/files');
        return {
            deleted: true
        };
    }

    return {
        deleted: false
    };
}
