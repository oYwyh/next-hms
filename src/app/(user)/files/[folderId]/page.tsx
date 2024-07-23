import Files from "@/app/(user)/files/[folderId]/Files"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { userMedicalFoldersTable } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function FilesPage({ params: { folderId } }: { params: { folderId: number } }) {
    const { user } = await validateRequest()
    if (!user) redirect('/auth')

    const folderOwner = await db.select().from(userMedicalFoldersTable).where(
        and(eq(userMedicalFoldersTable.id, folderId), eq(userMedicalFoldersTable.userId, user.id))
    )

    const isFolderOwner = folderOwner.length > 0

    if (!isFolderOwner) redirect('/files')

    return (
        <>
            {isFolderOwner && (
                <Files folderId={folderId} />
            )}
        </>
    )
}