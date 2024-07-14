import db from "@/lib/db";
import { userMedicalFilesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params: { folderId } }: { params: { folderId: number } }) {

    const files = await db.select().from(userMedicalFilesTable).where(eq(userMedicalFilesTable.folderId, folderId));

    return NextResponse.json(files)
}