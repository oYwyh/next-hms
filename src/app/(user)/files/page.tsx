import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { userMedicalFoldersTable } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Test from "./Test";


const getFolders = async (userId: string) => {
    const folders = await db.query.userMedicalFoldersTable.findMany({
        with: {
            files: true
        },
        where: sql`${userMedicalFoldersTable.userId} = ${userId}`,
    })

    return folders;
}

export default async function UserFilesPage() {
    const { user } = await validateRequest();
    if (!user) return redirect('/auth/login');
    const folders = await getFolders(user.id);

    return (
        <>
            <Test folders={folders} userId={user.id} />
        </>
    )
}