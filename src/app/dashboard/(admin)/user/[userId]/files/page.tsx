import Test from "@/app/dashboard/(admin)/user/[userId]/files/Test";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { userMedicalFoldersTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";


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
    const folders = await getFolders(userId);

    console.log(folders)

    return (
        <>
            <Test folders={folders} userId={userId} />
        </>
    )
}