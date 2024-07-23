import Files from "@/app/dashboard/(admin)/user/[userId]/files/[folderId]/Files"
import { validateRequest } from "@/lib/auth"
import db from "@/lib/db"
import { userMedicalFoldersTable } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function FilesPage({ params: { userId, folderId } }: { params: { userId: string, folderId: number } }) {
    const { user } = await validateRequest()
    if (!user) redirect('/auth')

    return (
        <>
            <Files folderId={folderId} userId={userId} />
        </>
    )
}