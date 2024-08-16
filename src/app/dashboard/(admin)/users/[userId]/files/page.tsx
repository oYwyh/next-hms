import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { userMedicalFoldersTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Folders from "@/app/_components/Files/Folders";


const getFolders = async (userId: string) => {
    const folders = await db.query.userMedicalFoldersTable.findMany({
        with: {
            files: true
        },
        where: sql`${userMedicalFoldersTable.userId} = ${userId}`,
    })

    return folders;
}

export default async function UserFilesPage({ params: { userId } }: { params: { userId: string } }) {
    const { user } = await validateRequest();
    if (!user) return redirect('/auth/login');
    const folders = await getFolders(userId);

    return (
        <>
            <Folders folders={folders} userId={userId} />
        </>
    )
}