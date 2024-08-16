import Files from "@/app/_components/Files/Files"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { userMedicalFoldersTable } from "@/lib/db/schema"
import { and, eq, not, sql } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function FilesPage({ params: { folderId, userId } }: { params: { folderId: number, userId: string } }) {
    const { user } = await validateRequest()
    if (!user) redirect('/auth')

    const folderOwner = await db.select().from(userMedicalFoldersTable).where(
        and(eq(userMedicalFoldersTable.id, folderId), eq(userMedicalFoldersTable.userId, user.id))
    )

    const isFolderOwner = folderOwner.length > 0

    if (!isFolderOwner && user.role == 'user') redirect('/files')

    return (
        <>
            <Files folderId={folderId} userId={userId} />
        </>
    )
}